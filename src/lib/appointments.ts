import prisma from "@/lib/prisma";
import { isSlotAvailableAtomic } from "@/lib/availability";
import { HISTORY_ACTIONS } from "@/lib/constants";
import { createNotification } from "@/lib/notification-logic";

export interface CreateAppointmentInput {
  clientId: string;
  serviceId: string;
  createdById?: string;
  scheduledDate: string;
  startTime: string;
  endTime: string;
  locationMunicipality?: string;
  locationAddress: string;
  locationReference?: string;
  locationNotes?: string;
  conditionNotes?: string;
  hasHeightWork?: boolean;
  hasElectricRisk?: boolean;
  hasComplicatedAccess?: boolean;
  hasSpecialConditions?: boolean;
  specialConditionsDescription?: string;
}

async function createHistory(
  tx: any,
  appointmentId: string,
  action: string,
  details: string | null,
  performedBy: string
) {
  return tx.appointmentHistory.create({
    data: { appointmentId, action, details, performedBy },
  });
}

async function getSettingValue(key: string): Promise<string | null> {
  const setting = await prisma.setting.findUnique({ where: { key } });
  return setting?.value ?? null;
}

export async function createAppointment(input: CreateAppointmentInput) {
  const service = await prisma.service.findUnique({
    where: { id: input.serviceId },
  });
  if (!service || !service.active) {
    throw new Error("Servicio no válido o inactivo");
  }

  const dateStart = new Date(input.scheduledDate + "T00:00:00Z");
  const dateEnd = new Date(input.scheduledDate + "T23:59:59Z");

  const result = await prisma.$transaction(async (tx) => {
    const slotAvailable = await isSlotAvailableAtomic(
      input.scheduledDate,
      input.startTime,
      tx
    );
    if (!slotAvailable) {
      throw new Error("El horario seleccionado ya no está disponible");
    }

    const appointment = await tx.appointment.create({
      data: {
        clientId: input.clientId,
        serviceId: input.serviceId,
        createdById: input.createdById || null,
        scheduledDate: dateStart,
        startTime: input.startTime,
        endTime: input.endTime,
        status: "PENDING",
        locationMunicipality: input.locationMunicipality || null,
        locationAddress: input.locationAddress,
        locationReference: input.locationReference || null,
        locationNotes: input.locationNotes || null,
        conditionNotes: input.conditionNotes || null,
        hasHeightWork: input.hasHeightWork || false,
        hasElectricRisk: input.hasElectricRisk || false,
        hasComplicatedAccess: input.hasComplicatedAccess || false,
        hasSpecialConditions: input.hasSpecialConditions || false,
        specialConditionsDescription: input.specialConditionsDescription || null,
      },
    });

    await createHistory(
      tx,
      appointment.id,
      HISTORY_ACTIONS.CREATED,
      `Cita creada para ${input.scheduledDate} a las ${input.startTime}. Servicio: ${service.name}`,
      input.createdById || input.clientId
    );

    return appointment;
  });

  try {
    const dateStr = input.scheduledDate;
    const adminUser = await prisma.user.findFirst({ where: { role: "ADMIN" } });

    await createNotification({
      clientId: input.clientId,
      type: "APPOINTMENT_CREATED",
      title: "Cita creada",
      message: `Tu cita de ${service.name} fue creada para el ${dateStr} a las ${input.startTime}. Dirección: ${input.locationAddress}`,
      appointmentId: result.id,
    });

    if (adminUser) {
      const client = await prisma.client.findUnique({
        where: { id: input.clientId },
        select: { name: true },
      });
      await createNotification({
        userId: adminUser.id,
        type: "APPOINTMENT_CREATED",
        title: "Nueva cita creada",
        message: `${client?.name || "Cliente"} creó una cita de ${service.name} para el ${dateStr} a las ${input.startTime}`,
        appointmentId: result.id,
      });
    }
  } catch { /* notification failure is non-critical */ }

  return result;
}

