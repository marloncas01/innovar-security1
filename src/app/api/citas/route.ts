import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import { createAppointment, getClientIdFromUser } from "@/lib/appointments";
import { appointmentRequestSchema } from "@/lib/validators";
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

    const parsed = appointmentRequestSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    const {
      serviceId, scheduledDate, startTime, endTime, locationAddress, locationMunicipality,
      locationReference, locationNotes, conditionNotes, hasHeightWork, hasElectricRisk,
      hasComplicatedAccess, hasSpecialConditions, specialConditionsDescription,
    } = parsed.data;

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
    if (error instanceof SyntaxError) return NextResponse.json({ error: "Solicitud inválida" }, { status: 400 });
    if (["Fecha u horario no válido", "La duración no corresponde al servicio seleccionado", "Servicio no válido o inactivo"].includes(error.message)) return NextResponse.json({ error: error.message }, { status: 400 });
    if (error.code === "P2034") return NextResponse.json({ error: "Ese horario acaba de cambiar. Actualiza la disponibilidad e inténtalo de nuevo." }, { status: 409 });
    if (error.message?.includes("ya no está disponible")) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    return NextResponse.json(
      { error: "No pudimos crear la cita. Inténtalo de nuevo." },
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
