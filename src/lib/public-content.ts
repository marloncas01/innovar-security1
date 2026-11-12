export const defaultServices = [
  { id: "installation", name: "Instalación de Cámaras", slug: "instalacion", description: "Instalación y configuración de cámaras IP y CCTV para hogares y negocios.", price: null, duration: null, imageUrl: null, features: '["Evaluación del lugar","Configuración del sistema de vigilancia"]', exclusions: '[]', requiresVisit: true },
  { id: "maintenance", name: "Mantenimiento", slug: "mantenimiento", description: "Mantenimiento preventivo y correctivo de sistemas de videovigilancia.", price: null, duration: null, imageUrl: null, features: '["Revisión de cámaras y conexiones","Diagnóstico del sistema"]', exclusions: '[]', requiresVisit: true },
  { id: "visit", name: "Visita Técnica", slug: "visita-tecnica", description: "Evaluamos tu espacio y proponemos una solución de seguridad según tus necesidades.", price: null, duration: null, imageUrl: null, features: '["Evaluación de puntos críticos","Cotización personalizada"]', exclusions: '[]', requiresVisit: true },
];

export const defaultFaqs = [
  { id: "services", question: "¿Qué servicios ofrecen?", answer: "Ofrecemos instalación y configuración de cámaras IP y CCTV, mantenimiento preventivo y correctivo y visitas técnicas para evaluar tu hogar o negocio. Puedes consultar Servicios o pedir una cotización por WhatsApp al 304 445 1436 sin crear una cuenta." },
  { id: "prices", question: "¿Cuánto cuesta el servicio?", answer: "El precio depende del número de cámaras, el tipo de equipo y las condiciones del lugar. Solicita una cotización personalizada por WhatsApp al 304 445 1436." },
  { id: "booking", question: "¿Cómo solicito una cita?", answer: "En Solicitar Servicio puedes crear una cuenta o iniciar sesión para agendar y hacer seguimiento. También puedes coordinar una visita por WhatsApp al 304 445 1436 sin registrarte. La disponibilidad se confirma con nuestro equipo." },
  { id: "coverage", question: "¿Dónde prestan servicio?", answer: "Estamos en Fómeque, Cundinamarca. Consulta por WhatsApp al 304 445 1436 la disponibilidad para tu municipio y los posibles costos de desplazamiento." },
];

export function parseStringList(value: unknown): string[] {
  try {
    const parsed: unknown = typeof value === "string" ? JSON.parse(value) : value;
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}
