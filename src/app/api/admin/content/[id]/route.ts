import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authConfig);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const content = await prisma.content.findUnique({
      where: { id: params.id },
    });

    if (!content) {
      return NextResponse.json({ error: "Content not found" }, { status: 404 });
    }

    return NextResponse.json(content);
  } catch (error) {
    console.error("Error fetching content:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const content = await prisma.content.update({
      where: { id: params.id },
      data: {
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

    return NextResponse.json(content);
  } catch (error: any) {
    console.error("Error updating content:", error);
    if (error.code === "P2025") {
      return NextResponse.json({ error: "Content not found" }, { status: 404 });
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authConfig);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.content.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Content deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting content:", error);
    if (error.code === "P2025") {
      return NextResponse.json({ error: "Content not found" }, { status: 404 });
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
