const BASE = "http://localhost:3000";
let PASS = 0;
let FAIL = 0;

function assert(name, expected, actual) {
  const a = String(actual);
  const e = String(expected);
  if (a === e) {
    console.log(`  ✅ PASS: ${name} (got: ${a})`);
    PASS++;
  } else {
    console.log(`  ❌ FAIL: ${name} (expected: ${e}, got: ${a})`);
    FAIL++;
  }
}

function assertContains(name, needle, haystack) {
  if (String(haystack).includes(needle)) {
    console.log(`  ✅ PASS: ${name}`);
    PASS++;
  } else {
    console.log(`  ❌ FAIL: ${name} (not found: "${needle}" in "${haystack}")`);
    FAIL++;
  }
}

function assertExists(name, val) {
  if (val) {
    console.log(`  ✅ PASS: ${name}`);
    PASS++;
  } else {
    console.log(`  ❌ FAIL: ${name} (falsy value)`);
    FAIL++;
  }
}

async function getCsrfAndCookies(extraCookies = "") {
  const res = await fetch(`${BASE}/api/auth/csrf`, {
    headers: { Cookie: extraCookies },
  });
  const setCookies = res.headers.getSetCookie?.() || [];
  const body = await res.json();
  const cookieHeader = setCookies.map(c => c.split(";")[0]).join("; ");
  return { csrfToken: body.csrfToken, cookies: cookieHeader || extraCookies };
}

function mergeCookies(old, newSet) {
  const map = {};
  for (const c of old.split(";").filter(Boolean)) {
    const [k, ...v] = c.trim().split("=");
    map[k] = v.join("=");
  }
  for (const c of newSet.split(";").filter(Boolean)) {
    const [k, ...v] = c.trim().split("=");
    map[k] = v.join("=");
  }
  return Object.entries(map).map(([k,v]) => `${k}=${v}`).join("; ");
}

async function loginAs(email, password) {
  let { csrfToken, cookies } = await getCsrfAndCookies();
  const res = await fetch(`${BASE}/api/auth/callback/credentials`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Cookie: cookies,
    },
    body: `email=${email}&password=${password}&csrfToken=${csrfToken}`,
    redirect: "manual",
  });
  const setCookies = res.headers.getSetCookie?.() || [];
  const allCookies = setCookies.map(c => c.split(";")[0]).join("; ");
  return mergeCookies(cookies, allCookies);
}

async function getSession(cookies) {
  const res = await fetch(`${BASE}/api/auth/session`, { headers: { Cookie: cookies } });
  return res.json();
}

