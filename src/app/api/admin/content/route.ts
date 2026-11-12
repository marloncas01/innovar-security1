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

    const content = await prisma.content.findMany({
      orderBy: { section: "asc" },
    });

    return NextResponse.json(content);
  } catch (error) {
    console.error("Error fetching content:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      section,
      title,
      subtitle,
      description,
      imageUrl,
      buttonText,
      buttonUrl,
      seoTitle,
      seoDescription,
      active,
    } = body;

    if (!section) {
      return NextResponse.json(
        { error: "Section is required" },
        { status: 400 }
      );
    }

    const content = await prisma.content.upsert({
      where: { section },
      update: {
        title,
        subtitle,
        description,
        imageUrl,
        buttonText,
        buttonUrl,
        seoTitle,
        seoDescription,
        active,
      },
      create: {
        section,
        title,
        subtitle,
        description,
        imageUrl,
        buttonText,
        buttonUrl,
        seoTitle,
        seoDescription,
        active,
      },
    });

    return NextResponse.json(content, { status: 201 });
  } catch (error) {
    console.error("Error upserting content:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
