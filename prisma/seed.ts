import prisma from "@/lib/prisma";
import * as bcrypt from "bcryptjs";

async function main() {
  console.log("🌱 Iniciando seed de datos...");

  // Crear admin inicial
  const adminExists = await prisma.user.findUnique({
    where: { email: "admin@innovarsecurity.com" },
  });

  if (!adminExists) {
    const hashedPassword = await bcrypt.hash("admin123456", 12);
    
    const admin = await prisma.user.create({
      data: {
        email: "admin@innovarsecurity.com",
        password: hashedPassword,
        name: "Administrador Innovar Security",
        role: "ADMIN",
        phone: "3044451436",
        active: true,
        emailVerified: true,
      },
    });
    console.log("✅ Admin creado:", admin.email);
  } else {
    console.log("ℹ️ Admin ya existe");
  }

  // Crear configuración inicial
  const settings = [
    { key: "business_name", value: "Innovar Security", description: "Nombre del negocio", type: "STRING", group: "general" },
    { key: "business_phone", value: "3044451436", description: "Teléfono del negocio", type: "STRING", group: "general" },
    { key: "business_location", value: JSON.stringify({ municipality: "Fómeque", department: "Cundinamarca", country: "Colombia" }), description: "Ubicación base", type: "JSON", group: "general" },
    { key: "business_email", value: "contacto@innovarsecurity.com", description: "Email comercial", type: "STRING", group: "general" },
    { key: "reprogramation_hours", value: "24", description: "Horas mínimas para reprogramar", type: "NUMBER", group: "policy" },
    { key: "appointment_duration", value: "60", description: "Duración por defecto de cita (minutos)", type: "NUMBER", group: "general" },
    { key: "max_photos_per_appointment", value: "10", description: "Máximo de fotos por cita", type: "NUMBER", group: "general" },
    { key: "upload_max_size", value: "5242880", description: "Tamaño máximo de archivo (bytes)", type: "NUMBER", group: "general" },
    { key: "currency", value: "COP", description: "Moneda del negocio", type: "STRING", group: "general" },
    { key: "payment_enabled", value: "true", description: "¿Habilitar pagos?", type: "BOOLEAN", group: "payment" },
    { key: "payment_nequi_number", value: "3044451436", description: "Número de Nequi para pagos (Celular Administrador)", type: "STRING", group: "payment" },
    { key: "payment_nequi_name", value: "Innovar Security - Yeison", description: "Titular de la cuenta Nequi", type: "STRING", group: "payment" },
    { key: "payment_bancolombia_type", value: "Ahorros", description: "Tipo de cuenta Bancolombia (Ahorros / Corriente)", type: "STRING", group: "payment" },
    { key: "payment_bancolombia_number", value: "Pendiente de configurar", description: "Número de cuenta Bancolombia", type: "STRING", group: "payment" },
    { key: "payment_bancolombia_name", value: "Innovar Security", description: "Titular de cuenta Bancolombia", type: "STRING", group: "payment" },
    { key: "payment_instructions", value: "Transfiere al Nequi o cuenta Bancolombia indicando el código de tu cita como referencia. Luego adjunta el comprobante para que el administrador verifique y apruebe tu cita.", description: "Instrucciones para el cliente", type: "STRING", group: "payment" },
    { key: "notifications_enabled", value: "false", description: "¿Habilitar notificaciones?", type: "BOOLEAN", group: "notifications" },
    { key: "reminder_hours_before", value: "24", description: "Horas antes para enviar recordatorio", type: "NUMBER", group: "notifications" },
    { key: "reminder_enabled", value: "true", description: "¿Habilitar recordatorios automáticos?", type: "BOOLEAN", group: "notifications" },
    { key: "backup_enabled", value: "true", description: "¿Habilitar backups automáticos?", type: "BOOLEAN", group: "general" },
  ];

  for (const setting of settings) {
    const exists = await prisma.setting.findUnique({
      where: { key: setting.key },
    });
    if (!exists) {
      await prisma.setting.create({ data: setting });
      console.log(`✅ Setting creado: ${setting.key}`);
    }
  }

  // Crear servicios por defecto
  const defaultServices = [
    { name: "Instalación de Cámaras", slug: "instalacion", description: "Instalación profesional de cámaras de seguridad CCTV/IP", price: null, duration: 120, sortOrder: 1 },
    { name: "Mantenimiento Preventivo", slug: "mantenimiento", description: "Revisión y mantenimiento preventivo de sistemas de seguridad", price: null, duration: 60, sortOrder: 2 },
    { name: "Visita Técnica", slug: "visita-tecnica", description: "Evaluación técnica del lugar para instalación de seguridad", price: null, duration: 60, sortOrder: 3, requiresVisit: true },
  ];
  for (const svc of defaultServices) {
    const exists = await prisma.service.findUnique({ where: { slug: svc.slug } });
    if (!exists) {
      await prisma.service.create({ data: { ...svc, features: "[]", exclusions: "[]" } });
      console.log(`✅ Servicio creado: ${svc.name}`);
    }
  }

  // Crear horarios por defecto (PENDIENTE - configurar desde admin)
  const defaultDays = [1, 2, 3, 4, 5]; // Lunes a Viernes
  for (const day of defaultDays) {
    await prisma.schedule.create({
      data: {
        dayOfWeek: day,
        startTime: "08:00",
        endTime: "12:00",
        blockDuration: 60,
        active: true,
      },
    });
    await prisma.schedule.create({
      data: {
        dayOfWeek: day,
        startTime: "14:00",
        endTime: "18:00",
        blockDuration: 60,
        active: true,
      },
    });
  }

  // Crear excepciones de días festivos
  const holidays = [
    { date: new Date("2026-12-25T12:00:00Z"), type: "BLOCKED", description: "Navidad" },
    { date: new Date("2027-01-01T12:00:00Z"), type: "BLOCKED", description: "Año Nuevo" },
    { date: new Date("2027-05-01T12:00:00Z"), type: "BLOCKED", description: "Día del Trabajo" },
  ];
  for (const holiday of holidays) {
    const exists = await prisma.scheduleException.findFirst({ where: { date: holiday.date } });
    if (!exists) {
      await prisma.scheduleException.create({ data: holiday });
      console.log(`✅ Festivo creado: ${holiday.description}`);
    }
  }

  // Crear FAQ por defecto
  const faqs = [
    { question: "¿Qué servicios ofrece Innovar Security?", answer: "Innovar Security ofrece servicios profesionales de instalación, mantenimiento y asesoría de cámaras de seguridad." },
    { question: "¿Cómo solicito un servicio?", answer: "Puedes solicitar un servicio a través de nuestro formulario en la página 'Solicitar Servicio'. Sigue los pasos y selecciona tu fecha y horario disponibles." },
    { question: "¿Necesito pagar para confirmar una cita?", answer: "Sí, una cita que no haya sido pagada y confirmada no se considera confirmada. El proceso de pago se detallará pronto." },
    { question: "¿Puedo reprogramar mi cita?", answer: "Sí, puedes solicitar una reprogramación siempre que falten más de 24 horas para tu cita." },
    { question: "¿Qué información necesito proporcionar?", answer: "Te pedimos información sobre el servicio que necesitas, la ubicación, fotos del lugar, y cualquier condición especial." },
  ];

  for (const faq of faqs) {
    const exists = await prisma.fAQ.findFirst({
      where: { question: faq.question },
    });
    if (!exists) {
      await prisma.fAQ.create({ data: faq });
      console.log(`✅ FAQ creada: ${faq.question}`);
    }
  }

  // Crear contenido por defecto
  const contents = [
    { section: "hero", title: "Innovar Security", subtitle: "Protección Profesional", description: "Especialistas en cámaras de seguridad en Fómeque, Cundinamarca.", buttonText: "Solicitar Servicio", buttonUrl: "/solicitar" },
    { section: "about", title: "Sobre Nosotros", description: "Innovar Security es un negocio de cámaras de seguridad dedicado a proteger lo que más valoras en Fómeque y Cundinamarca." },
    { section: "services", title: "Nuestros Servicios", description: "Soluciones completas de videovigilancia y seguridad electrónica adaptadas a las necesidades específicas de tu hogar o negocio." },
    { section: "how_it_works", title: "Cómo Funciona", description: "1. Solicita tu servicio. 2. Proporciona información y fotos. 3. Selecciona fecha y horario. 4. Confirma con pago. 5. ¡Listo! Te atenderemos." },
    { section: "contact", title: "Contáctanos", description: "Teléfono: 3044451436 | Email: contacto@innovarsecurity.com | Ubicación: Fómeque, Cundinamarca, Colombia", buttonText: "Contactar", buttonUrl: "/contacto" },
    { section: "footer", title: "Innovar Security", description: "Protección profesional para tu hogar o negocio.", buttonText: "", buttonUrl: "" },
  ];

  for (const content of contents) {
    const exists = await prisma.content.findUnique({
      where: { section: content.section },
    });
    if (!exists) {
      await prisma.content.create({ data: content });
      console.log(`✅ Contenido creado: ${content.section}`);
    }
  }

  // Crear mensaje de chatbot por defecto
  const chatbotMessages = [
    { type: "QUESTION", question: "¿En qué puedo ayudarte?", answer: "Puedo orientarte sobre los servicios de Innovar Security, el proceso de solicitud de citas, y responder preguntas frecuentes.", options: JSON.stringify(["¿Qué servicios ofrecen?", "¿Cómo solicitar una cita?", "¿Cuánto cuesta?", "Contactar al negocio"]) },
    { type: "QUESTION", question: "¿Qué servicios ofrecemos?", answer: "Innovar Security ofrece: Visitas técnicas, Instalación, Mantenimiento, Reparación, Configuración, y Otros servicios (por configurar).", options: JSON.stringify(["Ver servicios", "Solicitar cita", "Volver"]) },
    { type: "QUESTION", question: "¿Cómo funciona el proceso?", answer: "1. Selecciona el servicio. 2. Proporciona información y fotos. 3. Elige fecha y horario. 4. Confirma con pago. 5. Tu cita queda confirmada.", options: JSON.stringify(["Ver detalle", "Solicitar cita", "Volver"]) },
    { type: "QUESTION", question: "¿Por qué es importante confirmar?", answer: "Una cita que no haya sido pagada y confirmada no se considera una cita confirmada. Esto nos permite organizar mejor los desplazamientos y evitar inconvenientes.", options: JSON.stringify(["Entendido", "Volver"]) },
    { type: "QUESTION", question: "¿Puedo reprogramar mi cita?", answer: "Sí, puedes solicitar la reprogramación si faltan más de 24 horas para tu cita. Desde el panel de citas podrás hacer la solicitud.", options: JSON.stringify(["Solicitar reprogramación", "Volver"]) },
    { type: "ANSWER", question: "", answer: "¡Gracias por contactarte con Innovar Security! Para más información, llama al 3044451436 o visita nuestra página web.", options: JSON.stringify([]) },
  ];

  for (const msg of chatbotMessages) {
    await prisma.chatbotMessage.create({ data: msg });
  }
  console.log("✅ Mensajes de chatbot creados");

  console.log("\n🌱 Seed completado exitosamente!");
  if (process.env.NODE_ENV !== "production") {
    console.log("Admin: admin@innovarsecurity.com / Contraseña: admin123456");
  }
  console.log("⚠️  CAMBIAR LA CONTRASEÑA DEL ADMIN INMEDIATAMENTE EN PRODUCCIÓN");
}

main().catch((e) => {
  console.error("Error en seed:", e);
  process.exit(1);
});
