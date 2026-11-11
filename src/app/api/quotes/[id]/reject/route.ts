import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import { rejectQuote } from "@/lib/quote-logic";

export const dynamic = "force-dynamic";

async function handleReject(params: { id: string }) {
  const session = await getServerSession(authConfig);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const quote = await rejectQuote(params.id, session.user.id);
  return NextResponse.json(quote);
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    return await handleReject(params);
  } catch (error: any) {
    console.error("Error rejecting quote:", error);
    return NextResponse.json({ error: error.message || "Error al rechazar cotización" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    return await handleReject(params);
  } catch (error: any) {
    console.error("Error rejecting quote:", error);
    return NextResponse.json({ error: error.message || "Error al rechazar cotización" }, { status: 500 });
  }
}
