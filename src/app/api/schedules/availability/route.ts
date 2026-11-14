import { NextRequest, NextResponse } from "next/server";
import { dateKeySchema } from "@/lib/scheduling";
import { z } from "zod";
import { getAvailableSlots } from "@/lib/availability";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");

    if (!dateKeySchema.safeParse(date).success) {
      return NextResponse.json(
        { error: "Parámetro 'date' requerido (formato YYYY-MM-DD)" },
        { status: 400 }
      );
    }

    const serviceId = searchParams.get("serviceId") || undefined;
    if (serviceId && !z.string().uuid().safeParse(serviceId).success) return NextResponse.json({ error: "Servicio inválido" }, { status: 400 });
    const result = await getAvailableSlots(date!, serviceId);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof Error && error.message === "Servicio no válido o inactivo") return NextResponse.json({ error: error.message }, { status: 400 });
    console.error("Error fetching availability:", error);
    return NextResponse.json(
      { error: "Error al obtener disponibilidad" },
      { status: 500 }
    );
  }
}
