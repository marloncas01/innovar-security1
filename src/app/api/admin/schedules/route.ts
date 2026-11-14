import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { schedulesSchema } from "@/lib/scheduling";

export const dynamic = "force-dynamic";
export async function GET() {
  const session = await getServerSession(authConfig);
  if (session?.user?.role !== "ADMIN")
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  try {
    const rows = await prisma.schedule.findMany({
      orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
    });
    return NextResponse.json({
      schedules: rows.map((row) => ({
        ...row,
        blockDuration: row.blockDuration ?? 60,
      })),
    });
  } catch {
    return NextResponse.json(
      { error: "No se pudieron cargar los horarios" },
      { status: 503 },
    );
  }
}
export async function PUT(request: Request) {
  const session = await getServerSession(authConfig);
  if (session?.user?.role !== "ADMIN")
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  try {
    const body = await request.json();
    const parsed = schedulesSchema.safeParse(body?.schedules);
    if (!parsed.success)
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 },
      );
    const schedules = await prisma.$transaction(async (tx) => {
      await tx.schedule.deleteMany();
      for (const row of parsed.data) await tx.schedule.create({ data: row });
      return tx.schedule.findMany({
        orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
      });
    });
    return NextResponse.json({ schedules });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof SyntaxError
            ? "Solicitud inválida"
            : "No se pudieron guardar los horarios. Inténtalo de nuevo.",
      },
      { status: error instanceof SyntaxError ? 400 : 503 },
    );
  }
}
