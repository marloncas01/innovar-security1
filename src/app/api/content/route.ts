import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const content = await prisma.content.findMany({
      where: { active: true },
      orderBy: { section: "asc" },
    });

    return NextResponse.json(content);
  } catch (error) {
    console.error("Error fetching public content:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
