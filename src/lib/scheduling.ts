import { z } from "zod";

export const clockSchema = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Escribe una hora válida");
export const dateKeySchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida")
  .refine((value) => {
    const parsed = new Date(`${value}T12:00:00Z`);
    return (
      !Number.isNaN(parsed.getTime()) &&
      parsed.toISOString().slice(0, 10) === value
    );
  }, "La fecha no existe");
export const scheduleRowSchema = z
  .object({
    dayOfWeek: z.number().int().min(0).max(6),
    startTime: clockSchema,
    endTime: clockSchema,
    blockDuration: z.number().int().min(15).max(240),
    active: z.boolean(),
  })
  .refine((row) => row.endTime > row.startTime, {
    message: "La hora final debe ser posterior a la inicial",
  });
export const schedulesSchema = z
  .array(scheduleRowSchema)
  .max(28)
  .superRefine((rows, context) => {
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (minutes(row.endTime) - minutes(row.startTime) < row.blockDuration)
        context.addIssue({
          code: "custom",
          message: "El intervalo entre citas no cabe en la franja",
        });
      for (let j = 0; j < i; j++) {
        if (
          row.active &&
          rows[j].active &&
          row.dayOfWeek === rows[j].dayOfWeek &&
          overlaps(row, rows[j])
        )
          context.addIssue({
            code: "custom",
            message: "Hay franjas activas que se cruzan en el mismo día",
          });
      }
    }
  });
export type ScheduleRow = z.infer<typeof scheduleRowSchema>;
export type Interval = { startTime: string; endTime: string };
export type Slot = { time: string; endTime: string; available: boolean };
export function minutes(time: string): number {
  const [hour, minute] = time.split(":").map(Number);
  return hour * 60 + minute;
}
export function clock(value: number): string {
  return `${String(Math.floor(value / 60)).padStart(2, "0")}:${String(value % 60).padStart(2, "0")}`;
}
export function overlaps(a: Interval, b: Interval): boolean {
  return a.startTime < b.endTime && a.endTime > b.startTime;
}
export function businessNow(now = new Date()): { date: string; time: string } {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Bogota",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const value = (key: string) =>
    parts.find((part) => part.type === key)?.value || "";
  return {
    date: `${value("year")}-${value("month")}-${value("day")}`,
    time: `${value("hour")}:${value("minute")}`,
  };
}
export function buildSlots(
  date: string,
  schedules: ScheduleRow[],
  occupied: Interval[],
  exceptions: Interval[],
  duration?: number,
  now = new Date(),
): Slot[] {
  const current = businessNow(now);
  const slots = new Map<string, Slot>();
  for (const row of schedules.filter((item) => item.active)) {
    const length = duration ?? row.blockDuration;
    if (length <= 0 || row.blockDuration <= 0) continue;
    for (
      let start = minutes(row.startTime);
      start + length <= minutes(row.endTime);
      start += row.blockDuration
    ) {
      const interval = {
        startTime: clock(start),
        endTime: clock(start + length),
      };
      const future =
        date > current.date ||
        (date === current.date && interval.startTime > current.time);
      slots.set(interval.startTime, {
        time: interval.startTime,
        endTime: interval.endTime,
        available:
          future &&
          ![...occupied, ...exceptions].some((item) =>
            overlaps(interval, item),
          ),
      });
    }
  }
  return Array.from(slots.values()).sort((a, b) =>
    a.time.localeCompare(b.time),
  );
}
