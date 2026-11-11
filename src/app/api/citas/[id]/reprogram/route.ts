import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import { requestReprogram, getClientIdFromUser } from "@/lib/appointments";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const { newDate, newTime, reason } = body;

    if (!newDate || !newTime || !reason) {
      return NextResponse.json(
        { error: "Campos requeridos: newDate, newTime, reason" },
        { status: 400 }
      );
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(newDate)) {
      return NextResponse.json(
        { error: "Formato de fecha inválido (YYYY-MM-DD)" },
        { status: 400 }
      );
    }

    const reprogram = await requestReprogram(
      params.id,
      clientId,
      newDate,
      newTime,
      reason
    );

    return NextResponse.json(reprogram, { status: 201 });
  } catch (error: any) {
    console.error("Error requesting reprogram:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
