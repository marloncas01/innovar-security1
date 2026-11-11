const BASE = "http://localhost:3000";
let PASS = 0;
let FAIL = 0;

function assert(name, expected, actual) {
  const a = String(actual);
  const e = String(expected);
  if (a === e) { console.log(`  ✅ PASS: ${name} (got: ${a})`); PASS++; }
  else { console.log(`  ❌ FAIL: ${name} (expected: ${e}, got: ${a})`); FAIL++; }
}

function assertExists(name, val) {
  if (val) { console.log(`  ✅ PASS: ${name}`); PASS++; }
  else { console.log(`  ❌ FAIL: ${name} (falsy value)`); FAIL++; }
}

function assertIncludes(name, needle, haystack) {
  if (String(haystack).includes(needle)) { console.log(`  ✅ PASS: ${name}`); PASS++; }
  else { console.log(`  ❌ FAIL: ${name} (not found: "${needle}" in "${haystack}")`); FAIL++; }
}

function mergeCookies(old, newSet) {
  const map = {};
  for (const c of old.split(";").filter(Boolean)) { const [k, ...v] = c.trim().split("="); map[k] = v.join("="); }
  for (const c of newSet.split(";").filter(Boolean)) { const [k, ...v] = c.trim().split("="); map[k] = v.join("="); }
  return Object.entries(map).map(([k, v]) => `${k}=${v}`).join("; ");
}

async function getCsrfAndCookies(extraCookies = "") {
  const res = await fetch(`${BASE}/api/auth/csrf`, { headers: { Cookie: extraCookies } });
  const setCookies = res.headers.getSetCookie?.() || [];
  const body = await res.json();
  const cookieHeader = setCookies.map(c => c.split(";")[0]).join("; ");
  return { csrfToken: body.csrfToken, cookies: cookieHeader || extraCookies };
}

async function loginAs(email, password) {
  let { csrfToken, cookies } = await getCsrfAndCookies();
  const res = await fetch(`${BASE}/api/auth/callback/credentials`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", Cookie: cookies },
    body: `email=${email}&password=${password}&csrfToken=${csrfToken}`,
    redirect: "manual",
  });
  const setCookies = res.headers.getSetCookie?.() || [];
  const allCookies = setCookies.map(c => c.split(";")[0]).join("; ");
  return mergeCookies(cookies, allCookies);
}

