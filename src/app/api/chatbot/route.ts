import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const messages = await prisma.chatbotMessage.findMany({
      where: { active: true },
      orderBy: { sortOrder: "asc" },
    });
    return NextResponse.json(messages);
  } catch {
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}
