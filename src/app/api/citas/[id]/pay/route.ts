import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { initiatePayment, checkPaymentStatus } from "@/lib/payment-logic";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    if (process.env.NODE_ENV === "production") return NextResponse.json({error:"Los pagos automáticos aún no están habilitados. Consulta los medios de pago disponibles en tu cita."},{status:503});
    const body = await request.json();
    const { paymentId, action } = body;

    if (!paymentId) {
      return NextResponse.json({ error: "paymentId requerido" }, { status: 400 });
    }

    const payment = await prisma.payment.findUnique({where:{id:paymentId},include:{appointment:{include:{client:true}}}});
    if (!payment || payment.appointmentId !== params.id) return NextResponse.json({error:"Pago no encontrado"},{status:404});
    if (payment.appointment.client.userId !== session.user.id && session.user.role !== "ADMIN") return NextResponse.json({error:"No autorizado"},{status:403});
    if (action === "check") {
      const result = await checkPaymentStatus(paymentId);
      return NextResponse.json(result);
    }

    const result = await initiatePayment(paymentId, session.user.id);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error in payment:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
