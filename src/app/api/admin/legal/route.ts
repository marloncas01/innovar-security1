import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { legalFields } from "@/lib/legal";
import { getLegalIdentity } from "@/lib/legal-server";
export const dynamic = "force-dynamic";
export async function GET() {
  if ((await getServerSession(authConfig))?.user?.role !== "ADMIN")
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  return NextResponse.json(await getLegalIdentity());
}
export async function PUT(request: Request) {
  if ((await getServerSession(authConfig))?.user?.role !== "ADMIN")
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  try {
    const body = await request.json();
    if (
      !body ||
      typeof body !== "object" ||
      Array.isArray(body) ||
      Object.keys(body).some(
        (key) => !legalFields.some((field) => field.key === key),
      ) ||
      Object.values(body).some(
        (value) => typeof value !== "string" || value.length > 300,
      )
    )
      return NextResponse.json(
        {
          error:
            "Revisa los datos. Usa texto de hasta 300 caracteres por campo.",
        },
        { status: 400 },
      );
    if (
      body.legal_email &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.legal_email.trim())
    )
      return NextResponse.json(
        { error: "Escribe un correo válido" },
        { status: 400 },
      );
    await prisma.$transaction(
      Object.entries(body).map(([key, value]) =>
        prisma.setting.upsert({
          where: { key },
          update: { value: (value as string).trim() },
          create: {
            key,
            value: (value as string).trim(),
            group: "legal",
            description: legalFields.find((field) => field.key === key)?.label,
          },
        }),
      ),
    );
    return NextResponse.json({ saved: true });
  } catch {
    return NextResponse.json(
      { error: "No se pudieron guardar los datos" },
      { status: 503 },
    );
  }
}
