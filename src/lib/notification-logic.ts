import prisma from "@/lib/prisma";

interface CreateNotificationInput {
  userId?: string;
  clientId?: string;
  type: string;
  title: string;
  message: string;
  appointmentId?: string;
  quoteId?: string;
  metadata?: string;
}

export async function createNotification(input: CreateNotificationInput) {
  if (!input.userId && !input.clientId) {
    throw new Error("Se requiere userId o clientId");
  }

  if (input.userId) {
    return prisma.userNotification.create({
      data: {
        userId: input.userId,
        type: input.type,
        title: input.title,
        message: input.message,
        appointmentId: input.appointmentId || null,
        metadata: input.metadata || null,
        status: "SENT",
        sentAt: new Date(),
      },
    });
  }

  return prisma.clientNotification.create({
    data: {
      clientId: input.clientId!,
      type: input.type,
      title: input.title,
      message: input.message,
      appointmentId: input.appointmentId || null,
      quoteId: input.quoteId || null,
      metadata: input.metadata || null,
      status: "SENT",
      sentAt: new Date(),
    },
  });
}

export async function createNotifications(inputs: CreateNotificationInput[]) {
  const results = [];
  for (const input of inputs) {
    const result = await createNotification(input);
    results.push(result);
  }
  return results;
}

export async function markAsRead(notificationId: string, userId: string) {
  const notification = await prisma.userNotification.findUnique({
    where: { id: notificationId },
  });

  if (!notification) {
    const clientNotif = await prisma.clientNotification.findUnique({
      where: { id: notificationId },
    });
    if (!clientNotif) throw new Error("Notificación no encontrada");

    const client = await prisma.client.findUnique({
      where: { id: clientNotif.clientId },
      select: { userId: true },
    });
    if (!client || client.userId !== userId) throw new Error("No autorizado");

    if (clientNotif.readAt) return clientNotif;

    return prisma.clientNotification.update({
      where: { id: notificationId },
      data: { readAt: new Date() },
    });
  }

  if (notification.userId !== userId) throw new Error("No autorizado");
  if (notification.readAt) return notification;

  return prisma.userNotification.update({
    where: { id: notificationId },
    data: { readAt: new Date() },
  });
}

export async function markAllAsRead(userId: string) {
  const now = new Date();

  await prisma.userNotification.updateMany({
    where: { userId, readAt: null },
    data: { readAt: now },
  });

  const client = await prisma.client.findUnique({
    where: { userId },
    select: { id: true },
  });

  if (client) {
    await prisma.clientNotification.updateMany({
      where: { clientId: client.id, readAt: null },
      data: { readAt: now },
    });
  }
}

export async function getClientNotifications(
  clientId: string,
  options?: { page?: number; limit?: number; unreadOnly?: boolean }
) {
  const page = options?.page || 1;
  const limit = options?.limit || 20;
  const skip = (page - 1) * limit;

  const where: any = { clientId };
  if (options?.unreadOnly) {
    where.readAt = null;
  }

  const [notifications, total] = await Promise.all([
    prisma.clientNotification.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.clientNotification.count({ where }),
  ]);

  const unreadCount = await prisma.clientNotification.count({
    where: { clientId, readAt: null },
  });

  return {
    notifications,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    unreadCount,
  };
}

export async function getAdminNotifications(
  adminId: string,
  options?: { page?: number; limit?: number; unreadOnly?: boolean }
) {
  const page = options?.page || 1;
  const limit = options?.limit || 20;
  const skip = (page - 1) * limit;

  const where: any = { userId: adminId };
  if (options?.unreadOnly) {
    where.readAt = null;
  }

  const [notifications, total] = await Promise.all([
    prisma.userNotification.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.userNotification.count({ where }),
  ]);

  const unreadCount = await prisma.userNotification.count({
    where: { userId: adminId, readAt: null },
  });

  return {
    notifications,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    unreadCount,
  };
}

export async function getAdminUnreadCount(adminId: string): Promise<number> {
  return prisma.userNotification.count({
    where: { userId: adminId, readAt: null },
  });
}

export async function getClientUnreadCount(clientId: string): Promise<number> {
  return prisma.clientNotification.count({
    where: { clientId, readAt: null },
  });
}

export async function generateReminders() {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(23, 59, 59, 999);

  const dayAfterTomorrow = new Date(now);
  dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
  dayAfterTomorrow.setHours(0, 0, 0, 0);

  const appointments = await prisma.appointment.findMany({
    where: {
      scheduledDate: {
        gte: now,
        lte: tomorrow,
      },
      status: { in: ["CONFIRMED", "REPROGRAMMED"] },
    },
    include: {
      client: { include: { user: true } },
      service: true,
    },
  });

  let count = 0;
  const hoursSetting = await prisma.setting.findUnique({
    where: { key: "reminder_hours_before" },
  });
  const hoursBefore = hoursSetting ? parseInt(hoursSetting.value) : 24;

  for (const appointment of appointments) {
    const appointmentDateTime = new Date(
      appointment.scheduledDate.toISOString().split("T")[0] +
        "T" +
        appointment.startTime +
        ":00"
    );
    const hoursUntil =
      (appointmentDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursUntil > hoursBefore || hoursUntil < 0) continue;

    const existingReminder = await prisma.clientNotification.findFirst({
      where: {
        clientId: appointment.clientId,
        type: "APPOINTMENT_REMINDER",
        appointmentId: appointment.id,
        createdAt: {
          gte: new Date(now.getTime() - 12 * 60 * 60 * 1000),
        },
      },
    });

    if (existingReminder) continue;

    const dateStr = appointment.scheduledDate
      .toISOString()
      .split("T")[0];

    await createNotification({
      clientId: appointment.clientId,
      type: "APPOINTMENT_REMINDER",
      title: "Recordatorio de cita",
      message: `Tu cita de ${appointment.service.name} es mañana ${dateStr} a las ${appointment.startTime}. Dirección: ${appointment.locationAddress}`,
      appointmentId: appointment.id,
    });

    const adminUser = await prisma.user.findFirst({
      where: { role: "ADMIN" },
    });
    if (adminUser) {
      const existingAdminReminder = await prisma.userNotification.findFirst({
        where: {
          userId: adminUser.id,
          type: "APPOINTMENT_REMINDER",
          appointmentId: appointment.id,
          createdAt: {
            gte: new Date(now.getTime() - 12 * 60 * 60 * 1000),
          },
        },
      });

      if (!existingAdminReminder) {
        await createNotification({
          userId: adminUser.id,
          type: "APPOINTMENT_REMINDER",
          title: "Recordatorio de cita",
          message: `Cita de ${appointment.client.name} (${appointment.service.name}) mañana ${dateStr} a las ${appointment.startTime}`,
          appointmentId: appointment.id,
        });
      }
    }

    count++;
  }

  return count;
}
