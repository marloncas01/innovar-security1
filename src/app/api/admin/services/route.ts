import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get("includeInactive") === "true";

    const where = includeInactive ? {} : { active: true };

    const services = await prisma.service.findMany({
      where,
      orderBy: { sortOrder: "asc" },
      include: {
        _count: { select: { appointments: true } },
      },
    });

    return NextResponse.json({ services });
  } catch (error) {
    console.error("Error fetching admin services:", error);
    return NextResponse.json({ error: "Error al obtener servicios" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, price, duration, features, exclusions, requiresVisit, active, sortOrder } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json({ error: "El nombre es requerido" }, { status: 400 });
    }

    const slug = name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const existing = await prisma.service.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json({ error: "Ya existe un servicio con ese nombre" }, { status: 409 });
    }

    const service = await prisma.service.create({
      data: {
        name: name.trim(),
        slug,
        description: description?.trim() || null,
        price: price != null && price !== "" ? Number(price) : null,
        duration: duration != null && duration !== "" ? Number(duration) : null,
        features: JSON.stringify(features || []),
        exclusions: JSON.stringify(exclusions || []),
        requiresVisit: Boolean(requiresVisit),
        active: active !== false,
        sortOrder: Number(sortOrder) || 0,
      },
    });

    return NextResponse.json(service, { status: 201 });
  } catch (error) {
    console.error("Error creating service:", error);
    return NextResponse.json({ error: "Error al crear servicio" }, { status: 500 });
  }
}
