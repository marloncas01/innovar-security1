#!/bin/bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
cd "/home/yeison_r/innovar-security"

echo "=== Reset DB ==="
rm -f prisma/dev.db
npx prisma db push --skip-generate 2>&1 | tail -1

echo "=== Seed DB ==="
node -e "
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
async function main() {
  const p = new PrismaClient();
  const h = await bcrypt.hash('admin123456', 12);
  await p.user.create({ data: { email: 'admin@innovarsecurity.com', password: h, name: 'Administrador', role: 'ADMIN', phone: '3044451436', active: true, emailVerified: true } });
  await p.setting.create({ data: { key: 'business_name', value: 'Innovar Security', description: 'Nombre', type: 'STRING', group: 'general' } });
  await p.setting.create({ data: { key: 'reprogramation_hours', value: '24', description: 'Horas', type: 'NUMBER', group: 'policy' } });
  await p.setting.create({ data: { key: 'appointment_duration', value: '60', description: 'Duracion', type: 'NUMBER', group: 'general' } });
  const sd = [];
  for (const d of [1,2,3,4,5]) {
    sd.push({ dayOfWeek: d, startTime: '08:00', endTime: '12:00', blockDuration: 60, active: true });
    sd.push({ dayOfWeek: d, startTime: '14:00', endTime: '18:00', blockDuration: 60, active: true });
  }
  await p.schedule.createMany({ data: sd });
  await p.service.create({ data: { name: 'Instalacion', slug: 'instalacion', description: 'Instalacion profesional', duration: 120, active: true, features: '[]', exclusions: '[]' } });
  await p.service.create({ data: { name: 'Mantenimiento', slug: 'mantenimiento', description: 'Revision', duration: 60, active: true, features: '[]', exclusions: '[]' } });
  await p.scheduleException.create({ data: { date: new Date('2026-12-25T00:00:00Z'), description: 'Navidad', type: 'BLOCKED' } });
  await p.\$disconnect();
}
main().catch(e => { console.error(e); process.exit(1); });
" 2>&1

echo "=== Build ==="
npm run build 2>&1 | tail -3

echo "=== Start server ==="
node node_modules/.bin/next start -p 3000 &
SERVER_PID=$!

for i in $(seq 1 20); do
  if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 2>/dev/null | grep -q "200"; then
    echo "Server ready after ${i}s"
    break
  fi
  sleep 1
done

echo "=== Run tests ==="
node /home/yeison_r/innovar-security/test-fase2.js
RESULT=$?

kill $SERVER_PID 2>/dev/null
exit $RESULT
