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

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    const appointment = await prisma.appointment.findUnique({
      where: { id: params.id },
      include: {
        service: true,
        client: { select: { id: true, name: true, phone: true, email: true, userId: true } },
        historyItems: { orderBy: { performedAt: "desc" } },
        reprogramRequests: { orderBy: { createdAt: "desc" } },
        payment: true,
        quotes: { orderBy: { createdAt: "desc" } },
        photos: { orderBy: { order: "asc" } },
      },
    });

    if (!appointment) {
      return NextResponse.json({ error: "Cita no encontrada" }, { status: 404 });
    }

    if (user?.role !== "ADMIN" && appointment.client.userId !== session.user.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    return NextResponse.json(appointment);
  } catch (error) {
    console.error("Error fetching appointment:", error);
    return NextResponse.json(
      { error: "Error al obtener la cita" },
      { status: 500 }
    );
  }
}
