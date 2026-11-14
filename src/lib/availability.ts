import type { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import {
  buildSlots,
  dateKeySchema,
  minutes,
  type Slot,
} from "@/lib/scheduling";

export type TimeSlot = Slot;
export interface AvailabilityResult {
  date: string;
  dayOfWeek: number;
  isWorkDay: boolean;
  isBlocked: boolean;
  blockDescription: string | null;
  slots: TimeSlot[];
}
type AvailabilityClient = Pick<
  Prisma.TransactionClient,
  "schedule" | "scheduleException" | "appointment"
>;
async function loadAvailability(
  client: AvailabilityClient,
  date: string,
  duration?: number,
  excludeAppointmentId?: string,
): Promise<AvailabilityResult> {
  dateKeySchema.parse(date);
  const dayOfWeek = new Date(`${date}T12:00:00Z`).getUTCDay();
  const range = {
    gte: new Date(`${date}T00:00:00Z`),
    lte: new Date(`${date}T23:59:59.999Z`),
  };
  const [schedules, exceptions, appointments] = await Promise.all([
    client.schedule.findMany({ where: { dayOfWeek, active: true } }),
    client.scheduleException.findMany({ where: { date: range } }),
    client.appointment.findMany({
      where: {
        scheduledDate: range,
        status: { not: "CANCELLED" },
        ...(excludeAppointmentId ? { id: { not: excludeAppointmentId } } : {}),
      },
      select: { startTime: true, endTime: true },
    }),
  ]);
  const fullDay = exceptions.find((item) => !item.startTime && !item.endTime);
  const partial = exceptions.flatMap((item) =>
    item.startTime && item.endTime
      ? [{ startTime: item.startTime, endTime: item.endTime }]
      : [],
  );
  return {
    date,
    dayOfWeek,
    isWorkDay: schedules.length > 0,
    isBlocked: !!fullDay,
    blockDescription: fullDay?.description || fullDay?.type || null,
    slots: fullDay
      ? []
      : buildSlots(
          date,
          schedules.map((row) => ({
            ...row,
            blockDuration: row.blockDuration ?? 60,
          })),
          appointments,
          partial,
          duration,
        ),
  };
}
export async function getAvailableSlots(
  date: string,
  serviceId?: string,
): Promise<AvailabilityResult> {
  let duration: number | undefined;
  if (serviceId) {
    const service = await prisma.service.findFirst({
      where: { id: serviceId, active: true },
      select: { duration: true },
    });
    if (!service) throw new Error("Servicio no válido o inactivo");
    duration = service.duration ?? 60;
  }
  return loadAvailability(prisma, date, duration);
}
export async function isSlotAvailable(
  date: string,
  time: string,
): Promise<boolean> {
  return (await getAvailableSlots(date)).slots.some(
    (slot) => slot.time === time && slot.available,
  );
}
export async function isSlotAvailableAtomic(
  date: string,
  time: string,
  tx: Prisma.TransactionClient,
  endTime?: string,
  excludeAppointmentId?: string,
): Promise<boolean> {
  const duration = endTime ? minutes(endTime) - minutes(time) : undefined;
  if (duration !== undefined && duration <= 0) return false;
  return (
    await loadAvailability(tx, date, duration, excludeAppointmentId)
  ).slots.some(
    (slot) =>
      slot.time === time &&
      slot.available &&
      (!endTime || slot.endTime === endTime),
  );
}
