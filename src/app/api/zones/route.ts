import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const zones = await prisma.zone.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(zones);
  } catch (error) {
    console.error("Error fetching zones:", error);
    return NextResponse.json({ error: "Error al obtener zonas" }, { status: 500 });
  }
}
