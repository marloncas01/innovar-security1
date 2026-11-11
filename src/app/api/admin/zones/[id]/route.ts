import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { name, municipality, department, baseDistance, ratePerKm, flatRate, notes, active } = body;

    const existing = await prisma.zone.findUnique({ where: { id: params.id } });
    if (!existing) {
      return NextResponse.json({ error: "Zona no encontrada" }, { status: 404 });
    }

    const updateData: Record<string, any> = {};
    if (name !== undefined) updateData.name = name.trim();
    if (municipality !== undefined) updateData.municipality = municipality?.trim() || null;
    if (department !== undefined) updateData.department = department?.trim() || null;
    if (baseDistance !== undefined) updateData.baseDistance = baseDistance != null ? Number(baseDistance) : null;
    if (ratePerKm !== undefined) updateData.ratePerKm = ratePerKm != null ? Number(ratePerKm) : null;
    if (flatRate !== undefined) updateData.flatRate = flatRate != null ? Number(flatRate) : null;
    if (notes !== undefined) updateData.notes = notes?.trim() || null;
    if (active !== undefined) updateData.active = Boolean(active);

    const zone = await prisma.zone.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json(zone);
  } catch (error) {
    console.error("Error updating zone:", error);
    return NextResponse.json({ error: "Error al actualizar zona" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const existing = await prisma.zone.findUnique({ where: { id: params.id } });
    if (!existing) {
      return NextResponse.json({ error: "Zona no encontrada" }, { status: 404 });
    }

    await prisma.zone.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting zone:", error);
    return NextResponse.json({ error: "Error al eliminar zona" }, { status: 500 });
  }
}
