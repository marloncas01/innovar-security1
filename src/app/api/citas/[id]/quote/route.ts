import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import { getClientIdFromUser } from "@/lib/appointments";
import prisma from "@/lib/prisma";

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

    const appointment = await prisma.appointment.findUnique({
      where: { id: params.id },
      include: { client: true },
    });

    if (!appointment) {
      return NextResponse.json({ error: "Cita no encontrada" }, { status: 404 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (user?.role !== "ADMIN" && appointment.client.userId !== session.user.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const quote = await prisma.quote.findFirst({
      where: { appointmentId: params.id },
      orderBy: { createdAt: "desc" },
    });

    if (!quote) {
      return NextResponse.json({ error: "Cotización no encontrada" }, { status: 404 });
    }

    let items = [];
    try {
      items = typeof quote.items === "string" ? JSON.parse(quote.items) : quote.items;
    } catch {
      items = [];
    }

    return NextResponse.json({
      ...quote,
      items,
    });
  } catch (error) {
    console.error("Error fetching appointment quote:", error);
    return NextResponse.json({ error: "Error al obtener cotización" }, { status: 500 });
  }
}
