import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import { respondReprogram } from "@/lib/appointments";
import prisma from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const body = await request.json();
    const { approve, adminNotes } = body;

    if (typeof approve !== "boolean") {
      return NextResponse.json(
        { error: "Campo 'approve' requerido (boolean)" },
        { status: 400 }
      );
    }

    const reprogramRequest = await prisma.reprogramRequest.findFirst({
      where: { appointmentId: params.id, status: "PENDING" },
    });

    if (!reprogramRequest) {
      return NextResponse.json(
        { error: "No hay solicitud de reprogramación pendiente para esta cita" },
        { status: 404 }
      );
    }

    const result = await respondReprogram(
      reprogramRequest.id,
      approve,
      session.user.id,
      adminNotes
    );

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error responding to reprogram:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
