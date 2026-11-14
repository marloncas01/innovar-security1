import { NextRequest, NextResponse } from "next/server";
import { processPaymentWebhook } from "@/lib/payment-logic";

export async function POST(request: NextRequest) {
  const webhookSecret = process.env.WEBHOOK_SECRET;
  if (webhookSecret) {
    const provided = request.headers.get("x-webhook-secret");
    if (provided !== webhookSecret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  } else {
    return NextResponse.json({error:"Integración de pagos no habilitada"},{status:503});
  }

  try {
    const body = await request.json();
    const signature = request.headers.get("x-payment-signature") || undefined;

    const result = await processPaymentWebhook(body, signature);
    return NextResponse.json({ received: true, status: result.status });
  } catch (error) {
    console.error("Payment webhook error:", error);
    return NextResponse.json({ error: "Error procesando webhook" }, { status: 500 });
  }
}
