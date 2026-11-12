import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import { createPayment, initiatePayment, checkPaymentStatus } from "@/lib/payment-logic";
import { getClientIdFromUser } from "@/lib/appointments";
import prisma from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const clientId = await getClientIdFromUser(session.user.id);
    if (!clientId) {
      return NextResponse.json({ error: "Perfil no encontrado" }, { status: 404 });
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id: params.id },
      include: { client: true, service: true },
    });
    if (!appointment) {
      return NextResponse.json({ error: "Cita no encontrada" }, { status: 404 });
    }
    if (appointment.client.userId !== session.user.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const body = await request.json();
    const { description } = body;

    const amount = appointment.service.price ?? 0;

    const payment = await createPayment({
      appointmentId: params.id,
      amount,
      description,
    });

    return NextResponse.json(payment, { status: 201 });
  } catch (error: any) {
    console.error("Error creating payment:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const payment = await prisma.payment.findUnique({
      where: { appointmentId: params.id },
      include: { appointment: { select: { clientId: true } } },
    });

    if (!payment) {
      return NextResponse.json({ error: "Pago no encontrado" }, { status: 404 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (user?.role !== "ADMIN" && payment.appointment.clientId !== await getClientIdFromUser(session.user.id)) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    return NextResponse.json(payment);
  } catch (error) {
    console.error("Error fetching payment:", error);
    return NextResponse.json({ error: "Error al obtener pago" }, { status: 500 });
  }
}
