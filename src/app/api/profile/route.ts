import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        client: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
            identification: true,
            address: true,
            city: true,
            municipality: true,
            department: true,
            zipCode: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Profile GET error:", error);
    return NextResponse.json({ error: "Error al obtener perfil" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      phone,
      identification,
      address,
      city,
      municipality,
      department,
      zipCode,
    } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json({ error: "El nombre es requerido" }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: name.trim(),
        phone: phone?.trim() || null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
      },
    });

    const existingClient = await prisma.client.findUnique({
      where: { userId: session.user.id },
    });

    if (existingClient) {
      await prisma.client.update({
        where: { userId: session.user.id },
        data: {
          name: name.trim(),
          phone: phone?.trim() || existingClient.phone,
          identification: identification !== undefined ? (identification?.trim() || null) : existingClient.identification,
          address: address !== undefined ? (address?.trim() || null) : existingClient.address,
          city: city !== undefined ? (city?.trim() || null) : existingClient.city,
          municipality: municipality !== undefined ? (municipality?.trim() || null) : existingClient.municipality,
          department: department !== undefined ? (department?.trim() || null) : existingClient.department,
          zipCode: zipCode !== undefined ? (zipCode?.trim() || null) : existingClient.zipCode,
        },
      });
    }

    return NextResponse.json({ message: "Perfil actualizado exitosamente", user: updatedUser });
  } catch (error) {
    console.error("Profile PUT error:", error);
    return NextResponse.json({ error: "Error al actualizar perfil" }, { status: 500 });
  }
}
