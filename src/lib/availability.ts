import prisma from "@/lib/prisma";

export interface TimeSlot {
  time: string;
  endTime: string;
  available: boolean;
}

export interface AvailabilityResult {
  date: string;
  dayOfWeek: number;
  isWorkDay: boolean;
  isBlocked: boolean;
  blockDescription: string | null;
  slots: TimeSlot[];
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function getDayOfWeek(dateStr: string): number {
  const d = new Date(dateStr + "T12:00:00");
  return d.getDay();
}

export async function getAvailableSlots(dateStr: string): Promise<AvailabilityResult> {
  const dayOfWeek = getDayOfWeek(dateStr);

  const schedules = await prisma.schedule.findMany({
    where: { dayOfWeek, active: true },
  });

  if (schedules.length === 0) {
    return {
      date: dateStr,
      dayOfWeek,
      isWorkDay: false,
      isBlocked: false,
      blockDescription: null,
      slots: [],
    };
  }

  const dateStart = new Date(dateStr + "T00:00:00Z");
  const dateEnd = new Date(dateStr + "T23:59:59Z");

  const fullDayException = await prisma.scheduleException.findFirst({
    where: {
      date: { gte: dateStart, lte: dateEnd },
      startTime: null,
      endTime: null,
    },
  });

  if (fullDayException) {
    return {
      date: dateStr,
      dayOfWeek,
      isWorkDay: true,
      isBlocked: true,
      blockDescription: fullDayException.description || fullDayException.type,
      slots: [],
    };
  }

  const partialExceptions = await prisma.scheduleException.findMany({
    where: {
      date: { gte: dateStart, lte: dateEnd },
      startTime: { not: null },
      endTime: { not: null },
    },
  });

  const allSlots: TimeSlot[] = [];

  for (const schedule of schedules) {
    const blockDuration = schedule.blockDuration || 60;
    let start = timeToMinutes(schedule.startTime);
    const end = timeToMinutes(schedule.endTime);

    while (start + blockDuration <= end) {
      const slotStart = minutesToTime(start);
      const slotEnd = minutesToTime(start + blockDuration);
      allSlots.push({ time: slotStart, endTime: slotEnd, available: true });
      start += blockDuration;
    }
  }

  allSlots.sort((a, b) => a.time.localeCompare(b.time));

  const bookedAppointments = await prisma.appointment.findMany({
    where: {
      scheduledDate: { gte: dateStart, lte: dateEnd },
      status: { notIn: ["CANCELLED"] },
    },
    select: { startTime: true, endTime: true },
  });

  const bookedTimes = new Set(bookedAppointments.map((a) => a.startTime));

  for (const exception of partialExceptions) {
    if (exception.startTime && exception.endTime) {
      const exStart = timeToMinutes(exception.startTime);
      const exEnd = timeToMinutes(exception.endTime);
      for (const slot of allSlots) {
        const slotStartMin = timeToMinutes(slot.time);
        if (slotStartMin >= exStart && slotStartMin < exEnd) {
          slot.available = false;
        }
      }
    }
  }

  for (const slot of allSlots) {
    if (bookedTimes.has(slot.time)) {
      slot.available = false;
    }
  }

  return {
    date: dateStr,
    dayOfWeek,
    isWorkDay: true,
    isBlocked: false,
    blockDescription: null,
    slots: allSlots,
  };
}

export async function isSlotAvailable(dateStr: string, time: string): Promise<boolean> {
  const result = await getAvailableSlots(dateStr);
  if (!result.isWorkDay || result.isBlocked) return false;
  const slot = result.slots.find((s) => s.time === time);
  return slot ? slot.available : false;
}

/**
 * PostgreSQL production note:
 * For PostgreSQL, add a partial unique index to prevent double-booking at DB level:
 *
 * CREATE UNIQUE INDEX idx_unique_active_appointment
 *   ON appointments (scheduled_date, start_time)
 *   WHERE status NOT IN ('CANCELLED');
 *
 * SQLite does not support partial indexes. The application-level transaction
 * (atomic check + insert within $transaction) provides equivalent protection
 * because SQLite serializes write transactions at the database level.
 */
export async function isSlotAvailableAtomic(
  dateStr: string,
  time: string,
  tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0]
): Promise<boolean> {
  const dateStart = new Date(dateStr + "T00:00:00Z");
  const dateEnd = new Date(dateStr + "T23:59:59Z");

  const existing = await tx.appointment.findFirst({
    where: {
      scheduledDate: { gte: dateStart, lte: dateEnd },
      startTime: time,
      status: { notIn: ["CANCELLED"] },
    },
  });

  if (existing) return false;

  const dayOfWeek = getDayOfWeek(dateStr);
  const schedules = await tx.schedule.findMany({
    where: { dayOfWeek, active: true },
  });
  if (schedules.length === 0) return false;

  const fullDayException = await tx.scheduleException.findFirst({
    where: {
      date: { gte: dateStart, lte: dateEnd },
      startTime: null,
      endTime: null,
    },
  });
  if (fullDayException) return false;

  const timeMinutes = timeToMinutes(time);
  const partialException = await tx.scheduleException.findFirst({
    where: {
      date: { gte: dateStart, lte: dateEnd },
      AND: [
        { startTime: { not: null } },
        { startTime: { lte: time } },
      ],
      endTime: { gt: time },
    },
  });
  if (partialException) return false;

  return true;
}
