import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import { createAppointment, getClientIdFromUser } from "@/lib/appointments";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const clientId = await getClientIdFromUser(session.user.id);
    if (!clientId) {
      return NextResponse.json(
        { error: "Perfil de cliente no encontrado" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const {
      serviceId,
      scheduledDate,
      startTime,
      endTime,
      locationAddress,
      locationMunicipality,
      locationReference,
      locationNotes,
      conditionNotes,
      hasHeightWork,
      hasElectricRisk,
      hasComplicatedAccess,
      hasSpecialConditions,
      specialConditionsDescription,
    } = body;

    if (!serviceId || !scheduledDate || !startTime || !endTime || !locationAddress) {
      return NextResponse.json(
        { error: "Campos requeridos: serviceId, scheduledDate, startTime, endTime, locationAddress" },
        { status: 400 }
      );
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(scheduledDate)) {
      return NextResponse.json(
        { error: "Formato de fecha inválido (YYYY-MM-DD)" },
        { status: 400 }
      );
    }

    if (!/^\d{2}:\d{2}$/.test(startTime) || !/^\d{2}:\d{2}$/.test(endTime)) {
      return NextResponse.json(
        { error: "Formato de hora inválido (HH:mm)" },
        { status: 400 }
      );
    }

    const appointment = await createAppointment({
      clientId,
      serviceId,
      createdById: session.user.id,
      scheduledDate,
      startTime,
      endTime,
      locationAddress,
      locationMunicipality,
      locationReference,
      locationNotes,
      conditionNotes,
      hasHeightWork,
      hasElectricRisk,
      hasComplicatedAccess,
      hasSpecialConditions,
      specialConditionsDescription,
    });

    return NextResponse.json(appointment, { status: 201 });
  } catch (error: any) {
    console.error("Error creating appointment:", error);
    if (error.message?.includes("ya no está disponible")) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    return NextResponse.json(
      { error: error.message || "Error al crear la cita" },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const clientId = await getClientIdFromUser(session.user.id);
    if (!clientId) {
      return NextResponse.json(
        { error: "Perfil de cliente no encontrado" },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const where: any = { clientId };
    if (status) where.status = status;

    const appointments = await prisma.appointment.findMany({
      where,
      include: {
        service: { select: { name: true, slug: true } },
      },
      orderBy: { scheduledDate: "desc" },
    });

    return NextResponse.json(appointments);
  } catch (error) {
    console.error("Error fetching appointments:", error);
    return NextResponse.json(
      { error: "Error al obtener citas" },
      { status: 500 }
    );
  }
}
