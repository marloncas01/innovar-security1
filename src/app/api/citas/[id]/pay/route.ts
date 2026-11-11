import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
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

    const body = await request.json();
    const { paymentId, action } = body;

    if (!paymentId) {
      return NextResponse.json({ error: "paymentId requerido" }, { status: 400 });
    }

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
