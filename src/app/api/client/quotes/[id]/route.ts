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

    const clientId = await getClientIdFromUser(session.user.id);
    if (!clientId) {
      return NextResponse.json({ error: "Perfil no encontrado" }, { status: 404 });
    }

    const quote = await prisma.quote.findUnique({
      where: { id: params.id },
      include: {
        appointment: {
          select: {
            scheduledDate: true,
            startTime: true,
            locationAddress: true,
            service: { select: { name: true } },
          },
        },
      },
    });

    if (!quote) {
      return NextResponse.json({ error: "Cotización no encontrada" }, { status: 404 });
    }

    if (quote.clientId !== clientId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    return NextResponse.json(quote);
  } catch (error) {
    console.error("Error fetching client quote:", error);
    return NextResponse.json({ error: "Error al obtener cotización" }, { status: 500 });
  }
}