async function api(method, path, cookies, body) {
  const headers = { "Content-Type": "application/json" };
  if (cookies) headers["Cookie"] = cookies;
  const opts = { method, headers, redirect: "manual" };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${BASE}${path}`, opts);
  let data = null;
  try { data = await res.json(); } catch {}
  return { status: res.status, data };
}

function getNextMonday() {
  const now = new Date();
  const future = new Date(now);
  future.setDate(now.getDate() + 30);
  const day = future.getDay();
  const diff = day === 0 ? 1 : 8 - day;
  future.setDate(future.getDate() + diff);
  return future.toISOString().split("T")[0];
}

async function runTests() {
  console.log("\n🔍 PHASE 11 — DOUBLE-BOOKING PREVENTION\n");

  // =====================================================
  // SETUP: Login as admin (always available, no rate limit)
  // =====================================================
  console.log("--- Setup: Admin Login ---");
  const adminCookies = await loginAs("admin@innovarsecurity.com", "admin123456");
  const adminSession = await api("GET", "/api/auth/session", adminCookies);
  assertExists("Admin session active", adminSession.data?.user?.id);

  // =====================================================
  // SETUP: Register test client (may be rate-limited)
  // =====================================================
  console.log("\n--- Setup: Register Test Client ---");
  const testEmail = `doublebook-test-${Date.now()}@test.com`;
  const testPassword = "DoubleBook123!";

  const regRes = await api("POST", "/api/auth/register", null, {
    name: "Cliente Double Booking Test",
    email: testEmail,
    phone: "3009990001",
    password: testPassword,
  });
  const regOk = regRes.status === 200 || regRes.status === 201;
  console.log(`  Registration: ${regRes.status}`);

  let clientCookies;
  if (regOk) {
    clientCookies = await loginAs(testEmail, testPassword);
  } else {
    console.log("  ⚠️  Registration rate-limited. Attempting with alternative email...");
    const altEmail = `dbtest-alt-${Date.now()}@test.com`;
    const altRes = await api("POST", "/api/auth/register", null, {
      name: "Cliente DB Alt",
      email: altEmail,
      phone: "3009990002",
      password: "DoubleBookAlt123!",
    });
    const altOk = altRes.status === 200 || altRes.status === 201;
    if (altOk) {
      console.log(`  Alternative registration succeeded`);
      clientCookies = await loginAs(altEmail, "DoubleBookAlt123!");
    } else {
      console.log(`  ⚠️  All registrations rate-limited. Skipping appointment creation tests.`);
      console.log("  Availability API tests will still run (no client profile needed).\n");

      // Test availability only
      const testDate = getNextMonday();
      console.log(`  Testing availability for: ${testDate}`);
      const availRes = await api("GET", `/api/schedules/availability?date=${testDate}`, null);
      assert("Availability API → 200", "200", availRes.status);
      assert("Is work day", "true", String(availRes.data?.isWorkDay));
      const freeSlots = availRes.data?.slots?.filter(s => s.available) || [];
      assertExists("At least one free slot available", freeSlots.length > 0);

      // Test unauthenticated availability
      const unauthAvail = await api("GET", `/api/schedules/availability?date=${testDate}`, null);
      assert("Availability works unauthenticated", "200", unauthAvail.status);

      // Test service count
      const svcRes = await api("GET", "/api/services", null);
      assert("Services API → 200", "200", svcRes.status);

      // Summary
      console.log(`\n========================================`);
      console.log(`  PHASE 11 DOUBLE-BOOKING RESULTS: ${PASS} PASS, ${FAIL} FAIL (partial - rate limited)`);
      console.log(`========================================\n`);
      process.exit(FAIL > 0 ? 1 : 0);
    }
  }

  const sessionRes = await api("GET", "/api/auth/session", clientCookies);
  assertExists("Client session active", sessionRes.data?.user?.id);

  // =====================================================
  // SETUP: Get available services
  // =====================================================
  console.log("\n--- Setup: Get Services ---");
  const servicesRes = await api("GET", "/api/services", null);
  assert("Services loaded", "200", servicesRes.status);
  assertExists("Services list not empty", servicesRes.data?.length > 0);
  const serviceId = servicesRes.data[0].id;

  // =====================================================
  // STEP 1: Pick a date and check availability
  // =====================================================
  console.log("\n--- Step 1: Check Availability ---");
  const testDate = getNextMonday();
  console.log(`  Using date: ${testDate}`);

  const availRes = await api("GET", `/api/schedules/availability?date=${testDate}`, null);
  assert("Availability API → 200", "200", availRes.status);
  assert("Is work day", "true", String(availRes.data?.isWorkDay));

  const freeSlots = availRes.data?.slots?.filter(s => s.available) || [];
  console.log(`  Free slots found: ${freeSlots.length}`);
  assertExists("At least one free slot available", freeSlots.length > 0);

  const targetSlot = freeSlots[0];
  const slotTime = targetSlot.time || targetSlot.startTime || "09:00";
  const slotEndTime = targetSlot.endTime || "11:00";
  console.log(`  Target slot: ${slotTime} - ${slotEndTime}`);

  // =====================================================
  // STEP 2: Create appointment A in the target slot
  // =====================================================
  console.log("\n--- Step 2: Create Appointment A ---");
  const resA = await api("POST", "/api/citas", clientCookies, {
    serviceId,
    scheduledDate: testDate,
    startTime: slotTime,
    endTime: slotEndTime,
    locationAddress: "Calle Test 100, Double Booking Test",
    locationMunicipality: "Fómeque",
    locationReference: "Casa azul",
  });
  assert("Appointment A created → 201", "201", resA.status);
  assert("Appointment A status = PENDING", "PENDING", resA.data?.status);
  const apptAId = resA.data?.id;
  assertExists("Appointment A has ID", apptAId);

  // =====================================================
  // STEP 3: Try to create appointment B in the SAME slot → expect rejection
  // =====================================================
  console.log("\n--- Step 3: Double-Booking Rejection ---");
  const resB = await api("POST", "/api/citas", clientCookies, {
    serviceId,
    scheduledDate: testDate,
    startTime: slotTime,
    endTime: slotEndTime,
    locationAddress: "Calle Test 200, Double Booking Attempt",
    locationMunicipality: "Fómeque",
    locationReference: "Casa roja",
  });
  const rejected = resB.status === 409 || resB.status === 422 || resB.status === 400;
  assert("Appointment B rejected (409/422/400)", "true", String(rejected));
  assert("Response indicates conflict", "true", String(
    resB.status === 409 ||
    (resB.data?.error && String(resB.data.error).toLowerCase().includes("overlap")) ||
    (resB.data?.error && String(resB.data.error).toLowerCase().includes("conflict")) ||
    (resB.data?.error && String(resB.data.error).toLowerCase().includes("disponib"))
  ));
  console.log(`  Response: ${resB.status} — ${JSON.stringify(resB.data || {}).slice(0, 120)}`);

  // =====================================================
  // STEP 4: Verify appointment A still exists
  // =====================================================
  console.log("\n--- Step 4: Verify Appointment A Exists ---");
  const verifyA = await api("GET", `/api/citas/${apptAId}`, adminCookies);
  assert("Appointment A accessible → 200", "200", verifyA.status);
  assert("Appointment A still PENDING", "PENDING", verifyA.data?.status);

  // =====================================================
  // STEP 5: Cancel appointment A
  // =====================================================
  console.log("\n--- Step 5: Cancel Appointment A ---");
  const cancelRes = await api("POST", `/api/citas/${apptAId}/cancel`, adminCookies);
  assert("Appointment A cancelled → CANCELLED", "CANCELLED", cancelRes.data?.status);

  // =====================================================
  // STEP 6: Verify the slot is available again after cancellation
  // =====================================================
  console.log("\n--- Step 6: Verify Slot Available After Cancellation ---");
  const availAfter = await api("GET", `/api/schedules/availability?date=${testDate}`, null);
  assert("Availability API → 200", "200", availAfter.status);

  const freeSlotsAfter = availAfter.data?.slots?.filter(s => s.available) || [];
  const targetSlotFreed = freeSlotsAfter.some(
    s => (s.time || s.startTime) === slotTime
  );
  assert("Target slot available again after cancellation", "true", String(targetSlotFreed));

  // =====================================================
  // STEP 7: Confirm the slot can be booked again
  // =====================================================
  console.log("\n--- Step 7: Re-book After Cancellation ---");
  const resC = await api("POST", "/api/citas", clientCookies, {
    serviceId,
    scheduledDate: testDate,
    startTime: slotTime,
    endTime: slotEndTime,
    locationAddress: "Calle Test 300, Re-book after cancel",
    locationMunicipality: "Fómeque",
    locationReference: "Casa verde",
  });
  assert("Appointment C created after cancellation → 201", "201", resC.status);
  assert("Appointment C status = PENDING", "PENDING", resC.data?.status);

  // Clean up: cancel appointment C
  if (resC.data?.id) {
    await api("POST", `/api/citas/${resC.data.id}/cancel`, adminCookies);
  }

  // =====================================================
  // SUMMARY
  // =====================================================
  console.log(`\n========================================`);
  console.log(`  PHASE 11 DOUBLE-BOOKING RESULTS: ${PASS} PASS, ${FAIL} FAIL`);
  console.log(`========================================\n`);
  process.exit(FAIL > 0 ? 1 : 0);
}

runTests().catch((e) => { console.error("Test error:", e); process.exit(1); });