export async function requestReprogram(
  appointmentId: string,
  clientId: string,
  newDate: string,
  newTime: string,
  reason: string
) {
  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
  });
  if (!appointment) throw new Error("Cita no encontrada");
  if (appointment.clientId !== clientId) throw new Error("No autorizado");
  if (appointment.status === "CANCELLED") throw new Error("La cita está cancelada");
  if (appointment.status === "COMPLETED") throw new Error("La cita ya fue completada");

  const hoursSetting = await getSettingValue("reprogramation_hours");
  const hoursRequired = hoursSetting ? parseInt(hoursSetting) : 24;

  const appointmentDateTime = new Date(
    appointment.scheduledDate.toISOString().split("T")[0] +
      "T" +
      appointment.startTime +
      ":00"
  );
  const now = new Date();
  const hoursUntil = (appointmentDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);
  if (hoursUntil < hoursRequired) {
    throw new Error(
      `No es posible reprogramar. Se requieren al menos ${hoursRequired} horas de anticipación.`
    );
  }

  const newDateStart = new Date(newDate + "T00:00:00Z");
  const newDateEnd = new Date(newDate + "T23:59:59Z");

  const existingReprogram = await prisma.reprogramRequest.findFirst({
    where: {
      appointmentId,
      status: "PENDING",
    },
  });
  if (existingReprogram) {
    throw new Error("Ya existe una solicitud de reprogramación pendiente");
  }

  const result = await prisma.$transaction(async (tx) => {
    const reprogramRequest = await tx.reprogramRequest.create({
      data: {
        appointmentId,
        newDate: newDateStart,
        newTime,
        reason,
        status: "PENDING",
      },
    });

    await tx.appointment.update({
      where: { id: appointmentId },
      data: { status: "REPROGRAM_REQUESTED" },
    });

    await createHistory(
      tx,
      appointmentId,
      HISTORY_ACTIONS.REPROGRAM_REQUESTED,
      `Solicitud de reprogramación: nueva fecha ${newDate} a las ${newTime}. Motivo: ${reason}`,
      clientId
    );

    return reprogramRequest;
  });

  try {
    const adminUser = await prisma.user.findFirst({ where: { role: "ADMIN" } });
    if (adminUser) {
      const client = await prisma.client.findUnique({
        where: { id: clientId },
        select: { name: true },
      });
      const service = await prisma.appointment.findUnique({
        where: { id: appointmentId },
        select: { service: { select: { name: true } } },
      });
      await createNotification({
        userId: adminUser.id,
        type: "APPOINTMENT_REPROGRAM_REQUESTED",
        title: "Reprogramación solicitada",
        message: `${client?.name || "Cliente"} solicitó reprogramar cita de ${service?.service?.name || ""} al ${newDate} a las ${newTime}. Motivo: ${reason}`,
        appointmentId,
      });
    }
  } catch { /* notification failure is non-critical */ }

  return result;
}

export async function cancelAppointment(appointmentId: string, userId: string) {
  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: { client: true },
  });
  if (!appointment) throw new Error("Cita no encontrada");

  const user = await prisma.user.findUnique({ where: { id: userId } });
  const isAdmin = user?.role === "ADMIN";
  const isOwner = appointment.clientId === appointment.client?.userId;

  if (!isAdmin && !isOwner) throw new Error("No autorizado");
  if (appointment.status === "CANCELLED") throw new Error("La cita ya está cancelada");
  if (appointment.status === "COMPLETED") throw new Error("La cita ya fue completada");

  const result = await prisma.$transaction(async (tx) => {
    await tx.appointment.update({
      where: { id: appointmentId },
      data: { status: "CANCELLED", cancelledAt: new Date() },
    });

    await createHistory(
      tx,
      appointmentId,
      HISTORY_ACTIONS.CANCELLED,
      "Cita cancelada",
      userId
    );

    return tx.appointment.findUnique({ where: { id: appointmentId } });
  });

  try {
    const adminUser = await prisma.user.findFirst({ where: { role: "ADMIN" } });
    const canceler = await prisma.user.findUnique({ where: { id: userId } });
    const isCancelerAdmin = canceler?.role === "ADMIN";

    if (isCancelerAdmin) {
      await createNotification({
        clientId: appointment.clientId,
        type: "APPOINTMENT_CANCELLED",
        title: "Cita cancelada",
        message: "Tu cita ha sido cancelada por el administrador.",
        appointmentId,
      });
    } else if (adminUser) {
      const client = await prisma.client.findUnique({
        where: { id: appointment.clientId },
        select: { name: true },
      });
      await createNotification({
        userId: adminUser.id,
        type: "APPOINTMENT_CANCELLED",
        title: "Cita cancelada",
        message: `${client?.name || "Cliente"} canceló su cita.`,
        appointmentId,
      });
    }
  } catch { /* notification failure is non-critical */ }

  return result;
}

