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

async function getCsrfAndCookies(extraCookies = "") {
  const res = await fetch(`${BASE}/api/auth/csrf`, {
    headers: { Cookie: extraCookies },
  });
  const setCookies = res.headers.getSetCookie?.() || [];
  const body = await res.json();
  const cookieHeader = setCookies.map(c => c.split(";")[0]).join("; ");
  return { csrfToken: body.csrfToken, cookies: cookieHeader || extraCookies };
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
  // Merge with previous cookies
  const merged = mergeCookies(cookies, allCookies);
  return merged;
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

async function getSession(cookies) {
  const res = await fetch(`${BASE}/api/auth/session`, { headers: { Cookie: cookies } });
  return res.json();
}

async function main() {
  console.log("========================================");
  console.log("  FASE 2 — PRUEBAS OBLIGATORIAS");
  console.log("========================================\n");

  // --- TEST 1 ---
  console.log("TEST 1: Public services API");
  const services = await (await fetch(`${BASE}/api/services`)).json();
  assert("GET /api/services returns ≥ 2 services", "true", String(services.length >= 2));

  // --- TEST 2 ---
  console.log("TEST 2: Availability on Monday (work day)");
  const now = new Date();
  const dayOfWeek = now.getDay();
  const diffToMonday = dayOfWeek === 0 ? 1 : 8 - dayOfWeek;
  const nextMonday = new Date(now);
  nextMonday.setDate(now.getDate() + diffToMonday);
  const mondayDate = nextMonday.toISOString().split("T")[0];
  const monday = await (await fetch(`${BASE}/api/schedules/availability?date=${mondayDate}`)).json();
  assert("Monday is a work day", "true", String(monday.isWorkDay));
  assert("Monday has 8 slots (4 morning + 4 afternoon)", "8", monday.slots.length);
  const availableSlots = monday.slots.filter(s => s.available);
  assert("All Monday slots available", "8", availableSlots.length);

  // --- TEST 3 ---
  console.log("TEST 3: Availability on Sunday (non-work day)");
  const sunday = await (await fetch(`${BASE}/api/schedules/availability?date=2026-09-13`)).json();
  assert("Sunday is NOT a work day", "false", String(sunday.isWorkDay));
  assert("Sunday has 0 slots", "0", sunday.slots.length);

  // --- TEST 4 ---
  console.log("TEST 4: Unauthenticated /citas redirects to login");
  const redir = await fetch(`${BASE}/citas`, { redirect: "manual" });
  assert("GET /citas without auth → 307 redirect", "307", redir.status);

  // --- TEST 5 ---
  console.log("TEST 5: Unauthenticated /admin/citas redirects to login");
  const redirAdmin = await fetch(`${BASE}/admin/citas`, { redirect: "manual" });
  assert("GET /admin/citas without auth → 307 redirect", "307", redirAdmin.status);

  // --- TEST 6 ---
  console.log("TEST 6: /solicitar is PUBLIC");
  const solicitar = await fetch(`${BASE}/solicitar`);
  assert("GET /solicitar → 200", "200", solicitar.status);

  // --- TEST 7 ---
  console.log("TEST 7: /servicios is PUBLIC");
  const servicios = await fetch(`${BASE}/servicios`);
  assert("GET /servicios → 200", "200", servicios.status);

  // --- TEST 8 ---
  console.log("TEST 8: Login as admin");
  const adminCookies = await loginAs("admin@innovarsecurity.com", "admin123456");
  const adminSession = await getSession(adminCookies);
  const adminId = adminSession?.user?.id || "";
  assert("Admin session active", "true", String(!!adminId));
  console.log(`  Admin ID: ${adminId.slice(0, 8)}...`);

  // --- TEST 9 ---
  console.log("TEST 9: Register a test client");
  const testClientEmail = `test2-${Date.now()}@test.com`;
  const regRes = await fetch(`${BASE}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Cliente Test",
      email: testClientEmail,
      phone: "3001234567",
      password: "test123456",
    }),
  });
  const regBody = await regRes.json();
  const regSuccess = regBody.message === "Cuenta creada exitosamente" || regRes.status === 200 || String(regBody.message).toLowerCase().includes("exist");
  assert("Register client → success", "true", String(regSuccess));

  // --- TEST 10 ---
  console.log("TEST 10: Client creates appointment");
  const clientCookies = await loginAs(testClientEmail, "test123456");
  const clientSession = await getSession(clientCookies);
  assert("Client session active", "true", String(!!clientSession?.user?.id));

  const serviceId = services[0].id;
  const apptRes = await fetch(`${BASE}/api/citas`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: clientCookies,
    },
    body: JSON.stringify({
      serviceId,
      scheduledDate: "2026-10-15",
      startTime: "08:00",
      endTime: "09:00",
      locationAddress: "Calle 123, Fomeque",
    }),
  });
  const appt = await apptRes.json();
  assert("Client creates appointment → PENDING", "PENDING", appt.status);
  const apptId = appt.id;
  console.log(`  Appointment ID: ${apptId.slice(0, 8)}...`);

  // --- TEST 11 ---
  console.log("TEST 11: Double booking prevention");
  const dupRes = await fetch(`${BASE}/api/citas`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: clientCookies,
    },
    body: JSON.stringify({
      serviceId,
      scheduledDate: "2026-10-15",
      startTime: "08:00",
      endTime: "09:00",
      locationAddress: "Otra direccion",
    }),
  });
  const dupBody = await dupRes.json();
  assert("Double booking returns error", "true", String(!!dupBody.error));
  assertContains("Error mentions 'disponible'", "disponible", dupBody.error || "");

  // --- TEST 12 ---
  console.log("TEST 12: Client cannot access other client's appointment");
  // Register another client
  const testClient2Email = `otro2-${Date.now()}@test.com`;
  const reg2Res = await fetch(`${BASE}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Otro Cliente",
      email: testClient2Email,
      phone: "3009876543",
      password: "test123456",
    }),
  });
  const reg2Body = await reg2Res.json();
  const reg2Success = reg2Body.message === "Cuenta creada exitosamente" || reg2Res.status === 200 || String(reg2Body.message).toLowerCase().includes("exist");
  const client2Cookies = await loginAs(testClient2Email, "test123456");
  const otherRes = await fetch(`${BASE}/api/citas/${apptId}`, {
    headers: { Cookie: client2Cookies },
  });
  assert("Other client gets 403", "403", otherRes.status);

  // --- TEST 13 ---
  console.log("TEST 13: Client lists only their own appointments");
  const myAppts = await (await fetch(`${BASE}/api/citas`, { headers: { Cookie: clientCookies } })).json();
  assert("Client has 1 appointment", "1", myAppts.length);
  const otherAppts = await (await fetch(`${BASE}/api/citas`, { headers: { Cookie: client2Cookies } })).json();
  assert("Other client has 0 appointments", "0", otherAppts.length);

  // --- TEST 14 ---
  console.log("TEST 14: Admin confirms appointment");
  const confirmRes = await fetch(`${BASE}/api/admin/citas/${apptId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Cookie: adminCookies,
    },
    body: JSON.stringify({ status: "CONFIRMED", adminNotes: "Revisado" }),
  });
  const confirmBody = await confirmRes.json();
  assert("Admin confirms → CONFIRMED", "CONFIRMED", confirmBody.status);

  // --- TEST 15 ---
  console.log("TEST 15: History records changes");
  const detail1 = await (await fetch(`${BASE}/api/citas/${apptId}`, { headers: { Cookie: clientCookies } })).json();
  const histCount = detail1.historyItems?.length || 0;
  assert("History has ≥2 entries (CREATED + STATUS_CHANGED)", "true", String(histCount >= 2));

  // --- TEST 16 ---
  console.log("TEST 16: Client requests reprogramming");
  const reprogRes = await fetch(`${BASE}/api/citas/${apptId}/reprogram`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: clientCookies,
    },
    body: JSON.stringify({ newDate: "2026-10-16", newTime: "10:00", reason: "No me queda el horario" }),
  });
  const reprogBody = await reprogRes.json();
  assert("Reprogram request → PENDING", "PENDING", reprogBody.status);

  const detailAfterReprog = await (await fetch(`${BASE}/api/citas/${apptId}`, { headers: { Cookie: clientCookies } })).json();
  assert("Appointment status → REPROGRAM_REQUESTED", "REPROGRAM_REQUESTED", detailAfterReprog.status);

  // --- TEST 17 ---
  console.log("TEST 17: Admin approves reprogramming");
  const approveRes = await fetch(`${BASE}/api/admin/citas/${apptId}/reprogram/respond`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: adminCookies,
    },
    body: JSON.stringify({ approve: true, adminNotes: "Aprobado" }),
  });
  const approveBody = await approveRes.json();
  assert("Admin approves → REPROGRAMMED", "REPROGRAMMED", approveBody.status);

  // --- TEST 18 ---
  console.log("TEST 18: Blocked day cannot be reserved");
  const blockedDay = await (await fetch(`${BASE}/api/schedules/availability?date=2026-12-25`)).json();
  assert("Dec 25 (Christmas) is blocked", "true", String(blockedDay.isBlocked));

  // --- TEST 19 ---
  console.log("TEST 19: Admin cancels appointment");
  const cancelRes = await fetch(`${BASE}/api/citas/${apptId}/cancel`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: adminCookies,
    },
  });
  const cancelBody = await cancelRes.json();
  assert("Admin cancels → CANCELLED", "CANCELLED", cancelBody.status);

  // --- TEST 20 ---
  console.log("TEST 20: Complete history");
  const finalDetail = await (await fetch(`${BASE}/api/citas/${apptId}`, { headers: { Cookie: clientCookies } })).json();
  const finalHistCount = finalDetail.historyItems?.length || 0;
  console.log(`  History entries: ${finalHistCount}`);
  finalDetail.historyItems?.forEach((h) => console.log(`    - ${h.action}: ${h.details?.slice(0, 80)}`));
  assert("History has ≥5 entries", "true", String(finalHistCount >= 5));

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