async function main() {
  console.log("========================================");
  console.log("  PHASE 3 — PAGOS & COTIZACIONES");
  console.log("========================================\n");

  // --- Login as admin ---
  console.log("SETUP: Login as admin");
  const adminCookies = await loginAs("admin@innovarsecurity.com", "admin123456");
  const adminSession = await getSession(adminCookies);
  assertExists("Admin session active", adminSession?.user?.id);

  // Register + login test client
  console.log("SETUP: Register test client");
  await fetch(`${BASE}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "Client P3", email: "clientp3@test.com", phone: "3009998877", password: "test123456" }),
  }).catch(() => {});
  const clientCookies = await loginAs("clientp3@test.com", "test123456");
  const clientSession = await getSession(clientCookies);
  assertExists("Client session active", clientSession?.user?.id);

  // Create appointment for testing
  console.log("SETUP: Create test appointment");
  const services = await (await fetch(`${BASE}/api/services`)).json();
  const serviceId = services[0].id;
  // Use a known weekday far in future; March 3 2027 is Wednesday
  // Use minute-based time to avoid conflicts with previous runs
  const testDate = "2027-03-03";
  const minuteOfDay = 480 + (Date.now() % 240); // 08:00-12:00 range
  const startH = Math.floor(minuteOfDay / 60);
  const startM = minuteOfDay % 60;
  const testStartTime = `${String(startH).padStart(2, "0")}:${String(startM).padStart(2, "0")}`;
  const testEndTime = `${String(startH).padStart(2, "0")}:${String(startM + 30).padStart(2, "0")}`;
  const apptRes = await fetch(`${BASE}/api/citas`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: clientCookies },
    body: JSON.stringify({
      serviceId,
      scheduledDate: testDate,
      startTime: testStartTime,
      endTime: testEndTime,
      locationAddress: "Calle Test 456, Fomeque",
    }),
  });
  const appt = await apptRes.json();
  if (appt.error) {
    console.log(`  ⚠️  Appointment error: ${appt.error}`);
  }
  const apptId = appt.id;
  assert("Appointment created", "PENDING", appt.status);

  // Admin confirms appointment
  await fetch(`${BASE}/api/admin/citas/${apptId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Cookie: adminCookies },
    body: JSON.stringify({ status: "CONFIRMED", adminNotes: "Para pruebas de pago" }),
  });
  console.log("  Appointment confirmed by admin\n");

  // --- TEST 1: Client creates payment ---
  // NOTE: amount is now computed server-side from service price (280000)
  console.log("TEST 1: Client creates payment record");
  const payCreateRes = await fetch(`${BASE}/api/citas/${apptId}/payment`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: clientCookies },
    body: JSON.stringify({ description: "Instalación 4 cámaras" }),
  });
  const payment = await payCreateRes.json();
  assert("Payment created → 201", "201", payCreateRes.status);
  assert("Payment amount = service price (280000)", "280000", payment.amount);
  assert("Payment status = PENDING", "PENDING", payment.status);
  assert("Payment currency = COP", "COP", payment.currency);
  console.log(`  Payment ID: ${payment.id?.slice(0, 8)}...\n`);

  // --- TEST 2: Get payment details ---
  console.log("TEST 2: Get payment by appointment");
  const getPayRes = await fetch(`${BASE}/api/citas/${apptId}/payment`, {
    headers: { Cookie: clientCookies },
  });
  const getPayData = await getPayRes.json();
  assert("GET payment → 200", "200", getPayRes.status);
  assert("Same payment returned", payment.id, getPayData.id);

  // --- TEST 3: Initiate payment (test provider returns PENDING initially) ---
  console.log("TEST 3: Initiate payment with test provider");
  const initiateRes = await fetch(`${BASE}/api/citas/${apptId}/pay`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: clientCookies },
    body: JSON.stringify({ paymentId: payment.id }),
  });
  const initiateData = await initiateRes.json();
  assert("Initiate payment → success", "true", String(initiateData.success));
  assert("Payment status → PENDING (test provider starts pending)", "PENDING", initiateData.status);
  assertExists("Transaction ID present", initiateData.transactionId);
  console.log(`  Transaction: ${initiateData.transactionId}\n`);

  // --- TEST 4: Simulate payment via webhook (test provider uses in-memory state) ---
  console.log("TEST 4: Simulate payment via webhook");
  const webhookRes = await fetch(`${BASE}/api/webhooks/payment`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ transactionId: initiateData.transactionId, status: "PAID" }),
  });
  const webhookData = await webhookRes.json();
  assert("Webhook accepted", "true", String(webhookData.received));
  assert("Webhook status = PAID", "PAID", webhookData.status);

  // --- TEST 6: Verify payment persisted as PAID ---
  console.log("TEST 6: Verify payment status persisted");
  const verifyRes = await fetch(`${BASE}/api/citas/${apptId}/payment`, {
    headers: { Cookie: clientCookies },
  });
  const verifyData = await verifyRes.json();
  assert("Payment status is PAID", "PAID", verifyData.status);
  assert("paidAt is set in DB", "true", String(!!verifyData.paidAt));

  // --- TEST 7: Admin can list appointments ---
  console.log("\nTEST 7: Admin can list appointments");
  const adminApptsRes = await fetch(`${BASE}/api/admin/citas?limit=50`, {
    headers: { Cookie: adminCookies },
  });
  const adminAppts = await adminApptsRes.json();
  assert("Admin gets appointments", "true", String(adminAppts.appointments?.length > 0));

  // --- TEST 8: Admin creates quote ---
  // 4 × 280,000 = 1,120,000; 1 × 450,000 = 450,000; 1 × 120,000 = 120,000
  // Subtotal = 1,690,000; Displacement = 75,000; Total = 1,765,000
  console.log("TEST 8: Admin creates quote for appointment");
  const quoteRes = await fetch(`${BASE}/api/admin/quotes`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: adminCookies },
    body: JSON.stringify({
      appointmentId: apptId,
      items: [
        { description: "Cámara CCTV exterior", quantity: 4, unitPrice: 280000 },
        { description: "NVR 8 canales", quantity: 1, unitPrice: 450000 },
        { description: "Cable UTP Cat6 (100m)", quantity: 1, unitPrice: 120000 },
      ],
      displacement: 75000,
      observations: "Instalación en zona residencial. Incluye cableado y configuración.",
      validDays: 15,
    }),
  });
  const quote = await quoteRes.json();
  assert("Quote created → 201", "201", quoteRes.status);
  assert("Quote status = DRAFT", "DRAFT", quote.status);
  assert("Quote total = 1765000", "1765000", quote.total);
  assertExists("Quote ID present", quote.id);
  assertExists("Quote validUntil set", quote.validUntil);
  console.log(`  Quote ID: ${quote.id?.slice(0, 8)}...\n`);

  // --- TEST 9: Admin sends quote ---
  console.log("TEST 9: Admin sends quote to client");
  const sendRes = await fetch(`${BASE}/api/admin/quotes/${quote.id}/send`, {
    method: "POST",
    headers: { Cookie: adminCookies },
  });
  const sendQuote = await sendRes.json();
  assert("Quote sent → status SENT", "SENT", sendQuote.status);
  assert("sentAt is set", "true", String(!!sendQuote.sentAt));

  // --- TEST 10: Client views quote via client endpoint ---
  console.log("TEST 10: Client views sent quote");
  const clientQuoteRes = await fetch(`${BASE}/api/client/quotes/${quote.id}`, {
    headers: { Cookie: clientCookies },
  });
  const clientQuoteText = await clientQuoteRes.text();
  let clientQuote;
  try { clientQuote = JSON.parse(clientQuoteText); } catch {
    console.log(`  ❌ FAIL: Response is not JSON (${clientQuoteRes.status}): ${clientQuoteText.slice(0, 200)}`);
    FAIL++;
    FAIL++;
    FAIL++;
    return;
  }
  assert("Client can see quote → 200", "200", clientQuoteRes.status);
  assert("Quote has correct total", "1765000", clientQuote.total);
  let items = [];
  try { items = JSON.parse(clientQuote.items); } catch { items = []; }
  assert("Quote has 3 items", "3", items.length);

  // --- TEST 11: Client accepts quote ---
  console.log("TEST 11: Client accepts quote");
  const acceptRes = await fetch(`${BASE}/api/client/quotes/${quote.id}/accept`, {
    method: "POST",
    headers: { Cookie: clientCookies },
  });
  const acceptData = await acceptRes.json();
  assert("Quote accepted → status ACCEPTED", "ACCEPTED", acceptData.status);
  assert("acceptedAt is set", "true", String(!!acceptData.acceptedAt));

  // --- TEST 12: Create and reject a second quote ---
  console.log("\nTEST 12: Create and reject a second quote");
  const quote2Res = await fetch(`${BASE}/api/admin/quotes`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: adminCookies },
    body: JSON.stringify({
      appointmentId: apptId,
      items: [{ description: "Cotización alternativa", quantity: 1, unitPrice: 500000 }],
      validDays: 7,
    }),
  });
  const quote2 = await quote2Res.json();
  console.log(`  Quote2 create response (${quote2Res.status}): ${JSON.stringify(quote2).slice(0, 200)}`);
  await fetch(`${BASE}/api/admin/quotes/${quote2.id}/send`, {
    method: "POST",
    headers: { Cookie: adminCookies },
  });
  const rejectRes = await fetch(`${BASE}/api/client/quotes/${quote2.id}/reject`, {
    method: "POST",
    headers: { Cookie: clientCookies },
  });
  const rejectText = await rejectRes.text();
  let rejectData;
  try { rejectData = JSON.parse(rejectText); } catch {
    console.log(`  ❌ FAIL: Response is not JSON (${rejectRes.status}): ${rejectText.slice(0, 200)}`);
    FAIL++;
    FAIL++;
  }
  if (rejectData) {
    assert("Quote rejected → status REJECTED", "REJECTED", rejectData.status);
    assert("rejectedAt is set", "true", String(!!rejectData.rejectedAt));
  }

  // --- TEST 13: Admin cancels a draft quote ---
  console.log("\nTEST 13: Admin cancels a draft quote");
  const quote3Res = await fetch(`${BASE}/api/admin/quotes`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: adminCookies },
    body: JSON.stringify({
      appointmentId: apptId,
      items: [{ description: "Cotización a cancelar", quantity: 1, unitPrice: 100000 }],
      validDays: 5,
    }),
  });
  const quote3 = await quote3Res.json();
  console.log(`  Quote3 create response (${quote3Res.status}): ${JSON.stringify(quote3).slice(0, 200)}`);
  const cancelQuoteRes = await fetch(`${BASE}/api/admin/quotes/${quote3.id}/cancel`, {
    method: "POST",
    headers: { Cookie: adminCookies },
  });
  const cancelQuoteData = await cancelQuoteRes.json();
  assert("Draft quote cancelled → CANCELLED", "CANCELLED", cancelQuoteData.status);

  // --- TEST 14: Admin lists all quotes ---
  console.log("\nTEST 14: Admin lists all quotes");
  const listQuotesRes = await fetch(`${BASE}/api/admin/quotes`, {
    headers: { Cookie: adminCookies },
  });
  const listQuotes = await listQuotesRes.json();
  assert("Admin gets quote list", "true", String(listQuotes.quotes?.length >= 3));
  assert("Total quotes >= 3", "true", String(listQuotes.pagination?.total >= 3));

  // --- TEST 15: Quote total calculation with displacement ---
  console.log("\nTEST 15: Quote total calculation verified");
  // 3 × 100,000 = 300,000; 2 × 50,000 = 100,000
  // Subtotal = 400,000; Displacement = 25,000; Total = 425,000
  const calcQuoteRes = await fetch(`${BASE}/api/admin/quotes`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: adminCookies },
    body: JSON.stringify({
      appointmentId: apptId,
      items: [
        { description: "Item A", quantity: 3, unitPrice: 100000 },
        { description: "Item B", quantity: 2, unitPrice: 50000 },
      ],
      displacement: 25000,
      validDays: 7,
    }),
  });
  const calcQuote = await calcQuoteRes.json();
  assert("Quote total = 425000", "425000", calcQuote.total);
  assert("Quote subtotal = 400000", "400000", calcQuote.subtotal);

  // --- SUMMARY ---
  console.log("\n========================================");
  console.log(`  RESULTS: ${PASS} passed, ${FAIL} failed`);
  console.log("========================================");

  process.exit(FAIL > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error("Fatal error:", e);
  process.exit(1);
});
