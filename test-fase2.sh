#!/bin/bash
set -e

echo "========================================"
echo "  FASE 2 — PRUEBAS OBLIGATORIAS"
echo "========================================"
echo ""

PASS=0
FAIL=0

assert() {
  local name="$1"
  local expected="$2"
  local actual="$3"
  if [ "$actual" = "$expected" ]; then
    echo "  ✅ PASS: $name (got: $actual)"
    PASS=$((PASS + 1))
  else
    echo "  ❌ FAIL: $name (expected: $expected, got: $actual)"
    FAIL=$((FAIL + 1))
  fi
}

assert_contains() {
  local name="$1"
  local needle="$2"
  local haystack="$3"
  if echo "$haystack" | grep -q "$needle"; then
    echo "  ✅ PASS: $name"
    PASS=$((PASS + 1))
  else
    echo "  ❌ FAIL: $name (not found: $needle)"
    FAIL=$((FAIL + 1))
  fi
}

# --- TEST 1: Public services API ---
echo "TEST 1: Public services API"
RESP=$(curl -s http://localhost:3000/api/services 2>/dev/null)
SERVICES=$(echo "$RESP" | python3 -c "import sys,json; print(len(json.load(sys.stdin)))" 2>/dev/null || echo "ERROR")
assert "GET /api/services returns services" "2" "$SERVICES"

# --- TEST 2: Public availability API (work day) ---
echo "TEST 2: Availability on Monday (work day)"
RESP=$(curl -s "http://localhost:3000/api/schedules/availability?date=2026-09-14" 2>/dev/null)
IS_WORK=$(echo "$RESP" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['isWorkDay'])" 2>/dev/null || echo "ERROR")
SLOTS=$(echo "$RESP" | python3 -c "import sys,json; d=json.load(sys.stdin); print(len(d['slots']))" 2>/dev/null || echo "ERROR")
assert "Monday is a work day" "True" "$IS_WORK"
assert "Monday has available slots" "12" "$SLOTS"

# --- TEST 3: Availability on Sunday (non-work day) ---
echo "TEST 3: Availability on Sunday (non-work day)"
RESP=$(curl -s "http://localhost:3000/api/schedules/availability?date=2026-09-13" 2>/dev/null)
IS_WORK=$(echo "$RESP" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['isWorkDay'])" 2>/dev/null || echo "ERROR")
SLOTS=$(echo "$RESP" | python3 -c "import sys,json; d=json.load(sys.stdin); print(len(d['slots']))" 2>/dev/null || echo "ERROR")
assert "Sunday is NOT a work day" "False" "$IS_WORK"
assert "Sunday has 0 slots" "0" "$SLOTS"

# --- TEST 4: Unauthenticated /citas (should redirect) ---
echo "TEST 4: Unauthenticated /citas redirects to login"
HTTP=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/citas 2>/dev/null)
assert "GET /citas without auth → 302" "302" "$HTTP"

# --- TEST 5: Unauthenticated /admin/citas (should redirect) ---
echo "TEST 5: Unauthenticated /admin/citas redirects to login"
HTTP=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/admin/citas 2>/dev/null)
assert "GET /admin/citas without auth → 302" "302" "$HTTP"

# --- TEST 6: /solicitar is PUBLIC ---
echo "TEST 6: /solicitar is public"
HTTP=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/solicitar 2>/dev/null)
assert "GET /solicitar → 200 (public)" "200" "$HTTP"

# --- TEST 7: /servicios is PUBLIC ---
echo "TEST 7: /servicios is public"
HTTP=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/servicios 2>/dev/null)
assert "GET /servicios → 200 (public)" "200" "$HTTP"

