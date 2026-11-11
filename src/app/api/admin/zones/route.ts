import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const zones = await prisma.zone.findMany({
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ zones });
  } catch (error) {
    console.error("Error fetching zones:", error);
    return NextResponse.json({ error: "Error al obtener zonas" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { name, municipality, department, baseDistance, ratePerKm, flatRate, notes, active } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json({ error: "El nombre es requerido" }, { status: 400 });
    }

    const zone = await prisma.zone.create({
      data: {
        name: name.trim(),
        municipality: municipality?.trim() || null,
        department: department?.trim() || null,
        baseDistance: baseDistance != null ? Number(baseDistance) : null,
        ratePerKm: ratePerKm != null ? Number(ratePerKm) : null,
        flatRate: flatRate != null ? Number(flatRate) : null,
        notes: notes?.trim() || null,
        active: active !== false,
      },
    });

    return NextResponse.json(zone, { status: 201 });
  } catch (error) {
    console.error("Error creating zone:", error);
    return NextResponse.json({ error: "Error al crear zona" }, { status: 500 });
  }
}
