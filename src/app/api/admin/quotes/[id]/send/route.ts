import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import { sendQuote } from "@/lib/quote-logic";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const quote = await sendQuote(params.id, session.user.id);
    return NextResponse.json(quote);
  } catch (error: any) {
    console.error("Error sending quote:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
