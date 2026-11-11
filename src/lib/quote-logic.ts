import prisma from "@/lib/prisma";
import { QUOTE_STATUSES } from "@/lib/constants";
import { createNotification } from "@/lib/notification-logic";

export interface QuoteItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface CreateQuoteInput {
  appointmentId: string;
  clientId: string;
  items: QuoteItem[];
  displacement?: number;
  observations?: string;
  validDays?: number;
}

export interface UpdateQuoteInput {
  items?: QuoteItem[];
  displacement?: number;
  observations?: string;
}

export async function createQuote(input: CreateQuoteInput) {
  const appointment = await prisma.appointment.findUnique({
    where: { id: input.appointmentId },
  });
  if (!appointment) throw new Error("Cita no encontrada");

  const subtotal = input.items.reduce((sum, item) => sum + item.total, 0);
  const total = subtotal + (input.displacement || 0);

  const validUntil = new Date();
  validUntil.setDate(validUntil.getDate() + (input.validDays || 15));

  const quote = await prisma.quote.create({
    data: {
      appointmentId: input.appointmentId,
      clientId: input.clientId,
      items: JSON.stringify(input.items),
      subtotal,
      displacement: input.displacement || null,
      total,
      observations: input.observations || null,
      status: QUOTE_STATUSES.DRAFT,
      validUntil,
    },
  });

  return quote;
}

export async function updateQuote(
  quoteId: string,
  input: UpdateQuoteInput,
  adminId: string
) {
  const quote = await prisma.quote.findUnique({ where: { id: quoteId } });
  if (!quote) throw new Error("Cotización no encontrada");
  if (quote.status !== QUOTE_STATUSES.DRAFT) {
    throw new Error("Solo se pueden editar cotizaciones en borrador");
  }

  let items = input.items;
  let subtotal = quote.subtotal;

  if (items) {
    subtotal = items.reduce((sum, item) => sum + item.total, 0);
  }

  const displacement = input.displacement !== undefined ? input.displacement : quote.displacement;
  const total = subtotal + (displacement || 0);

  const updated = await prisma.quote.update({
    where: { id: quoteId },
    data: {
      ...(items && { items: JSON.stringify(items) }),
      subtotal,
      displacement,
      total,
      ...(input.observations !== undefined && { observations: input.observations }),
    },
  });

  return updated;
}

export async function sendQuote(quoteId: string, adminId: string) {
  const quote = await prisma.quote.findUnique({ where: { id: quoteId } });
  if (!quote) throw new Error("Cotización no encontrada");
  if (quote.status !== QUOTE_STATUSES.DRAFT) {
    throw new Error("Solo se pueden enviar cotizaciones en borrador");
  }

  const updated = await prisma.quote.update({
    where: { id: quoteId },
    data: {
      status: QUOTE_STATUSES.SENT,
      sentAt: new Date(),
    },
  });

  try {
    await createNotification({
      clientId: quote.clientId,
      type: "QUOTE_SENT",
      title: "Cotización enviada",
      message: `Se te envió una cotización por $${quote.total.toLocaleString("es-CO")}. Revisa los detalles y responde.`,
      appointmentId: quote.appointmentId,
      quoteId: quote.id,
    });
  } catch { /* notification failure is non-critical */ }

  return updated;
}

export async function acceptQuote(quoteId: string, clientId: string) {
  const quote = await prisma.quote.findUnique({
    where: { id: quoteId },
    include: { client: true },
  });
  if (!quote) throw new Error("Cotización no encontrada");
  if (quote.client.userId !== clientId) throw new Error("No autorizado");
  if (quote.status !== QUOTE_STATUSES.SENT) {
    throw new Error("Solo se pueden aceptar cotizaciones enviadas");
  }

  if (quote.validUntil && new Date() > quote.validUntil) {
    throw new Error("La cotización ha expirado");
  }

  const updated = await prisma.quote.update({
    where: { id: quoteId },
    data: {
      status: QUOTE_STATUSES.ACCEPTED,
      acceptedAt: new Date(),
    },
  });

  try {
    const adminUser = await prisma.user.findFirst({ where: { role: "ADMIN" } });
    if (adminUser) {
      await createNotification({
        userId: adminUser.id,
        type: "QUOTE_ACCEPTED",
        title: "Cotización aceptada",
        message: `El cliente aceptó la cotización por $${quote.total.toLocaleString("es-CO")}.`,
        appointmentId: quote.appointmentId,
        quoteId: quote.id,
      });
    }
  } catch { /* notification failure is non-critical */ }

  return updated;
}

export async function rejectQuote(quoteId: string, clientId: string) {
  const quote = await prisma.quote.findUnique({
    where: { id: quoteId },
    include: { client: true },
  });
  if (!quote) throw new Error("Cotización no encontrada");
  if (quote.client.userId !== clientId) throw new Error("No autorizado");
  if (quote.status !== QUOTE_STATUSES.SENT) {
    throw new Error("Solo se pueden rechazar cotizaciones enviadas");
  }

  const updated = await prisma.quote.update({
    where: { id: quoteId },
    data: {
      status: QUOTE_STATUSES.REJECTED,
      rejectedAt: new Date(),
    },
  });

  try {
    const adminUser = await prisma.user.findFirst({ where: { role: "ADMIN" } });
    if (adminUser) {
      await createNotification({
        userId: adminUser.id,
        type: "QUOTE_REJECTED",
        title: "Cotización rechazada",
        message: `El cliente rechazó la cotización por $${quote.total.toLocaleString("es-CO")}.`,
        appointmentId: quote.appointmentId,
        quoteId: quote.id,
      });
    }
  } catch { /* notification failure is non-critical */ }

  return updated;
}

export async function cancelQuote(quoteId: string, adminId: string) {
  const quote = await prisma.quote.findUnique({ where: { id: quoteId } });
  if (!quote) throw new Error("Cotización no encontrada");
  if (quote.status === QUOTE_STATUSES.ACCEPTED) {
    throw new Error("No se puede cancelar una cotización aceptada");
  }

  const updated = await prisma.quote.update({
    where: { id: quoteId },
    data: { status: QUOTE_STATUSES.CANCELLED },
  });

  try {
    await createNotification({
      clientId: quote.clientId,
      type: "QUOTE_REJECTED",
      title: "Cotización cancelada",
      message: "La cotización fue cancelada por el administrador.",
      appointmentId: quote.appointmentId,
      quoteId: quote.id,
    });
  } catch { /* notification failure is non-critical */ }

  return updated;
}

export async function getQuoteByAppointment(appointmentId: string) {
  return prisma.quote.findFirst({
    where: { appointmentId },
    orderBy: { createdAt: "desc" },
  });
}

export async function getClientQuotes(clientId: string) {
  return prisma.quote.findMany({
    where: { clientId },
    include: {
      appointment: {
        select: { scheduledDate: true, startTime: true, service: { select: { name: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getAllQuotes(filters?: {
  status?: string;
  page?: number;
  limit?: number;
}) {
  const page = filters?.page || 1;
  const limit = filters?.limit || 20;
  const where: any = {};
  if (filters?.status) where.status = filters.status;

  const [quotes, total] = await Promise.all([
    prisma.quote.findMany({
      where,
      include: {
        client: { select: { name: true, phone: true, email: true } },
        appointment: {
          select: { scheduledDate: true, startTime: true, service: { select: { name: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.quote.count({ where }),
  ]);

  return {
    quotes,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  };
}
