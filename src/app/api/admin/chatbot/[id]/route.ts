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

    const message = await prisma.chatbotMessage.findUnique({
      where: { id: params.id },
    });

    if (!message) {
      return NextResponse.json(
        { error: "Chatbot message not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(message);
  } catch (error) {
    console.error("Error fetching chatbot message:", error);
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
    const { type, question, answer, options, actionUrl, sortOrder, active } =
      body;

    const message = await prisma.chatbotMessage.update({
      where: { id: params.id },
      data: {
        type,
        question,
        answer,
        options,
        actionUrl,
        sortOrder,
        active,
      },
    });

    return NextResponse.json(message);
  } catch (error: any) {
    console.error("Error updating chatbot message:", error);
    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Chatbot message not found" },
        { status: 404 }
      );
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

    await prisma.chatbotMessage.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      message: "Chatbot message deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting chatbot message:", error);
    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Chatbot message not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
