import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import { cancelAppointment } from "@/lib/appointments";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const result = await cancelAppointment(params.id, session.user.id);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error cancelling appointment:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