export async function updateAppointmentStatus(
  appointmentId: string,
  newStatus: string,
  adminId: string,
  adminNotes?: string
) {
  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
  });
  if (!appointment) throw new Error("Cita no encontrada");

  const validStatuses = [
    "PENDING",
    "CONFIRMED",
    "REPROGRAMMED",
    "CANCELLED",
    "COMPLETED",
    "CLIENT_NO_SHOW",
  ];
  if (!validStatuses.includes(newStatus)) {
    throw new Error("Estado no válido");
  }

  const result = await prisma.$transaction(async (tx) => {
    const updateData: any = { status: newStatus };
    if (adminNotes) updateData.adminNotes = adminNotes;
    if (newStatus === "CONFIRMED") updateData.confirmedAt = new Date();
    if (newStatus === "COMPLETED") updateData.completedAt = new Date();
    if (newStatus === "CANCELLED") updateData.cancelledAt = new Date();

    await tx.appointment.update({ where: { id: appointmentId }, data: updateData });

    const previousStatus = appointment.status;
    await createHistory(
      tx,
      appointmentId,
      HISTORY_ACTIONS.STATUS_CHANGED,
      `Estado cambiado de ${previousStatus} a ${newStatus}${adminNotes ? `. Nota: ${adminNotes}` : ""}`,
      adminId
    );

    return tx.appointment.findUnique({ where: { id: appointmentId } });
  });

  try {
    const typeMap: Record<string, string> = {
      CONFIRMED: "APPOINTMENT_CONFIRMED",
      COMPLETED: "APPOINTMENT_COMPLETED",
      CANCELLED: "APPOINTMENT_CANCELLED",
      REPROGRAMMED: "APPOINTMENT_REPROGRAMMED",
    };
    const titleMap: Record<string, string> = {
      CONFIRMED: "Cita confirmada",
      COMPLETED: "Cita completada",
      CANCELLED: "Cita cancelada",
      REPROGRAMMED: "Cita reprogramada",
    };
    const notifType = typeMap[newStatus];
    if (notifType) {
      const appointment = await prisma.appointment.findUnique({
        where: { id: appointmentId },
        select: { clientId: true, service: { select: { name: true } } },
      });
      if (appointment) {
        await createNotification({
          clientId: appointment.clientId,
          type: notifType,
          title: titleMap[newStatus] || "Actualización de cita",
          message: `Tu cita de ${appointment.service.name} cambió a estado: ${newStatus}${adminNotes ? `. Nota: ${adminNotes}` : ""}`,
          appointmentId,
        });
      }
    }
  } catch { /* notification failure is non-critical */ }

  return result;
}

export async function respondReprogram(
  requestId: string,
  approve: boolean,
  adminId: string,
  adminNotes?: string
) {
  const reprogramRequest = await prisma.reprogramRequest.findUnique({
    where: { id: requestId },
    include: { appointment: true },
  });
  if (!reprogramRequest) throw new Error("Solicitud no encontrada");
  if (reprogramRequest.status !== "PENDING") throw new Error("La solicitud ya fue procesada");

  const appointment = reprogramRequest.appointment;

  if (approve) {
    if (!reprogramRequest.newDate || !reprogramRequest.newTime) {
      throw new Error("Datos de reprogramación incompletos");
    }

    const newDateStr = reprogramRequest.newDate.toISOString().split("T")[0];

    const result = await prisma.$transaction(async (tx) => {
      const slotAvailable = await isSlotAvailableAtomic(
        newDateStr,
        reprogramRequest.newTime!,
        tx
      );
      if (!slotAvailable) {
        throw new Error("El nuevo horario ya no está disponible");
      }

      await tx.reprogramRequest.update({
        where: { id: requestId },
        data: {
          status: "APPROVED",
          adminNotes: adminNotes || null,
          adminRespondedAt: new Date(),
        },
      });

      await tx.appointment.update({
        where: { id: appointment.id },
        data: {
          status: "REPROGRAMMED",
          scheduledDate: reprogramRequest.newDate!,
          startTime: reprogramRequest.newTime!,
          adminNotes: adminNotes || null,
        },
      });

      await createHistory(
        tx,
        appointment.id,
        HISTORY_ACTIONS.REPROGRAMMED,
        `Reprogramación aprobada. Nueva fecha: ${newDateStr} a las ${reprogramRequest.newTime}. ${adminNotes || ""}`,
        adminId
      );

      return tx.appointment.findUnique({ where: { id: appointment.id } });
    });

    try {
      const dateStr = reprogramRequest.newDate?.toISOString().split("T")[0] || "";
      await createNotification({
        clientId: appointment.clientId,
        type: "REPROGRAM_APPROVED",
        title: "Reprogramación aprobada",
        message: `Tu solicitud de reprogramación fue aprobada. Nueva fecha: ${dateStr} a las ${reprogramRequest.newTime}.`,
        appointmentId: appointment.id,
      });
    } catch { /* notification failure is non-critical */ }

    return result;
  } else {
    const result = await prisma.$transaction(async (tx) => {
      await tx.reprogramRequest.update({
        where: { id: requestId },
        data: {
          status: "REJECTED",
          adminNotes: adminNotes || null,
          adminRespondedAt: new Date(),
        },
      });

      await tx.appointment.update({
        where: { id: appointment.id },
        data: { status: "CONFIRMED" },
      });

      await createHistory(
        tx,
        appointment.id,
        HISTORY_ACTIONS.REPROGRAM_REJECTED,
        `Reprogramación rechazada. ${adminNotes || ""}`,
        adminId
      );

      return tx.appointment.findUnique({ where: { id: appointment.id } });
    });

    try {
      await createNotification({
        clientId: appointment.clientId,
        type: "REPROGRAM_REJECTED",
        title: "Reprogramación rechazada",
        message: `Tu solicitud de reprogramación fue rechazada.${adminNotes ? ` Motivo: ${adminNotes}` : ""}`,
        appointmentId: appointment.id,
      });
    } catch { /* notification failure is non-critical */ }

    return result;
  }
}

export async function getClientIdFromUser(userId: string): Promise<string | null> {
  const client = await prisma.client.findUnique({
    where: { userId },
    select: { id: true },
  });
  return client?.id ?? null;
}
