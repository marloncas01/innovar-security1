import { PrismaClient } from "@prisma/client";
import { defaultFaqs, defaultServices } from "../src/lib/public-content";

const prisma = new PrismaClient();

async function seed() {
  if (await prisma.setting.findUnique({ where: { key: "public_setup_v1" } })) return;
  await prisma.$transaction(async (tx) => {
    for (const [index, service] of defaultServices.entries()) {
      const { id: _id, ...data } = service;
      await tx.service.upsert({ where: { slug: service.slug }, update: {}, create: { ...data, duration: index === 0 ? 120 : 60, sortOrder: index + 1 } });
    }
    for (const faq of defaultFaqs) {
      if (!await tx.fAQ.findFirst({ where: { question: faq.question } })) {
        await tx.fAQ.create({ data: { question: faq.question, answer: faq.answer } });
      }
    }
    if (!await tx.zone.findFirst({ where: { municipality: "Fómeque" } })) {
      await tx.zone.create({ data: { name: "Fómeque", municipality: "Fómeque", department: "Cundinamarca" } });
    }
    const settings = { business_name: "Innovar Security", business_phone: "3044451436", business_email: "contacto@innovarsecurity.com", currency: "COP", payment_enabled: "false", notifications_enabled: "false", public_setup_v1: "true" };
    for (const [key, value] of Object.entries(settings)) {
      await tx.setting.upsert({ where: { key }, update: {}, create: { key, value } });
    }
  }, { timeout: 30000 });
  console.log("Catálogo y configuración pública inicializados.");
}

seed().catch((error) => { console.error("No se pudo inicializar el catálogo", error); process.exitCode = 1; }).finally(() => prisma.$disconnect());
