import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import { markAllAsRead } from "@/lib/notification-logic";

export async function POST() {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    await markAllAsRead(session.user.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error marking all admin notifications as read:", error);
    return NextResponse.json({ error: "Error al actualizar notificaciones" }, { status: 500 });
  }
}
