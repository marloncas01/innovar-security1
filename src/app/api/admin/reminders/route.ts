import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import { generateReminders } from "@/lib/notification-logic";

export async function POST() {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const count = await generateReminders();
    return NextResponse.json({ success: true, count });
  } catch (error) {
    console.error("Error generating reminders:", error);
    return NextResponse.json({ error: "Error al generar recordatorios" }, { status: 500 });
  }
}
