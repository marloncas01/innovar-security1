import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import { updateAppointmentStatus } from "@/lib/appointments";
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

    const appointment = await prisma.appointment.findUnique({
      where: { id: params.id },
      include: {
        service: true,
        client: true,
        historyItems: { orderBy: { performedAt: "desc" } },
        reprogramRequests: { orderBy: { createdAt: "desc" } },
        photos: { orderBy: { order: "asc" } },
        payment: true,
        quotes: { orderBy: { createdAt: "desc" } },
      },
    });

    if (!appointment) {
      return NextResponse.json({ error: "Cita no encontrada" }, { status: 404 });
    }

    return NextResponse.json(appointment);
  } catch (error) {
    console.error("Error fetching admin appointment:", error);
    return NextResponse.json(
      { error: "Error al obtener la cita" },
      { status: 500 }
    );
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
    const { status, adminNotes } = body;

    if (!status) {
      return NextResponse.json(
        { error: "Campo 'status' requerido" },
        { status: 400 }
      );
    }

    const result = await updateAppointmentStatus(
      params.id,
      status,
      session.user.id,
      adminNotes
    );

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error updating appointment:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
