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
  console.log("\n🔍 PHASE 7 TESTS — Full Admin Panel\n");

  const adminCookies = await loginAs("admin@innovarsecurity.com", "admin123456");
  let r;

  // ============ DASHBOARD ============

  r = await api("GET", "/api/admin/dashboard/stats", adminCookies);
  assert("Dashboard stats endpoint", "200", r.status);
  assertExists("Has totalClients", r.data?.totalClients !== undefined);
  assertExists("Has pendingAppointments", r.data?.pendingAppointments !== undefined);
  assertExists("Has activeServices", r.data?.activeServices !== undefined);

  r = await api("GET", "/admin/dashboard", adminCookies);
  assert("Dashboard page loads", "200", r.status);

  // ============ CONTENT CMS ============

  r = await api("GET", "/api/admin/content", adminCookies);
  assert("Admin content list", "200", r.status);
  assertExists("Content array", Array.isArray(r.data));

  r = await api("POST", "/api/admin/content", adminCookies, {
    section: "test_phase7",
    title: "Test Title",
    description: "Test Description",
    active: true,
  });
  assert("Create content section", "201", r.status);
  const testContentId = r.data?.id;

  if (testContentId) {
    r = await api("PUT", `/api/admin/content/${testContentId}`, adminCookies, {
      title: "Updated Title",
    });
    assert("Update content section", "200", r.status);
    assert("Content title updated", "Updated Title", r.data?.title);

    r = await api("DELETE", `/api/admin/content/${testContentId}`, adminCookies);
    assert("Delete content section", "200", r.status);
  }

  r = await api("GET", "/api/content", null);
  assert("Public content API", "200", r.status);
  assertExists("Public content returns data", Array.isArray(r.data));

  r = await api("GET", "/admin/contenido", adminCookies);
  assert("Admin contenido page", "200", r.status);

  // ============ FAQ ============

  r = await api("GET", "/api/admin/faq", adminCookies);
  assert("Admin FAQ list", "200", r.status);
  assertExists("FAQ array", Array.isArray(r.data));

  r = await api("POST", "/api/admin/faq", adminCookies, {
    question: "Test question phase7?",
    answer: "Test answer for phase 7",
    category: "test",
    active: true,
    sortOrder: 99,
  });
  assert("Create FAQ", "201", r.status);
  const testFaqId = r.data?.id;

  if (testFaqId) {
    r = await api("PUT", `/api/admin/faq/${testFaqId}`, adminCookies, {
      answer: "Updated answer",
    });
    assert("Update FAQ", "200", r.status);

    r = await api("DELETE", `/api/admin/faq/${testFaqId}`, adminCookies);
    assert("Delete FAQ", "200", r.status);
  }

  r = await api("GET", "/api/faq", null);
  assert("Public FAQ API", "200", r.status);

  r = await api("GET", "/admin/faq", adminCookies);
  assert("Admin FAQ page", "200", r.status);

  // ============ CHATBOT ============

  r = await api("GET", "/api/admin/chatbot", adminCookies);
  assert("Admin chatbot list", "200", r.status);
  assertExists("Chatbot array", Array.isArray(r.data));

  r = await api("POST", "/api/admin/chatbot", adminCookies, {
    type: "QUESTION",
    question: "Test chatbot question?",
    answer: "Test answer",
    options: JSON.stringify(["Option 1"]),
    active: true,
    sortOrder: 99,
  });
  assert("Create chatbot message", "201", r.status);
  const testChatId = r.data?.id;

  if (testChatId) {
    r = await api("PUT", `/api/admin/chatbot/${testChatId}`, adminCookies, {
      answer: "Updated chatbot answer",
    });
    assert("Update chatbot message", "200", r.status);

    r = await api("DELETE", `/api/admin/chatbot/${testChatId}`, adminCookies);
    assert("Delete chatbot message", "200", r.status);
  }

  r = await api("GET", "/admin/chatbot", adminCookies);
  assert("Admin chatbot page", "200", r.status);

  // ============ CLIENTS ============

  r = await api("GET", "/api/admin/clients", adminCookies);
  assert("Admin clients list", "200", r.status);
  assertExists("Clients array", r.data?.clients);
  assertExists("Clients pagination", r.data?.pagination);

  r = await api("GET", "/api/admin/clients?search=test", adminCookies);
  assert("Client search works", "200", r.status);

  r = await api("GET", "/admin/clientes", adminCookies);
  assert("Admin clientes page", "200", r.status);

  // ============ SETTINGS ============

  r = await api("GET", "/api/admin/settings", adminCookies);
  assert("Admin settings list", "200", r.status);
  assertExists("Settings object", r.data?.settings || r.data);

  r = await api("GET", "/admin/configuracion", adminCookies);
  assert("Admin configuracion page", "200", r.status);

  // ============ FOTOS ============

  r = await api("GET", "/admin/fotos", adminCookies);
  assert("Admin fotos page", "200", r.status);

  // ============ SECURITY ============

  r = await api("GET", "/api/admin/content", null);
  assert("Unauth blocked from admin content", "307", r.status);

  r = await api("GET", "/api/admin/faq", null);
  assert("Unauth blocked from admin faq", "307", r.status);

  r = await api("GET", "/api/admin/chatbot", null);
  assert("Unauth blocked from admin chatbot", "307", r.status);

  r = await api("GET", "/api/admin/clients", null);
  assert("Unauth blocked from admin clients", "307", r.status);

  r = await api("GET", "/api/admin/settings", null);
  assert("Unauth blocked from admin settings", "307", r.status);

  r = await api("GET", "/api/admin/dashboard/stats", null);
  assert("Unauth blocked from dashboard stats", "307", r.status);

  // ============ PUBLIC PAGES ============

  r = await api("GET", "/", null);
  assert("Landing page loads", "200", r.status);

  r = await api("GET", "/servicios", null);
  assert("Servicios page loads", "200", r.status);

  r = await api("GET", "/api/services", null);
  assert("Public services API", "200", r.status);

  r = await api("GET", "/api/content", null);
  assert("Public content API", "200", r.status);

  // ============ EXISTING PAGES ============

  r = await api("GET", "/admin/servicios", adminCookies);
  assert("Admin servicios page", "200", r.status);

  r = await api("GET", "/admin/citas", adminCookies);
  assert("Admin citas page", "200", r.status);

  r = await api("GET", "/admin/pagos", adminCookies);
  assert("Admin pagos page", "200", r.status);

  r = await api("GET", "/admin/cotizaciones", adminCookies);
  assert("Admin cotizaciones page", "200", r.status);

  r = await api("GET", "/admin/zonas", adminCookies);
  assert("Admin zonas page", "200", r.status);

  r = await api("GET", "/admin/notificaciones", adminCookies);
  assert("Admin notificaciones page", "200", r.status);

  // ============ DATA FLOW VERIFICATION ============

  console.log("\n--- Data Flow Tests ---");

  // Create content, verify it appears in public API
  r = await api("POST", "/api/admin/content", adminCookies, {
    section: "test_flow_phase7",
    title: "Flow Test",
    active: true,
  });
  const flowContentId = r.data?.id;

  r = await api("GET", "/api/content", null);
  const flowContent = r.data?.find((c) => c.section === "test_flow_phase7");
  assert("Content flows from admin to public API", "Flow Test", flowContent?.title);

  if (flowContentId) await api("DELETE", `/api/admin/content/${flowContentId}`, adminCookies);

  // Create FAQ, verify it appears in public API
  r = await api("POST", "/api/admin/faq", adminCookies, {
    question: "Flow test question?",
    answer: "Flow test answer",
    active: true,
  });
  const flowFaqId = r.data?.id;

  r = await api("GET", "/api/faq", null);
  const flowFaq = r.data?.find((f) => f.question === "Flow test question?");
  assert("FAQ flows from admin to public API", "Flow test answer", flowFaq?.answer);

  if (flowFaqId) await api("DELETE", `/api/admin/faq/${flowFaqId}`, adminCookies);

  console.log(`\n========================================`);
  console.log(`  PHASE 7 RESULTS: ${PASS} PASS, ${FAIL} FAIL`);
  console.log(`========================================\n`);
  process.exit(FAIL > 0 ? 1 : 0);
}

runTests().catch((e) => { console.error("Test error:", e); process.exit(1); });
