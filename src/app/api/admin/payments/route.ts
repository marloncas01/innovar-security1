import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const session = await getServerSession(authConfig);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const status = searchParams.get("status");

  const where: any = {};
  if (status) where.status = status;

  const [payments, total] = await Promise.all([
    prisma.payment.findMany({
      where,
      include: {
        appointment: {
          include: {
            client: { select: { name: true, phone: true } },
            service: { select: { name: true } },
          },
        },
      },
      orderBy: { paidAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.payment.count({ where }),
  ]);

  return NextResponse.json({
    payments,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
}
