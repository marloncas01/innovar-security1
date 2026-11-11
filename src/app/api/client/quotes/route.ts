import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import { getClientQuotes } from "@/lib/quote-logic";
import { getClientIdFromUser } from "@/lib/appointments";

export async function GET() {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const clientId = await getClientIdFromUser(session.user.id);
    if (!clientId) {
      return NextResponse.json({ error: "Perfil no encontrado" }, { status: 404 });
    }

    const quotes = await getClientQuotes(clientId);
    return NextResponse.json(quotes);
  } catch (error) {
    console.error("Error fetching client quotes:", error);
    return NextResponse.json({ error: "Error al obtener cotizaciones" }, { status: 500 });
  }
}
