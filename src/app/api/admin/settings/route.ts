import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authConfig);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const settings = await prisma.setting.findMany({
      where: { key: { not: "public_setup_v1" } },
      orderBy: { key: "asc" },
    });

    const grouped: Record<string, typeof settings> = {};
    for (const setting of settings) {
      const group = setting.group || "general";
      if (!grouped[group]) {
        grouped[group] = [];
      }
      grouped[group].push(setting);
    }

    return NextResponse.json(grouped);
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const settings = body?.settings;

    if (!Array.isArray(settings) || settings.length > 50 || settings.some((item) => !item || typeof item.key !== "string" || typeof item.value !== "string" || item.key === "public_setup_v1" || item.value.length > 5000)) {
      return NextResponse.json(
        { error: "Settings array is required" },
        { status: 400 }
      );
    }

    const updates = await prisma.$transaction(
      settings.map(
        (s: { key: string; value: string }) =>
          prisma.setting.update({
            where: { key: s.key },
            data: { value: s.value },
          })
      )
    );

    return NextResponse.json(updates);
  } catch (error: any) {
    if (error instanceof SyntaxError) return NextResponse.json({ error: "Solicitud inválida" }, { status: 400 });
    console.error("Error updating settings:", error);
    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Setting not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
