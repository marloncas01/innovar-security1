const BASE = process.env.BASE_URL || "http://localhost:3000";
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

function assertIncludes(name, haystack, needle) {
  const h = String(haystack);
  const n = String(needle);
  if (h.includes(n)) { console.log(`  ✅ PASS: ${name} (found: "${n}")`); PASS++; }
  else { console.log(`  ❌ FAIL: ${name} (expected to contain "${n}", got: "${h.slice(0, 100)}")`); FAIL++; }
}

function assertBlocked(name, status) {
  if (status === 307 || status === 302 || status === 401 || status === 403) {
    console.log(`  ✅ PASS: ${name} (blocked: ${status})`); PASS++;
  } else {
    console.log(`  ❌ FAIL: ${name} (expected block, got: ${status})`); FAIL++;
  }
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
  return { status: res.status, data, headers: res.headers };
}

async function apiRaw(method, path, cookies, body) {
  const headers = {};
  if (cookies) headers["Cookie"] = cookies;
  if (body) headers["Content-Type"] = "application/json";
  const opts = { method, headers, redirect: "manual" };
  if (body) opts.body = JSON.stringify(body);
  return await fetch(`${BASE}${path}`, opts);
}

function futureDate() {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  return d.toISOString().split("T")[0];
}

async function runTests() {
  console.log("\n🔍 PHASE 11 — STAGING VERIFICATION TEST\n");
  console.log(`  Base URL: ${BASE}\n`);

  // =====================================================
  // 1. HEALTH CHECK
  // =====================================================
  console.log("--- 1. Health Check ---");
  const health = await api("GET", "/api/health");
  assert("Health → 200", "200", health.status);
  assertExists("health.status field", health.data?.status);
  assertExists("health.uptime field", health.data?.uptime);
  assertExists("health.version field", health.data?.version);

  // =====================================================
  // 2. LANDING PAGE
  // =====================================================
  console.log("\n--- 2. Landing Page ---");
  const landing = await apiRaw("GET", "/");
  assert("Landing → 200", "200", landing.status);

  // =====================================================
  // 3. SERVICES API
  // =====================================================
  console.log("\n--- 3. Services API ---");
  const services = await api("GET", "/api/services");
  assert("Services → 200", "200", services.status);
  assert("Services is array", "true", String(Array.isArray(services.data)));
  assert("Services length > 0", "true", String(services.data?.length > 0));

  // =====================================================
  // 4. CONTENT API
  // =====================================================
  console.log("\n--- 4. Content API ---");
  const content = await api("GET", "/api/content");
  assert("Content → 200", "200", content.status);
  assert("Content is array", "true", String(Array.isArray(content.data)));

  // =====================================================
  // 5. FAQ API
  // =====================================================
  console.log("\n--- 5. FAQ API ---");
  const faq = await api("GET", "/api/faq");
  assert("FAQ → 200", "200", faq.status);
  assert("FAQ is array", "true", String(Array.isArray(faq.data)));

  // =====================================================
  // 6. ZONES API
  // =====================================================
  console.log("\n--- 6. Zones API ---");
  const zones = await api("GET", "/api/zones");
  assert("Zones → 200", "200", zones.status);
  assert("Zones is array", "true", String(Array.isArray(zones.data)));

  // =====================================================
  // 7. LOGIN PAGE
  // =====================================================
  console.log("\n--- 7. Login Page ---");
  const loginPage = await apiRaw("GET", "/login");
  assert("Login page → 200", "200", loginPage.status);

  // =====================================================
  // 8. REGISTER PAGE
  // =====================================================
  console.log("\n--- 8. Register Page ---");
  const registerPage = await apiRaw("GET", "/registro");
  assert("Register page → 200", "200", registerPage.status);

  // =====================================================
  // 9. RECOVERY PAGE
  // =====================================================
  console.log("\n--- 9. Recovery Page ---");
  const recoveryPage = await apiRaw("GET", "/recuperar");
  assert("Recovery page → 200", "200", recoveryPage.status);

  // =====================================================
  // 10. TERMS PAGE
  // =====================================================
  console.log("\n--- 10. Terms Page ---");
  const terms = await apiRaw("GET", "/terminos");
  assert("Terms page → 200", "200", terms.status);

  // =====================================================
  // 11. PRIVACY PAGE
  // =====================================================
  console.log("\n--- 11. Privacy Page ---");
  const privacy = await apiRaw("GET", "/privacidad");
  assert("Privacy page → 200", "200", privacy.status);

  // =====================================================
  // 12. SECURITY HEADERS
  // =====================================================
  console.log("\n--- 12. Security Headers ---");
  const landingRaw = await apiRaw("GET", "/");
  const headers = landingRaw.headers;
  const contentType = headers.get("x-content-type-options");
  const frameOptions = headers.get("x-frame-options");
  const xssProtection = headers.get("x-xss-protection");
  const referrerPolicy = headers.get("referrer-policy");
  const permissionsPolicy = headers.get("permissions-policy");

  assert("X-Content-Type-Options: nosniff", "nosniff", contentType);
  assert("X-Frame-Options: DENY", "DENY", frameOptions);
  assertExists("X-XSS-Protection present", xssProtection);
  assertExists("Referrer-Policy present", referrerPolicy);
  assertExists("Permissions-Policy present", permissionsPolicy);

  // =====================================================
  // 13. ADMIN LOGIN
  // =====================================================
  console.log("\n--- 13. Admin Login ---");
  const adminCookies = await loginAs("admin@innovarsecurity.com", "admin123456");
  assertExists("Session cookie set", adminCookies.includes("next-auth.session-token") || adminCookies.includes("__Secure-next-auth.session-token"));

  const sessionRes = await api("GET", "/api/auth/session", adminCookies);
  assertExists("Admin session has user ID", sessionRes.data?.user?.id);

  // =====================================================
  // 14. ADMIN DASHBOARD STATS
  // =====================================================
  console.log("\n--- 14. Admin Dashboard Stats ---");
  const stats = await api("GET", "/api/admin/dashboard/stats", adminCookies);
  assert("Dashboard stats → 200", "200", stats.status);
  assertExists("Stats data present", stats.data);

  // =====================================================
  // 15. ADMIN SERVICES
  // =====================================================
  console.log("\n--- 15. Admin Services ---");
  const adminServices = await api("GET", "/api/admin/services", adminCookies);
  assert("Admin services → 200", "200", adminServices.status);
  assert("Admin services has data", "true", String(!!(adminServices.data?.services || Array.isArray(adminServices.data))));

  // =====================================================
  // 16. ADMIN CLIENTS
  // =====================================================
  console.log("\n--- 16. Admin Clients ---");
  const adminClients = await api("GET", "/api/admin/clients", adminCookies);
  assert("Admin clients → 200", "200", adminClients.status);
  assert("Admin clients has data", "true", String(!!(adminClients.data?.clients || Array.isArray(adminClients.data))));

  // =====================================================
  // 17. ADMIN SETTINGS
  // =====================================================
  console.log("\n--- 17. Admin Settings ---");
  const adminSettings = await api("GET", "/api/admin/settings", adminCookies);
  assert("Admin settings → 200", "200", adminSettings.status);
  assertExists("Settings data present", adminSettings.data);

  // =====================================================
  // 18. PROFILE (Authenticated)
  // =====================================================
  console.log("\n--- 18. Profile ---");
  const profile = await api("GET", "/api/profile", adminCookies);
  assert("Profile → 200", "200", profile.status);
  assertExists("Profile has user data", profile.data?.email || profile.data?.user);

  // =====================================================
  // 19. UNAUTHENTICATED ACCESS BLOCKED
  // =====================================================
  console.log("\n--- 19. Unauthenticated Access ---");
  const blockedClients = await api("GET", "/api/admin/clients", null);
  assertBlocked("GET /api/admin/clients unauthenticated → blocked", blockedClients.status);

  const blockedSettings = await api("GET", "/api/admin/settings", null);
  assertBlocked("GET /api/admin/settings unauthenticated → blocked", blockedSettings.status);

  const blockedStats = await api("GET", "/api/admin/dashboard/stats", null);
  assertBlocked("GET /api/admin/dashboard/stats unauthenticated → blocked", blockedStats.status);

  // =====================================================
  // 20. CLIENT REGISTRATION
  // =====================================================
  console.log("\n--- 20. Client Registration ---");
  const testEmail = `test-staging-${Date.now()}@innovarsecurity.com`;
  const regResult = await api("POST", "/api/auth/register", null, {
    email: testEmail,
    password: "Test123456!",
    name: "DATOS DE PRUEBA - STAGING",
    phone: "3001234567",
  });
  const regOk = regResult.status === 200 || regResult.status === 201;
  assert("Client registration → 200/201", "true", String(regOk));
  assertExists("Registration returns user data", regResult.data);

  // =====================================================
  // 21. CLIENT LOGIN + SESSION VERIFICATION
  // =====================================================
  console.log("\n--- 21. Client Login + Session ---");
  const clientCookies = await loginAs(testEmail, "Test123456!");
  assertExists("Client session cookie set", clientCookies.includes("next-auth.session-token") || clientCookies.includes("__Secure-next-auth.session-token"));

  const clientSession = await api("GET", "/api/auth/session", clientCookies);
  assertExists("Client session has user ID", clientSession.data?.user?.id);

  const clientProfile = await api("GET", "/api/profile", clientCookies);
  assert("Client profile → 200", "200", clientProfile.status);

  // =====================================================
  // BONUS: APPOINTMENT TEST (future date)
  // =====================================================
  console.log("\n--- Bonus: Appointment Creation (Future Date) ---");
  if (!regOk) {
    console.log("  ⚠️  Registration was rate-limited — skipping appointment test");
  } else {
    const aptDate = futureDate();
    console.log(`  Using date: ${aptDate} (DATOS DE PRUEBA - STAGING)`);
    const aptResult = await api("POST", "/api/citas", clientCookies, {
      serviceId: services.data?.[0]?.id,
      scheduledDate: aptDate,
      startTime: "09:00",
      endTime: "11:00",
      locationAddress: "DATOS DE PRUEBA - STAGING - Calle Test 999",
      locationMunicipality: "Fómeque",
      locationReference: "DATOS DE PRUEBA - STAGING",
    });
    console.log(`  Response: ${aptResult.status} — ${JSON.stringify(aptResult.data || {}).slice(0, 150)}`);
    const aptOk = aptResult.status === 200 || aptResult.status === 201;
    assert("Appointment created (future date) → 200/201", "true", String(aptOk));
    assertExists("Appointment has ID", aptResult.data?.id);

    if (aptResult.data?.id) {
      const cancelUrl = "/api/citas/" + aptResult.data.id + "/cancel";
      await api("POST", cancelUrl, adminCookies);
    }
  }

  // =====================================================
  // SUMMARY
  // =====================================================
  console.log(`\n========================================`);
  console.log(`  PHASE 11 STAGING VERIFICATION RESULTS: ${PASS} PASS, ${FAIL} FAIL`);
  console.log(`========================================\n`);
  process.exit(FAIL > 0 ? 1 : 0);
}

runTests().catch((e) => { console.error("Test error:", e); process.exit(1); });
