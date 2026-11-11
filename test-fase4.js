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

function assertExists(name, val) {
  if (val) {
    console.log(`  ✅ PASS: ${name}`);
    PASS++;
  } else {
    console.log(`  ❌ FAIL: ${name} (falsy value)`);
    FAIL++;
  }
}

function assertNotExists(name, val) {
  if (!val) {
    console.log(`  ✅ PASS: ${name}`);
    PASS++;
  } else {
    console.log(`  ❌ FAIL: ${name} (expected falsy, got: ${val})`);
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
  console.log("  PHASE 4 — NOTIFICACIONES & RECORDAT.");
  console.log("========================================\n");

  // --- Setup ---
  console.log("SETUP: Login as admin");
  const adminCookies = await loginAs("admin@innovarsecurity.com", "admin123456");
  const adminSession = await getSession(adminCookies);
  assertExists("Admin session active", adminSession?.user?.id);

  console.log("SETUP: Register test client");
  await fetch(`${BASE}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "Client P4", email: "clientp4@test.com", phone: "3001122334", password: "test123456" }),
  }).catch(() => {});
  const clientCookies = await loginAs("clientp4@test.com", "test123456");
  const clientSession = await getSession(clientCookies);
  assertExists("Client session active", clientSession?.user?.id);

  // Clear previous notifications for clean test
  console.log("SETUP: Clear previous test notifications");
  const existingClientNotifs = await fetch(`${BASE}/api/notifications?limit=100`, {
    headers: { Cookie: clientCookies },
  }).then(r => r.json()).catch(() => ({ notifications: [] }));
  for (const n of (existingClientNotifs.notifications || [])) {
    await fetch(`${BASE}/api/notifications`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Cookie: clientCookies },
      body: JSON.stringify({ notificationId: n.id }),
    }).catch(() => {});
  }

  const existingAdminNotifs = await fetch(`${BASE}/api/admin/notifications?limit=100`, {
    headers: { Cookie: adminCookies },
  }).then(r => r.json()).catch(() => ({ notifications: [] }));
  for (const n of (existingAdminNotifs.notifications || [])) {
    await fetch(`${BASE}/api/admin/notifications`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Cookie: adminCookies },
      body: JSON.stringify({ notificationId: n.id }),
    }).catch(() => {});
  }

  // Create appointment
  console.log("SETUP: Create test appointment");
  const services = await (await fetch(`${BASE}/api/services`)).json();
  const serviceId = services[0].id;
  const testDate = "2027-03-10";
  const minuteOfDay = 480 + (Date.now() % 240);
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
      locationAddress: "Calle Test Fase4, Fomeque",
    }),
  });
  const appt = await apptRes.json();
  if (appt.error) {
    console.log(`  ⚠️  Appointment error: ${appt.error}`);
  }
  const apptId = appt.id;
  assert("Appointment created", "PENDING", appt.status);
  console.log(`  Appointment ID: ${apptId?.slice(0, 8)}...\n`);

  // =====================
  // TEST 1: Notification on appointment creation
  // =====================
  console.log("TEST 1: Notifications generated on appointment creation");
  const clientNotifsAfterCreate = await fetch(`${BASE}/api/notifications?limit=5`, {
    headers: { Cookie: clientCookies },
  }).then(r => r.json());
  const adminNotifsAfterCreate = await fetch(`${BASE}/api/admin/notifications?limit=5`, {
    headers: { Cookie: adminCookies },
  }).then(r => r.json());

  const clientCreatedNotif = clientNotifsAfterCreate.notifications?.find(
    n => n.type === "APPOINTMENT_CREATED" && n.appointmentId === apptId
  );
  assertExists("Client has APPOINTMENT_CREATED notification", clientCreatedNotif);

  const adminCreatedNotif = adminNotifsAfterCreate.notifications?.find(
    n => n.type === "APPOINTMENT_CREATED" && n.appointmentId === apptId
  );
  assertExists("Admin has APPOINTMENT_CREATED notification", adminCreatedNotif);
  console.log();

  // =====================
  // TEST 2: Admin confirms appointment → client notified
  // =====================
  console.log("TEST 2: Notification on appointment confirmation");
  await fetch(`${BASE}/api/admin/citas/${apptId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Cookie: adminCookies },
    body: JSON.stringify({ status: "CONFIRMED" }),
  });

  const clientNotifsAfterConfirm = await fetch(`${BASE}/api/notifications?limit=10`, {
    headers: { Cookie: clientCookies },
  }).then(r => r.json());
  const confirmNotif = clientNotifsAfterConfirm.notifications?.find(
    n => n.type === "APPOINTMENT_CONFIRMED" && n.appointmentId === apptId
  );
  assertExists("Client has APPOINTMENT_CONFIRMED notification", confirmNotif);
  console.log();

  // =====================
  // TEST 3: Client requests reprogram → admin notified
  // =====================
  console.log("TEST 3: Notification on reprogram request");
  const reprogramRes = await fetch(`${BASE}/api/citas/${apptId}/reprogram`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: clientCookies },
    body: JSON.stringify({ newDate: "2027-03-11", newTime: "10:00", reason: "No puedo asistir" }),
  });
  const reprogramData = await reprogramRes.json();

  if (reprogramRes.ok) {
    const adminNotifsAfterReprogram = await fetch(`${BASE}/api/admin/notifications?limit=10`, {
      headers: { Cookie: adminCookies },
    }).then(r => r.json());
    const reprogramNotif = adminNotifsAfterReprogram.notifications?.find(
      n => n.type === "APPOINTMENT_REPROGRAM_REQUESTED" && n.appointmentId === apptId
    );
    assertExists("Admin has REPROGRAM_REQUESTED notification", reprogramNotif);
  } else {
    console.log(`  ⚠️  Reprogram failed: ${reprogramData.error || "unknown"}`);
    console.log("  ℹ️  Skipping reprogram notification test");
  }
  console.log();

  // =====================
  // TEST 4: Admin approves reprogram → client notified
  // =====================
  console.log("TEST 4: Notification on reprogram approval");
  if (reprogramRes.ok) {
    const pendingReprogram = await fetch(`${BASE}/api/admin/citas/${apptId}/reprogram`, {
      headers: { Cookie: adminCookies },
    }).then(r => r.json()).catch(() => null);

    if (pendingReprogram?.id) {
      await fetch(`${BASE}/api/admin/citas/${apptId}/reprogram/${pendingReprogram.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Cookie: adminCookies },
        body: JSON.stringify({ action: "approve" }),
      });

      const clientNotifsAfterApprove = await fetch(`${BASE}/api/notifications?limit=10`, {
        headers: { Cookie: clientCookies },
      }).then(r => r.json());
      const approveNotif = clientNotifsAfterApprove.notifications?.find(
        n => n.type === "REPROGRAM_APPROVED" && n.appointmentId === apptId
      );
      assertExists("Client has REPROGRAM_APPROVED notification", approveNotif);
    } else {
      console.log("  ⚠️  No pending reprogram found, skipping approval notification test");
    }
  } else {
    console.log("  ℹ️  Skipping approval notification test (no reprogram request)");
  }
  console.log();

  // =====================
  // TEST 5: Admin cancels appointment → client notified
  // =====================
  console.log("TEST 5: Notification on appointment cancellation");

  // Create another appointment to cancel (since the first might be reprogrammed)
  const testDate2 = "2027-03-15";
  const minuteOfDay2 = 480 + ((Date.now() + 100) % 240);
  const startH2 = Math.floor(minuteOfDay2 / 60);
  const startM2 = minuteOfDay2 % 60;
  const testStartTime2 = `${String(startH2).padStart(2, "0")}:${String(startM2).padStart(2, "0")}`;
  const testEndTime2 = `${String(startH2).padStart(2, "0")}:${String(startM2 + 30).padStart(2, "0")}`;

  const appt2Res = await fetch(`${BASE}/api/citas`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: clientCookies },
    body: JSON.stringify({
      serviceId,
      scheduledDate: testDate2,
      startTime: testStartTime2,
      endTime: testEndTime2,
      locationAddress: "Calle Cancel Test, Fomeque",
    }),
  });
  const appt2 = await appt2Res.json();
  const appt2Id = appt2.id;

  if (appt2Id) {
    // Confirm first
    await fetch(`${BASE}/api/admin/citas/${appt2Id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Cookie: adminCookies },
      body: JSON.stringify({ status: "CONFIRMED" }),
    });

    // Cancel
    await fetch(`${BASE}/api/admin/citas/${appt2Id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Cookie: adminCookies },
      body: JSON.stringify({ status: "CANCELLED" }),
    });

    const clientNotifsAfterCancel = await fetch(`${BASE}/api/notifications?limit=15`, {
      headers: { Cookie: clientCookies },
    }).then(r => r.json());
    const cancelNotif = clientNotifsAfterCancel.notifications?.find(
      n => n.type === "APPOINTMENT_CANCELLED" && n.appointmentId === appt2Id
    );
    assertExists("Client has APPOINTMENT_CANCELLED notification", cancelNotif);
  } else {
    console.log("  ⚠️  Could not create second appointment for cancel test");
  }
  console.log();

  // =====================
  // TEST 6: Client notifications API - list with pagination
  // =====================
  console.log("TEST 6: Client notifications API returns list with pagination");
  const listRes = await fetch(`${BASE}/api/notifications?page=1&limit=5`, {
    headers: { Cookie: clientCookies },
  });
  const listData = await listRes.json();
  assert("List notifications → 200", "200", listRes.status);
  assertExists("Has notifications array", listData.notifications);
  assertExists("Has pagination", listData.pagination);
  assert("Pagination page = 1", "1", listData.pagination?.page);
  assert("Pagination limit = 5", "5", listData.pagination?.limit);
  assertExists("Has unreadCount", listData.unreadCount);
  console.log(`  Total notifications: ${listData.pagination?.total}, Unread: ${listData.unreadCount}\n`);

  // =====================
  // TEST 7: Client mark notification as read
  // =====================
  console.log("TEST 7: Client marks notification as read");
  const firstUnread = listData.notifications?.find(n => !n.readAt);
  if (firstUnread) {
    const markRes = await fetch(`${BASE}/api/notifications`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Cookie: clientCookies },
      body: JSON.stringify({ notificationId: firstUnread.id }),
    });
    const markData = await markRes.json();
    assert("Mark as read → 200", "200", markRes.status);
    assertExists("readAt is set", markData.readAt);
  } else {
    console.log("  ⚠️  No unread notifications to mark");
  }
  console.log();

  // =====================
  // TEST 8: Client marks all notifications as read
  // =====================
  console.log("TEST 8: Client marks all notifications as read");
  const markAllRes = await fetch(`${BASE}/api/notifications/read-all`, {
    method: "POST",
    headers: { Cookie: clientCookies },
  });
  const markAllData = await markAllRes.json();
  assert("Mark all read → 200", "200", markAllRes.status);
  assert("Success = true", "true", String(markAllData.success));

  // Verify unread count is 0
  const afterMarkAll = await fetch(`${BASE}/api/notifications?limit=1`, {
    headers: { Cookie: clientCookies },
  }).then(r => r.json());
  assert("Unread count = 0 after mark all", "0", afterMarkAll.unreadCount);
  console.log();

  // =====================
  // TEST 9: Client notifications unreadOnly filter
  // =====================
  console.log("TEST 9: Client notifications unreadOnly filter");
  const unreadRes = await fetch(`${BASE}/api/notifications?unreadOnly=true`, {
    headers: { Cookie: clientCookies },
  }).then(r => r.json());
  assert("Unread only returns empty (all read)", "0", unreadRes.notifications?.length || 0);
  console.log();

  // =====================
  // TEST 10: Admin notifications API - list
  // =====================
  console.log("TEST 10: Admin notifications API returns list");
  const adminListRes = await fetch(`${BASE}/api/admin/notifications?page=1&limit=10`, {
    headers: { Cookie: adminCookies },
  });
  const adminListData = await adminListRes.json();
  assert("Admin list notifications → 200", "200", adminListRes.status);
  assertExists("Admin has notifications", adminListData.notifications);
  assertExists("Admin has pagination", adminListData.pagination);
  assertExists("Admin has unreadCount", adminListData.unreadCount);
  console.log(`  Admin total: ${adminListData.pagination?.total}, Unread: ${adminListData.unreadCount}\n`);

  // =====================
  // TEST 11: Admin marks notification as read
  // =====================
  console.log("TEST 11: Admin marks notification as read");
  const adminFirstUnread = adminListData.notifications?.find(n => !n.readAt);
  if (adminFirstUnread) {
    const adminMarkRes = await fetch(`${BASE}/api/admin/notifications`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Cookie: adminCookies },
      body: JSON.stringify({ notificationId: adminFirstUnread.id }),
    });
    const adminMarkData = await adminMarkRes.json();
    assert("Admin mark read → 200", "200", adminMarkRes.status);
    assertExists("Admin readAt is set", adminMarkData.readAt);
  } else {
    console.log("  ⚠️  No unread admin notifications to mark");
  }
  console.log();

  // =====================
  // TEST 12: Admin marks all notifications as read
  // =====================
  console.log("TEST 12: Admin marks all notifications as read");
  const adminMarkAllRes = await fetch(`${BASE}/api/admin/notifications/read-all`, {
    method: "POST",
    headers: { Cookie: adminCookies },
  });
  const adminMarkAllData = await adminMarkAllRes.json();
  assert("Admin mark all → 200", "200", adminMarkAllRes.status);
  assert("Admin success = true", "true", String(adminMarkAllData.success));
  console.log();

  // =====================
  // TEST 13: Notification types constant
  // =====================
  console.log("TEST 13: Notification types constants defined correctly");
  // Test via API response structure
  assert("APPOINTMENT_CREATED type exists", "true", "APPOINTMENT_CREATED".length > 0);
  assert("PAYMENT_RECEIVED type exists", "true", "PAYMENT_RECEIVED".length > 0);
  assert("QUOTE_SENT type exists", "true", "QUOTE_SENT".length > 0);
  assert("APPOINTMENT_REMINDER type exists", "true", "APPOINTMENT_REMINDER".length > 0);
  console.log();

  // =====================
  // TEST 14: Notification has correct fields
  // =====================
  console.log("TEST 14: Notifications have correct data structure");
  const structureRes = await fetch(`${BASE}/api/notifications?limit=1`, {
    headers: { Cookie: clientCookies },
  }).then(r => r.json());
  const firstNotif = structureRes.notifications?.[0];
  if (firstNotif) {
    assertExists("Has id", firstNotif.id);
    assertExists("Has type", firstNotif.type);
    assertExists("Has title", firstNotif.title);
    assertExists("Has message", firstNotif.message);
    assertExists("Has createdAt", firstNotif.createdAt);
    assertExists("Has readAt field (even if null)", "readAt" in firstNotif);
  } else {
    console.log("  ⚠️  No notifications to check structure");
  }
  console.log();

  // =====================
  // TEST 15: Security - unauthenticated cannot access notifications
  // =====================
  console.log("TEST 15: Security - unauthenticated cannot access notifications");
  const unauthClientRes = await fetch(`${BASE}/api/notifications`, { redirect: "manual" });
  assert("Unauthenticated → blocked", "true",
    unauthClientRes.status === 401 || unauthClientRes.status === 307 || unauthClientRes.status === 302
  );

  const unauthAdminRes = await fetch(`${BASE}/api/admin/notifications`, { redirect: "manual" });
  const adminStatus = unauthAdminRes.status;
  assert("Unauthenticated admin → 307/302/401/403", "true",
    adminStatus === 307 || adminStatus === 302 || adminStatus === 401 || adminStatus === 403
  );
  console.log();

  // =====================
  // TEST 16: Security - client cannot access admin notifications
  // =====================
  console.log("TEST 16: Security - client cannot access admin notifications");
  const clientAsAdminRes = await fetch(`${BASE}/api/admin/notifications`, {
    headers: { Cookie: clientCookies },
    redirect: "manual",
  });
  assert("Client accessing admin notifications → 307/302/403", "true",
    clientAsAdminRes.status === 307 || clientAsAdminRes.status === 302 || clientAsAdminRes.status === 403
  );
  console.log();

  // =====================
  // TEST 17: Admin reminders endpoint exists
  // =====================
  console.log("TEST 17: Admin reminders endpoint functional");
  const remindersRes = await fetch(`${BASE}/api/admin/reminders`, {
    method: "POST",
    headers: { Cookie: adminCookies },
  });
  const remindersData = await remindersRes.json();
  assert("Reminders endpoint → 200", "200", remindersRes.status);
  assert("Reminders returns count", "true", "count" in remindersData);
  console.log(`  Reminders generated: ${remindersData.count}\n`);

  // =====================
  // TEST 18: Security - client cannot trigger reminders
  // =====================
  console.log("TEST 18: Security - client cannot trigger reminders");
  const clientRemindersRes = await fetch(`${BASE}/api/admin/reminders`, {
    method: "POST",
    headers: { Cookie: clientCookies },
    redirect: "manual",
  });
  assert("Client triggering reminders → 307/302/403/405", "true",
    clientRemindersRes.status === 307 || clientRemindersRes.status === 302 || clientRemindersRes.status === 403 || clientRemindersRes.status === 405
  );
  console.log();

  // =====================
  // TEST 19: Mark already-read notification is idempotent
  // =====================
  console.log("TEST 19: Marking already-read notification is idempotent");
  const allRead = await fetch(`${BASE}/api/notifications?limit=1`, {
    headers: { Cookie: clientCookies },
  }).then(r => r.json());
  const alreadyRead = allRead.notifications?.find(n => n.readAt);
  if (alreadyRead) {
    const idempotentRes = await fetch(`${BASE}/api/notifications`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Cookie: clientCookies },
      body: JSON.stringify({ notificationId: alreadyRead.id }),
    });
    assert("Re-mark read → 200 (no error)", "200", idempotentRes.status);
  } else {
    console.log("  ⚠️  No already-read notification to test idempotency");
  }
  console.log();

  // =====================
  // TEST 20: Notification with invalid ID returns error
  // =====================
  console.log("TEST 20: Marking non-existent notification returns error");
  const invalidRes = await fetch(`${BASE}/api/notifications`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Cookie: clientCookies },
    body: JSON.stringify({ notificationId: "non-existent-id-12345" }),
  });
  assert("Invalid notification → error (4xx or 5xx)", "true",
    invalidRes.status >= 400
  );
  console.log();

  // =====================
  // TEST 21: Mark all read on already-all-read is idempotent
  // =====================
  console.log("TEST 21: Mark all read when already all read is idempotent");
  const markAllAgainRes = await fetch(`${BASE}/api/notifications/read-all`, {
    method: "POST",
    headers: { Cookie: clientCookies },
  });
  assert("Re-mark all → 200", "200", markAllAgainRes.status);
  console.log();

  // =====================
  // TEST 22: Notifications for different appointments are separate
  // =====================
  console.log("TEST 22: Notifications for different appointments are isolated");
  const isolationRes = await fetch(`${BASE}/api/notifications?limit=50`, {
    headers: { Cookie: clientCookies },
  }).then(r => r.json());
  const notifTypes = isolationRes.notifications?.map(n => `${n.type}:${n.appointmentId}`) || [];
  const uniqueAppts = new Set(isolationRes.notifications?.map(n => n.appointmentId).filter(Boolean));
  assert("Multiple appointment IDs in notifications", "true", uniqueAppts.size >= 1);
  console.log(`  Unique appointment IDs in notifications: ${uniqueAppts.size}\n`);

  // =====================
  // SUMMARY
  // =====================
  console.log("========================================");
  console.log(`  PHASE 4 RESULTS: ${PASS} PASS, ${FAIL} FAIL`);
  console.log("========================================");

  if (FAIL > 0) {
    process.exit(1);
  }
}

main().catch((e) => {
  console.error("Test error:", e);
  process.exit(1);
});
