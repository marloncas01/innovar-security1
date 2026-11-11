import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import { getAdminNotifications, markAsRead } from "@/lib/notification-logic";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const unreadOnly = searchParams.get("unreadOnly") === "true";

    const result = await getAdminNotifications(session.user.id, { page, limit, unreadOnly });
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching admin notifications:", error);
    return NextResponse.json({ error: "Error al obtener notificaciones" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const body = await request.json();
    if (!body.notificationId) {
      return NextResponse.json({ error: "notificationId requerido" }, { status: 400 });
    }

    const result = await markAsRead(body.notificationId, session.user.id);
    return NextResponse.json(result);
  } catch (error: any) {
    if (error.message === "No autorizado") {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error("Error marking admin notification:", error);
    return NextResponse.json({ error: "Error al actualizar notificación" }, { status: 500 });
  }
}
