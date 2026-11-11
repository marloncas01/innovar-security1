import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import { updateQuote } from "@/lib/quote-logic";
import prisma from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const quote = await prisma.quote.findUnique({
      where: { id: params.id },
      include: {
        client: { select: { name: true, phone: true, email: true, userId: true } },
        appointment: { select: { scheduledDate: true, startTime: true, locationAddress: true } },
      },
    });

    if (!quote) {
      return NextResponse.json({ error: "Cotización no encontrada" }, { status: 404 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (user?.role !== "ADMIN" && quote.client.userId !== session.user.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    return NextResponse.json(quote);
  } catch (error) {
    console.error("Error fetching quote:", error);
    return NextResponse.json({ error: "Error al obtener cotización" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const body = await request.json();
    const { items, displacement, observations } = body;

    const quote = await updateQuote(params.id, { items, displacement, observations }, session.user.id);
    return NextResponse.json(quote);
  } catch (error: any) {
    console.error("Error updating quote:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
