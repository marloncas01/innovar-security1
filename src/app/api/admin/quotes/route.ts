import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import { createQuote, updateQuote } from "@/lib/quote-logic";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const body = await request.json();
    const { appointmentId, items, displacement, observations, validDays } = body;

    if (!appointmentId || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "appointmentId e items requeridos" },
        { status: 400 }
      );
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: { client: true },
    });
    if (!appointment) {
      return NextResponse.json({ error: "Cita no encontrada" }, { status: 404 });
    }

    const validatedItems = items.map((item: any) => ({
      description: item.description || "",
      quantity: item.quantity || 1,
      unitPrice: item.unitPrice || 0,
      total: (item.quantity || 1) * (item.unitPrice || 0),
    }));

    const quote = await createQuote({
      appointmentId,
      clientId: appointment.clientId,
      items: validatedItems,
      displacement,
      observations,
      validDays,
    });

    return NextResponse.json(quote, { status: 201 });
  } catch (error: any) {
    console.error("Error creating quote:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || undefined;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const { getAllQuotes } = await import("@/lib/quote-logic");
    const result = await getAllQuotes({ status, page, limit });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching quotes:", error);
    return NextResponse.json({ error: "Error al obtener cotizaciones" }, { status: 500 });
  }
}
