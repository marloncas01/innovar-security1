import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const faqs = await prisma.fAQ.findMany({
      where: { active: true },
      orderBy: [{ sortOrder: "asc" }, { question: "asc" }],
      select: { id: true, question: true, answer: true, category: true },
    });
    return NextResponse.json(faqs);
  } catch {
    return NextResponse.json({ error: "Error al obtener FAQs" }, { status: 500 });
  }
}
