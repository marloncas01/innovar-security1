import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const service = await prisma.service.findUnique({
      where: { id: params.id },
      include: {
        _count: { select: { appointments: true } },
      },
    });

    if (!service) {
      return NextResponse.json({ error: "Servicio no encontrado" }, { status: 404 });
    }

    return NextResponse.json(service);
  } catch (error) {
    console.error("Error fetching service:", error);
    return NextResponse.json({ error: "Error al obtener servicio" }, { status: 500 });
  }
}

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
    const { name, description, price, duration, features, exclusions, requiresVisit, active, sortOrder } = body;

    const existing = await prisma.service.findUnique({ where: { id: params.id } });
    if (!existing) {
      return NextResponse.json({ error: "Servicio no encontrado" }, { status: 404 });
    }

    const updateData: Record<string, any> = {};

    if (name !== undefined) {
      if (typeof name !== "string" || name.trim().length === 0) {
        return NextResponse.json({ error: "El nombre es requerido" }, { status: 400 });
      }
      updateData.name = name.trim();
      const slug = name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      if (slug !== existing.slug) {
        const slugExists = await prisma.service.findUnique({ where: { slug } });
        if (slugExists) {
          return NextResponse.json({ error: "Ya existe un servicio con ese nombre" }, { status: 409 });
        }
        updateData.slug = slug;
      }
    }

    if (description !== undefined) updateData.description = description?.trim() || null;
    if (price !== undefined) updateData.price = price != null && price !== "" ? Number(price) : null;
    if (duration !== undefined) updateData.duration = duration != null && duration !== "" ? Number(duration) : null;
    if (features !== undefined) updateData.features = JSON.stringify(features || []);
    if (exclusions !== undefined) updateData.exclusions = JSON.stringify(exclusions || []);
    if (requiresVisit !== undefined) updateData.requiresVisit = Boolean(requiresVisit);
    if (active !== undefined) updateData.active = Boolean(active);
    if (sortOrder !== undefined) updateData.sortOrder = Number(sortOrder) || 0;

    const service = await prisma.service.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json(service);
  } catch (error) {
    console.error("Error updating service:", error);
    return NextResponse.json({ error: "Error al actualizar servicio" }, { status: 500 });
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

    const existing = await prisma.service.findUnique({
      where: { id: params.id },
      include: { _count: { select: { appointments: true } } },
    });

    if (!existing) {
      return NextResponse.json({ error: "Servicio no encontrado" }, { status: 404 });
    }

    if (existing._count.appointments > 0) {
      return NextResponse.json(
        { error: "No se puede eliminar un servicio que tiene citas asociadas. Desactívalo en su lugar." },
        { status: 409 }
      );
    }

    await prisma.service.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting service:", error);
    return NextResponse.json({ error: "Error al eliminar servicio" }, { status: 500 });
  }
}
