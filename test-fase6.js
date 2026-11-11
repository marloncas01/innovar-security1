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

async function runTests() {
  console.log("\n🔍 PHASE 6 TESTS — Service Admin, Photos, Zones\n");

  const adminCookies = await loginAs("admin@innovarsecurity.com", "admin123456");
  let r;

  // ============ SERVICES API ============

  r = await api("GET", "/api/admin/services?includeInactive=true", adminCookies);
  assert("Admin list services", "200", r.status);
  assertExists("Services array returned", r.data?.services);

  r = await api("GET", "/api/admin/services", adminCookies);
  assert("Admin list active only", "200", r.status);

  r = await api("POST", "/api/admin/services", adminCookies, {
    name: "Servicio Prueba Fase6",
    description: "Test service for phase 6",
    price: 100000,
    duration: 90,
    features: ["Feature test"],
    exclusions: ["Exclusion test"],
    requiresVisit: false,
    active: true,
    sortOrder: 99,
  });
  assert("Create service", "201", r.status);
  assertExists("Service has id", r.data?.id);
  const testServiceId = r.data?.id;

  if (testServiceId) {
    r = await api("PUT", `/api/admin/services/${testServiceId}`, adminCookies, {
      name: "Servicio Prueba Actualizado",
      price: 200000,
    });
    assert("Update service", "200", r.status);
    assert("Updated name correct", "Servicio Prueba Actualizado", r.data?.name);
    assert("Updated price correct", "200000", r.data?.price);

    r = await api("PUT", `/api/admin/services/${testServiceId}`, adminCookies, { active: false });
    assert("Deactivate service", "200", r.status);
    assert("Service deactivated", "false", r.data?.active);

    r = await api("GET", "/api/services", null);
    assert("Public API hides inactive", "200", r.status);
    const found = r.data?.find((s) => s.id === testServiceId);
    assert("Inactive service not in public", "undefined", typeof found);

    r = await api("DELETE", `/api/admin/services/${testServiceId}`, adminCookies);
    assert("Delete service", "200", r.status);
    assert("Delete success", "true", r.data?.success);
  }

  r = await api("DELETE", "/api/admin/services/nonexistent", adminCookies);
  assert("Delete nonexistent 404", "404", r.status);

  r = await api("POST", "/api/admin/services", adminCookies, { description: "no name" });
  assert("Create without name 400", "400", r.status);

  r = await api("POST", "/api/admin/services", adminCookies, { name: "Instalacion" });
  assert("Duplicate slug 409", "409", r.status);

  // ============ PUBLIC SERVICES ============

  r = await api("GET", "/api/services", null);
  assert("Public services from DB", "200", r.status);
  assertExists("Has services", r.data?.length > 0);
  assert("Services have features", "string", typeof r.data?.[0]?.features);
  assert("Services have exclusions", "string", typeof r.data?.[0]?.exclusions);

  // ============ PRICE SYSTEM ============

  r = await api("POST", "/api/admin/services", adminCookies, {
    name: "Servicio Sin Precio",
    price: null,
    active: true,
  });
  assert("Null price service created", "201", r.status);
  assert("Price is null", "null", r.data?.price);
  if (r.data?.id) await api("DELETE", `/api/admin/services/${r.data.id}`, adminCookies);

  // ============ PHOTOS API ============

  r = await api("GET", "/api/photos?appointmentId=test", null);
  assert("Photos API requires auth", "401", r.status);

  // ============ ZONES API ============

  r = await api("GET", "/api/admin/zones", adminCookies);
  assert("Admin list zones", "200", r.status);
  assertExists("Zones array", r.data?.zones);

  r = await api("POST", "/api/admin/zones", adminCookies, {
    name: "Zona Prueba",
    municipality: "Fómeque",
    department: "Cundinamarca",
    flatRate: 50000,
    active: true,
  });
  assert("Create zone", "201", r.status);
  assertExists("Zone has id", r.data?.id);
  const testZoneId = r.data?.id;

  if (testZoneId) {
    r = await api("PUT", `/api/admin/zones/${testZoneId}`, adminCookies, { flatRate: 60000 });
    assert("Update zone", "200", r.status);
    assert("Zone flatRate updated", "60000", r.data?.flatRate);

    r = await api("DELETE", `/api/admin/zones/${testZoneId}`, adminCookies);
    assert("Delete zone", "200", r.status);
  }

  r = await api("GET", "/api/zones", null);
  assert("Public zones API", "200", r.status);
  assertExists("Zones array", Array.isArray(r.data));

  // ============ PAGES LOAD ============

  r = await api("GET", "/admin/servicios", adminCookies);
  assert("Admin servicios page", "200", r.status);

  r = await api("GET", "/admin/servicios/nuevo", adminCookies);
  assert("Nuevo servicio page", "200", r.status);

  r = await api("GET", "/admin/zonas", adminCookies);
  assert("Admin zonas page", "200", r.status);

  r = await api("GET", "/servicios", null);
  assert("Public servicios page", "200", r.status);

  // ============ APPOINTMENT ============

  r = await api("GET", "/api/admin/citas", adminCookies);
  assert("Appointments accessible", "200", r.status);

  // ============ SECURITY ============

  r = await api("GET", "/api/admin/services", null);
  assert("Unauth blocked from admin services", "307", r.status);

  r = await api("GET", "/api/admin/zones", null);
  assert("Unauth blocked from admin zones", "307", r.status);

  console.log(`\n========================================`);
  console.log(`  PHASE 6 RESULTS: ${PASS} PASS, ${FAIL} FAIL`);
  console.log(`========================================\n`);
  process.exit(FAIL > 0 ? 1 : 0);
}

runTests().catch((e) => { console.error("Test error:", e); process.exit(1); });
