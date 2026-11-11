import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding staging database...");

  // Admin user
  const adminHash = await bcrypt.hash("StagingAdmin123!", 12);
  await prisma.user.upsert({
    where: { email: "admin@staging-innovar.com" },
    update: {},
    create: {
      email: "admin@staging-innovar.com",
      name: "Admin Staging",
      password: adminHash,
      role: "ADMIN",
      phone: "3000000000",
      emailVerified: new Date(),
    },
  });

  // Test client
  const clientHash = await bcrypt.hash("StagingClient123!", 12);
  const clientUser = await prisma.user.upsert({
    where: { email: "cliente@staging-innovar.com" },
    update: {},
    create: {
      email: "cliente@staging-innovar.com",
      name: "Cliente de Prueba",
      password: clientHash,
      role: "CLIENT",
      phone: "3000000001",
      emailVerified: new Date(),
    },
  });

  await prisma.client.upsert({
    where: { userId: clientUser.id },
    update: {},
    create: {
      userId: clientUser.id,
      name: "Cliente de Prueba",
      phone: "3000000001",
      email: "cliente@staging-innovar.com",
    },
  });

  // Services
  const services = [
    { name: "Instalación de Cámaras", slug: "instalacion", description: "Instalación profesional de cámaras de seguridad CCTV/IP", price: null, duration: 120, sortOrder: 1, features: JSON.stringify(["Cámaras IP/CCTV", " grabación 24/7", " acceso remoto"]), exclusions: JSON.stringify(["Cámaras no incluidas en precio base"]) },
    { name: "Mantenimiento Preventivo", slug: "mantenimiento", description: "Revisión y mantenimiento preventivo de sistemas de seguridad", price: null, duration: 60, sortOrder: 2, features: JSON.stringify(["Revisión general", " limpieza", " actualización firmware"]) },
    { name: "Visita Técnica", slug: "visita-tecnica", description: "Evaluación técnica del lugar para instalación de seguridad", price: null, duration: 60, sortOrder: 3, requiresVisit: true, features: JSON.stringify(["Evaluación del sitio", " recomendaciones", " presupuesto"]) },
  ];

  for (const svc of services) {
    await prisma.service.upsert({
      where: { slug: svc.slug },
      update: {},
      create: svc as any,
    });
  }

  // Schedules (Mon-Fri)
  for (let day = 1; day <= 5; day++) {
    const existing = await prisma.schedule.findFirst({ where: { dayOfWeek: day, startTime: "08:00" } });
    if (!existing) {
      await prisma.schedule.create({ data: { dayOfWeek: day, startTime: "08:00", endTime: "12:00", blockDuration: 60, active: true } });
      await prisma.schedule.create({ data: { dayOfWeek: day, startTime: "14:00", endTime: "18:00", blockDuration: 60, active: true } });
    }
  }

  // Settings
  const settings = [
    { key: "business_name", value: "Innovar Security (STAGING)", group: "general", description: "Nombre del negocio" },
    { key: "business_phone", value: "3000000000", group: "general", description: "Teléfono del negocio" },
    { key: "business_location", value: "Staging - Por definir", group: "general", description: "Ubicación del negocio" },
    { key: "business_email", value: "staging@innovar.com", group: "general", description: "Correo del negocio" },
  ];

  for (const setting of settings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: setting,
    });
  }

  // Zones
  await prisma.zone.upsert({
    where: { id: "staging-zone-1" },
    update: {},
    create: { id: "staging-zone-1", name: "Zona Centro (STAGING)", municipality: "Staging Municipio", department: "Staging Dept", flatRate: 0, active: true, notes: "Datos de staging" },
  });

  console.log("Staging seed completed!");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
