import prisma from "@/lib/prisma";
import { getPaymentProvider } from "@/lib/payments";
import { PAYMENT_STATUSES, HISTORY_ACTIONS } from "@/lib/constants";
import { createNotification } from "@/lib/notification-logic";

export interface CreatePaymentInput {
  appointmentId: string;
  amount: number;
  description?: string;
}

export async function createPayment(input: CreatePaymentInput) {
  const appointment = await prisma.appointment.findUnique({
    where: { id: input.appointmentId },
    include: { payment: true },
  });
  if (!appointment) throw new Error("Cita no encontrada");
  if (appointment.payment) throw new Error("Esta cita ya tiene un pago asociado");

  const payment = await prisma.payment.create({
    data: {
      appointmentId: input.appointmentId,
      amount: input.amount,
      description: input.description || `Pago por cita ${input.appointmentId.slice(0, 8)}`,
      status: PAYMENT_STATUSES.PENDING,
    },
  });

  return payment;
}

export async function initiatePayment(paymentId: string, clientId: string) {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: { appointment: { include: { client: true } } },
  });
  if (!payment) throw new Error("Pago no encontrado");
  if (payment.appointment.client.userId !== clientId) throw new Error("No autorizado");
  if (payment.status !== PAYMENT_STATUSES.PENDING) {
    throw new Error("Este pago no está en estado pendiente");
  }

  const provider = getPaymentProvider();
  const result = await provider.createPayment({
    paymentId: payment.id,
    amount: payment.amount,
    currency: payment.currency,
    description: payment.description || "Pago Innovar Security",
    reference: payment.id,
  });

  if (result.transactionId) {
    await prisma.payment.update({
      where: { id: paymentId },
      data: {
        transactionId: result.transactionId,
        reference: result.reference || payment.reference,
        status: result.status,
      },
    });
  }

  return result;
}

export async function checkPaymentStatus(paymentId: string) {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
  });
  if (!payment) throw new Error("Pago no encontrado");
  if (!payment.transactionId) throw new Error("Pago sin transacción asociada");

  const provider = getPaymentProvider();
  const status = await provider.checkStatus(payment.transactionId);

  if (status.status !== payment.status) {
    const updateData: any = { status: status.status };
    if (status.status === PAYMENT_STATUSES.PAID && status.paidAt) {
      updateData.paidAt = status.paidAt;
    }
    await prisma.payment.update({
      where: { id: paymentId },
      data: updateData,
    });

    if (status.status === PAYMENT_STATUSES.PAID) {
      await prisma.appointment.update({
        where: { id: payment.appointmentId },
        data: { status: "CONFIRMED", confirmedAt: new Date() },
      });

      await prisma.appointmentHistory.create({
        data: {
          appointmentId: payment.appointmentId,
          action: HISTORY_ACTIONS.STATUS_CHANGED,
          details: "Estado cambiado de PENDING a CONFIRMED (pago verificado)",
          performedBy: "SYSTEM",
        },
      });

      try {
        const appt = await prisma.appointment.findUnique({
          where: { id: payment.appointmentId },
          select: { clientId: true, service: { select: { name: true } } },
        });
        if (appt) {
          await createNotification({
            clientId: appt.clientId,
            type: "PAYMENT_RECEIVED",
            title: "Pago recibido",
            message: `Tu pago por la cita de ${appt.service.name} fue confirmado.`,
            appointmentId: payment.appointmentId,
          });
        }
      } catch { /* notification failure is non-critical */ }
    }
  }

  return { ...payment, status: status.status, paidAt: status.paidAt };
}

export async function processPaymentWebhook(
  payload: unknown,
  signature?: string
) {
  const provider = getPaymentProvider();
  const result = await provider.processWebhook(payload, signature);

  if (!result.transactionId) {
    throw new Error("Transacción no válida en el webhook");
  }

  const payment = await prisma.payment.findFirst({
    where: { transactionId: result.transactionId },
  });
  if (!payment) throw new Error("Pago no encontrado para esta transacción");

  if (result.status !== payment.status) {
    const updateData: any = { status: result.status };
    if (result.status === PAYMENT_STATUSES.PAID && result.paidAt) {
      updateData.paidAt = result.paidAt;
    }
    await prisma.payment.update({
      where: { id: payment.id },
      data: updateData,
    });

    if (result.status === PAYMENT_STATUSES.PAID) {
      await prisma.appointment.update({
        where: { id: payment.appointmentId },
        data: { status: "CONFIRMED", confirmedAt: new Date() },
      });

      await prisma.appointmentHistory.create({
        data: {
          appointmentId: payment.appointmentId,
          action: HISTORY_ACTIONS.STATUS_CHANGED,
          details: "Estado cambiado de PENDING a CONFIRMED (pago verificado via webhook)",
          performedBy: "SYSTEM",
        },
      });

      try {
        const appt = await prisma.appointment.findUnique({
          where: { id: payment.appointmentId },
          select: { clientId: true, service: { select: { name: true } } },
        });
        if (appt) {
          await createNotification({
            clientId: appt.clientId,
            type: "PAYMENT_RECEIVED",
            title: "Pago recibido",
            message: `Tu pago por la cita de ${appt.service.name} fue confirmado.`,
            appointmentId: payment.appointmentId,
          });
        }
      } catch { /* notification failure is non-critical */ }
    }
  }

  return result;
}

export async function getPaymentByAppointment(appointmentId: string) {
  return prisma.payment.findUnique({
    where: { appointmentId },
  });
}

export async function getClientPaymentId(userId: string): Promise<string | null> {
  const client = await prisma.client.findUnique({
    where: { userId },
    select: { id: true },
  });
  return client?.id ?? null;
}
