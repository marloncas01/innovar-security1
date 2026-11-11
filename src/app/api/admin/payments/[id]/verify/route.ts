import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const body = await request.json();
    const { action, notes } = body; // action: "CONFIRM" | "REJECT"

    const payment = await prisma.payment.findUnique({
      where: { id: params.id },
      include: { appointment: { include: { client: true, service: true } } },
    });

    if (!payment) {
      return NextResponse.json({ error: "Pago no encontrado" }, { status: 404 });
    }

    if (action === "CONFIRM") {
      const updatedPayment = await prisma.payment.update({
        where: { id: params.id },
        data: {
          status: "PAID",
          paidAt: new Date(),
          notes: notes ? `${payment.notes || ""} [Admin: ${notes}]` : payment.notes,
        },
      });

      // Confirmar cita asociada
      await prisma.appointment.update({
        where: { id: payment.appointmentId },
        data: {
          status: "CONFIRMED",
        },
      });

      // Registrar historial
      await prisma.appointmentHistory.create({
        data: {
          appointmentId: payment.appointmentId,
          action: "PAYMENT_CONFIRMED",
          details: `Administrador confirmó el pago de $${payment.amount.toLocaleString("es-CO")} COP por ${payment.method || "Transferencia"}. Cita confirmada.`,
          performedBy: session.user.name || "ADMIN",
        },
      });

      // Notificar al cliente
      if (payment.appointment.clientId) {
        await prisma.clientNotification.create({
          data: {
            clientId: payment.appointment.clientId,
            type: "PAYMENT_CONFIRMED",
            title: "¡Pago confirmado!",
            message: `Tu pago de $${payment.amount.toLocaleString("es-CO")} COP ha sido verificado con éxito. Tu cita de ${payment.appointment.service.name} está formalmente confirmada.`,
            appointmentId: payment.appointmentId,
          },
        });
      }

      return NextResponse.json({ success: true, payment: updatedPayment, appointmentStatus: "CONFIRMED" });
    } else if (action === "REJECT") {
      const updatedPayment = await prisma.payment.update({
        where: { id: params.id },
        data: {
          status: "FAILED",
          notes: notes ? `${payment.notes || ""} [Rechazado por Admin: ${notes}]` : payment.notes,
        },
      });

      // Registrar historial
      await prisma.appointmentHistory.create({
        data: {
          appointmentId: payment.appointmentId,
          action: "PAYMENT_REJECTED",
          details: `Administrador rechazó el reporte de pago. Motivo: ${notes || "Comprobante o referencia no coincide"}.`,
          performedBy: session.user.name || "ADMIN",
        },
      });

      // Notificar al cliente
      if (payment.appointment.clientId) {
        await prisma.clientNotification.create({
          data: {
            clientId: payment.appointment.clientId,
            type: "PAYMENT_REJECTED",
            title: "Pago no verificado",
            message: `No pudimos validar tu reporte de pago. Motivo: ${notes || "Comprobante no legible o referencia no encontrada"}. Por favor vuelve a reportar o contáctanos.`,
            appointmentId: payment.appointmentId,
          },
        });
      }

      return NextResponse.json({ success: true, payment: updatedPayment });
    }

    return NextResponse.json({ error: "Acción inválida" }, { status: 400 });
  } catch (error: any) {
    console.error("Error confirming payment by admin:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
