import { test } from "node:test";
import assert from "node:assert/strict";
import {
  buildSlots,
  businessNow,
  dateKeySchema,
  schedulesSchema,
  type ScheduleRow,
} from "../src/lib/scheduling";
import { appointmentRequestSchema } from "../src/lib/validators";
import { isSlotAvailableAtomic } from "../src/lib/availability";
import type { Prisma } from "@prisma/client";

const row: ScheduleRow = {
  dayOfWeek: 1,
  startTime: "08:00",
  endTime: "12:00",
  blockDuration: 60,
  active: true,
};
const now = new Date("2026-11-12T12:00:00Z");

test("una instalación de dos horas cabe completa y no se cruza con otra cita", () => {
  const slots = buildSlots(
    "2026-11-16",
    [row],
    [{ startTime: "09:30", endTime: "10:30" }],
    [],
    120,
    now,
  );
  assert.deepEqual(
    slots.map((slot) => [slot.time, slot.endTime, slot.available]),
    [
      ["08:00", "10:00", false],
      ["09:00", "11:00", false],
      ["10:00", "12:00", false],
    ],
  );
  const clear = buildSlots(
    "2026-11-16",
    [row],
    [{ startTime: "08:00", endTime: "10:00" }],
    [],
    120,
    now,
  );
  assert.equal(clear.find((slot) => slot.time === "10:00")?.available, true);
});

test("una excepción parcial bloquea cualquier cruce, incluso si comienza dentro de la cita", () => {
  const slots = buildSlots(
    "2026-11-16",
    [row],
    [],
    [{ startTime: "09:30", endTime: "09:45" }],
    60,
    now,
  );
  assert.equal(slots.find((slot) => slot.time === "09:00")?.available, false);
  assert.equal(slots.find((slot) => slot.time === "10:00")?.available, true);
});

test("no publica fechas pasadas ni horas que ya pasaron en Colombia", () => {
  const instant = new Date("2026-11-13T02:00:00Z");
  assert.deepEqual(businessNow(instant), { date: "2026-11-12", time: "21:00" });
  assert.ok(
    buildSlots("2026-11-12", [row], [], [], 60, instant).every(
      (slot) => !slot.available,
    ),
  );
});

test("rechaza fechas imposibles y franjas superpuestas o invertidas", () => {
  assert.equal(dateKeySchema.safeParse("2026-02-30").success, false);
  assert.equal(dateKeySchema.safeParse("2028-02-29").success, true);
  assert.equal(
    schedulesSchema.safeParse([row, { ...row, startTime: "09:00" }]).success,
    false,
  );
  assert.equal(
    schedulesSchema.safeParse([{ ...row, endTime: "07:00" }]).success,
    false,
  );
  assert.equal(
    schedulesSchema.safeParse([{ ...row, startTime: "25:00" }]).success,
    false,
  );
  assert.equal(
    schedulesSchema.safeParse([
      row,
      { ...row, startTime: "12:00", endTime: "16:00" },
    ]).success,
    true,
  );
});

test("la comprobación dentro de la transacción rechaza horas fuera de agenda y permite excluir la cita reprogramada", async () => {
  let query: unknown;
  const tx = {
    schedule: { findMany: async () => [row] },
    scheduleException: { findMany: async () => [] },
    appointment: {
      findMany: async (input: unknown) => {
        query = input;
        return [];
      },
    },
  } as unknown as Prisma.TransactionClient;
  assert.equal(
    await isSlotAvailableAtomic("2099-11-16", "07:00", tx, "08:00"),
    false,
  );
  assert.equal(
    await isSlotAvailableAtomic("2099-11-16", "11:00", tx, "13:00"),
    false,
  );
  assert.equal(
    await isSlotAvailableAtomic(
      "2099-11-16",
      "09:00",
      tx,
      "11:00",
      "own-appointment",
    ),
    true,
  );
  assert.deepEqual((query as { where: { id: unknown } }).where.id, {
    not: "own-appointment",
  });
});

test("la solicitud de cita exige fecha real, horas válidas y una ubicación completa", () => {
  const valid = {
    serviceId: "00000000-0000-4000-8000-000000000000",
    scheduledDate: "2099-11-16",
    startTime: "08:00",
    endTime: "10:00",
    locationAddress: "Calle de prueba 123",
    locationMunicipality: "Fómeque",
  };
  assert.equal(appointmentRequestSchema.safeParse(valid).success, true);
  for (const invalid of [
    { ...valid, startTime: "24:00" },
    { ...valid, endTime: "07:00" },
    { ...valid, locationAddress: " " },
    { ...valid, scheduledDate: "2099-02-30" },
  ])
    assert.equal(appointmentRequestSchema.safeParse(invalid).success, false);
});
