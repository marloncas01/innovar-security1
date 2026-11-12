import { NextResponse } from "next/server";
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

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const [
      totalClients,
      totalAppointments,
      pendingAppointments,
      confirmedAppointments,
      completedAppointments,
      totalServices,
      activeServices,
      pendingQuotes,
      pendingPayments,
      confirmedPayments,
      recentAppointments,
      upcomingAppointments,
    ] = await Promise.all([
      prisma.client.count(),
      prisma.appointment.count(),
      prisma.appointment.count({ where: { status: "PENDING" } }),
      prisma.appointment.count({ where: { status: "CONFIRMED" } }),
      prisma.appointment.count({ where: { status: "COMPLETED" } }),
      prisma.service.count(),
      prisma.service.count({ where: { active: true } }),
      prisma.quote.count({ where: { status: "DRAFT" } }),
      prisma.payment.count({ where: { status: "PENDING" } }),
      prisma.payment.findMany({
        where: { status: "CONFIRMED" },
        select: { amount: true },
      }),
      prisma.appointment.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          client: true,
          service: true,
        },
      }),
      prisma.appointment.findMany({
        where: {
          scheduledDate: { gte: today },
          status: { in: ["CONFIRMED", "PENDING"] },
        },
        take: 5,
        orderBy: { scheduledDate: "asc" },
        include: {
          client: true,
          service: true,
        },
      }),
    ]);

    const totalRevenue = confirmedPayments.reduce(
      (sum, payment) => sum + payment.amount,
      0
    );

    return NextResponse.json({
      totalClients,
      totalAppointments,
      pendingAppointments,
      confirmedAppointments,
      completedAppointments,
      totalServices,
      activeServices,
      pendingQuotes,
      pendingPayments,
      totalRevenue,
      recentAppointments,
      upcomingAppointments,
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