# --- TEST 8: Login as admin, get session cookie ---
echo "TEST 8: Login as admin"
CSRF=$(curl -s -c /tmp/cookies.txt http://localhost:3000/api/auth/csrf 2>/dev/null | python3 -c "import sys,json; print(json.load(sys.stdin)['csrfToken'])" 2>/dev/null || echo "")
LOGIN_RESP=$(curl -s -X POST http://localhost:3000/api/auth/callback/credentials \
  -b /tmp/cookies.txt -c /tmp/cookies.txt \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "email=admin@innovarsecurity.com&password=admin123456&csrfToken=$CSRF" \
  -o /dev/null -w "%{http_code}" 2>/dev/null)
assert "Admin login → 302" "302" "$LOGIN_RESP"

# Get session
SESSION=$(curl -s -b /tmp/cookies.txt http://localhost:3000/api/auth/session 2>/dev/null)
ADMIN_ID=$(echo "$SESSION" | python3 -c "import sys,json; print(json.load(sys.stdin).get('user',{}).get('id',''))" 2>/dev/null || echo "")
if [ -n "$ADMIN_ID" ]; then
  echo "  ✅ PASS: Admin session active (id: ${ADMIN_ID:0:8}...)"
  PASS=$((PASS + 1))
else
  echo "  ❌ FAIL: Admin session not found"
  FAIL=$((FAIL + 1))
fi

# --- TEST 9: Register a test client ---
echo "TEST 9: Register a test client"
REG_RESP=$(curl -s -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Cliente Test","email":"test@test.com","phone":"3001234567","password":"test123456"}' 2>/dev/null)
REG_MSG=$(echo "$REG_RESP" | python3 -c "import sys,json; print(json.load(sys.stdin).get('message',''))" 2>/dev/null || echo "ERROR")
assert "Register client → success" "Cuenta creada exitosamente" "$REG_MSG"

# --- TEST 10: Login as client, create appointment ---
echo "TEST 10: Client creates appointment"
CSRF2=$(curl -s -c /tmp/cookies_client.txt http://localhost:3000/api/auth/csrf 2>/dev/null | python3 -c "import sys,json; print(json.load(sys.stdin)['csrfToken'])" 2>/dev/null || echo "")
curl -s -X POST http://localhost:3000/api/auth/callback/credentials \
  -b /tmp/cookies_client.txt -c /tmp/cookies_client.txt \
  -H "Content-Type: application/x-www-form-form-urlencoded" \
  -d "email=test@test.com&password=test123456&csrfToken=$CSRF2" \
  -o /dev/null 2>/dev/null

# Get service ID
SERVICE_ID=$(curl -s http://localhost:3000/api/services | python3 -c "import sys,json; print(json.load(sys.stdin)[0]['id'])" 2>/dev/null || echo "")

APPT_RESP=$(curl -s -X POST http://localhost:3000/api/citas \
  -b /tmp/cookies_client.txt \
  -H "Content-Type: application/json" \
  -d "{\"serviceId\":\"$SERVICE_ID\",\"scheduledDate\":\"2026-09-15\",\"startTime\":\"08:00\",\"endTime\":\"09:00\",\"locationAddress\":\"Calle 123, Fómeque\"}" 2>/dev/null)
APPT_ID=$(echo "$APPT_RESP" | python3 -c "import sys,json; print(json.load(sys.stdin).get('id',''))" 2>/dev/null || echo "")
APPT_STATUS=$(echo "$APPT_RESP" | python3 -c "import sys,json; print(json.load(sys.stdin).get('status',''))" 2>/dev/null || echo "ERROR")
assert "Client creates appointment → PENDING" "PENDING" "$APPT_STATUS"
echo "  Appointment ID: ${APPT_ID:0:8}..."

# --- TEST 11: Double booking prevention ---
echo "TEST 11: Double booking prevention (same slot)"
DUP_RESP=$(curl -s -X POST http://localhost:3000/api/citas \
  -b /tmp/cookies_client.txt \
  -H "Content-Type: application/json" \
  -d "{\"serviceId\":\"$SERVICE_ID\",\"scheduledDate\":\"2026-09-15\",\"startTime\":\"08:00\",\"endTime\":\"09:00\",\"locationAddress\":\"Otra direccion\"}" 2>/dev/null)
DUP_ERR=$(echo "$DUP_RESP" | python3 -c "import sys,json; print(json.load(sys.stdin).get('error',''))" 2>/dev/null || echo "")
assert_contains "Double booking blocked" "disponible" "$DUP_ERR"

# --- TEST 12: Client cannot see other client's appointment ---
echo "TEST 12: Client cannot access other client's appointment (ownership)"
# Register another client
curl -s -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Otro Cliente","email":"otro@test.com","phone":"3009876543","password":"test123456"}' > /dev/null 2>&1
# Login as other client
CSRF3=$(curl -s -c /tmp/cookies_client2.txt http://localhost:3000/api/auth/csrf 2>/dev/null | python3 -c "import sys,json; print(json.load(sys.stdin)['csrfToken'])" 2>/dev/null || echo "")
curl -s -X POST http://localhost:3000/api/auth/callback/credentials \
  -b /tmp/cookies_client2.txt -c /tmp/cookies_client2.txt \
  -H "Content-Type: application/x-www-form-form-urlencoded" \
  -d "email=otro@test.com&password=test123456&csrfToken=$CSRF3" \
  -o /dev/null 2>/dev/null
# Try to access first client's appointment
OTHER_HTTP=$(curl -s -b /tmp/cookies_client2.txt -o /dev/null -w "%{http_code}" "http://localhost:3000/api/citas/$APPT_ID" 2>/dev/null)
assert "Other client gets 403 on first client's appointment" "403" "$OTHER_HTTP"

# --- TEST 13: Client lists only their own appointments ---
echo "TEST 13: Client lists only their own appointments"
MY_APPTS=$(curl -s -b /tmp/cookies_client.txt http://localhost:3000/api/citas 2>/dev/null)
MY_COUNT=$(echo "$MY_APPTS" | python3 -c "import sys,json; print(len(json.load(sys.stdin)))" 2>/dev/null || echo "ERROR")
assert "Client has 1 appointment" "1" "$MY_COUNT"

OTHER_APPTS=$(curl -s -b /tmp/cookies_client2.txt http://localhost:3000/api/citas 2>/dev/null)
OTHER_COUNT=$(echo "$OTHER_APPTS" | python3 -c "import sys,json; print(len(json.load(sys.stdin)))" 2>/dev/null || echo "ERROR")
assert "Other client has 0 appointments" "0" "$OTHER_COUNT"

# --- TEST 14: Admin confirms appointment ---
echo "TEST 14: Admin confirms appointment"
CONFIRM_RESP=$(curl -s -X PATCH "http://localhost:3000/api/admin/citas/$APPT_ID" \
  -b /tmp/cookies.txt \
  -H "Content-Type: application/json" \
  -d '{"status":"CONFIRMED","adminNotes":"Revisado y confirmado"}' 2>/dev/null)
CONFIRM_STATUS=$(echo "$CONFIRM_RESP" | python3 -c "import sys,json; print(json.load(sys.stdin).get('status',''))" 2>/dev/null || echo "ERROR")
assert "Admin confirms → CONFIRMED" "CONFIRMED" "$CONFIRM_STATUS"

# --- TEST 15: History records changes ---
echo "TEST 15: Appointment history records changes"
HISTORY=$(curl -s -b /tmp/cookies_client.txt "http://localhost:3000/api/citas/$APPT_ID" 2>/dev/null)
HISTORY_COUNT=$(echo "$HISTORY" | python3 -c "import sys,json; print(len(json.load(sys.stdin).get('historyItems',[])))" 2>/dev/null || echo "ERROR")
assert "History has at least 2 entries (CREATED + STATUS_CHANGED)" "2" "$HISTORY_COUNT"

# --- TEST 16: Reprogram request (client) ---
echo "TEST 16: Client requests reprogramming"
REPROG_RESP=$(curl -s -X POST "http://localhost:3000/api/citas/$APPT_ID/reprogram" \
  -b /tmp/cookies_client.txt \
  -H "Content-Type: application/json" \
  -d '{"newDate":"2026-09-16","newTime":"10:00","reason":"No me queda el horario"}' 2>/dev/null)
REPROG_STATUS=$(echo "$REPROG_RESP" | python3 -c "import sys,json; print(json.load(sys.stdin).get('status',''))" 2>/dev/null || echo "ERROR")
assert "Reprogram request → PENDING" "PENDING" "$REPROG_STATUS"

# Check appointment status changed to REPROGRAM_REQUESTED
APPT_AFTER=$(curl -s -b /tmp/cookies_client.txt "http://localhost:3000/api/citas/$APPT_ID" 2>/dev/null)
APPT_ST=$(echo "$APPT_AFTER" | python3 -c "import sys,json; print(json.load(sys.stdin).get('status',''))" 2>/dev/null || echo "ERROR")
assert "Appointment status → REPROGRAM_REQUESTED" "REPROGRAM_REQUESTED" "$APPT_ST"

# --- TEST 17: Admin approves reprogram ---
echo "TEST 17: Admin approves reprogramming"
# Get the reprogram request ID from history
REPROG_ID=$(echo "$APPT_AFTER" | python3 -c "import sys,json; rr=json.load(sys.stdin).get('reprogramRequests',[]); print(rr[0]['id'] if rr else '')" 2>/dev/null || echo "")
APPROVE_RESP=$(curl -s -X POST "http://localhost:3000/api/admin/citas/$APPT_ID/reprogram/respond" \
  -b /tmp/cookies.txt \
  -H "Content-Type: application/json" \
  -d "{\"approve\":true,\"adminNotes\":\"Aprobado\"}" 2>/dev/null)
APPROVE_ST=$(echo "$APPROVE_RESP" | python3 -c "import sys,json; print(json.load(sys.stdin).get('status',''))" 2>/dev/null || echo "ERROR")
assert "Admin approves reprogram → REPROGRAMMED" "REPROGRAMMED" "$APPROVE_ST"

# --- TEST 18: Blocked day cannot be reserved ---
echo "TEST 18: Blocked day cannot be reserved"
# Create a blocked exception
export NVM_DIR="$HOME/.nvm" && [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" && cd "/home/yeison_r/innovar-security" && node -e "
const { PrismaClient } = require('@prisma/client');
async function main() {
  const p = new PrismaClient();
  await p.scheduleException.create({ data: { date: new Date('2026-12-25'), description: 'Navidad', type: 'BLOCKED' } });
  await p.\$disconnect();
}
main();
" 2>/dev/null

BLOCKED_RESP=$(curl -s "http://localhost:3000/api/schedules/availability?date=2026-12-25" 2>/dev/null)
BLOCKED=$(echo "$BLOCKED_RESP" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['isBlocked'])" 2>/dev/null || echo "ERROR")
assert "Dec 25 (Christmas) is blocked" "True" "$BLOCKED"

# --- TEST 19: Admin cancels appointment ---
echo "TEST 19: Admin cancels appointment"
CANCEL_RESP=$(curl -s -X POST http://localhost:3000/api/citas/$APPT_ID/cancel \
  -b /tmp/cookies.txt \
  -H "Content-Type: application/json" 2>/dev/null)
CANCEL_ST=$(echo "$CANCEL_RESP" | python3 -c "import sys,json; print(json.load(sys.stdin).get('status',''))" 2>/dev/null || echo "ERROR")
assert "Admin cancels → CANCELLED" "CANCELLED" "$CANCEL_ST"

# --- TEST 20: History has all entries ---
echo "TEST 20: Complete history"
FINAL=$(curl -s -b /tmp/cookies_client.txt "http://localhost:3000/api/citas/$APPT_ID" 2>/dev/null)
HIST_COUNT=$(echo "$FINAL" | python3 -c "import sys,json; print(len(json.load(sys.stdin).get('historyItems',[])))" 2>/dev/null || echo "ERROR")
echo "  History entries: $HIST_COUNT (CREATED, STATUS_CHANGED, REPROGRAM_REQUESTED, REPROGRAMMED, CANCELLED)"
assert "History has at least 5 entries" "5" "$HIST_COUNT"

# --- SUMMARY ---
echo ""
echo "========================================"
echo "  RESULTS: $PASS passed, $FAIL failed"
echo "========================================"

if [ "$FAIL" -gt 0 ]; then
  exit 1
fi
