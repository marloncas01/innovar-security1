import { z } from "zod";
import { businessNow, clockSchema, dateKeySchema } from "@/lib/scheduling";

export const signUpSchema = z.object({
  name: z.string().trim().min(2, "El nombre debe tener al menos 2 caracteres").max(100),
  email: z.string().trim().toLowerCase().email("Email inválido").max(254),
  phone: z.string().trim().max(25).regex(/^\+?[\d ()-]+$/, "Teléfono inválido")
    .transform((value) => value.replace(/[ ()-]/g, ""))
    .refine((value) => /^\+?\d{7,15}$/.test(value), "El teléfono debe tener entre 7 y 15 dígitos"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres").max(72, "La contraseña es demasiado larga")
    .refine((value) => new TextEncoder().encode(value).length <= 72, "La contraseña es demasiado larga"),
});

export const signInSchema = z.object({
  email: z.string().trim().toLowerCase().email("Email inválido").max(254),
  password: z.string().min(1, "La contraseña es requerida"),
});

export const appointmentSchema = z.object({
  serviceId: z.string().uuid(),
  scheduledDate: z.string().datetime(),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, "Formato de hora inválido"),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, "Formato de hora inválido"),
  locationMunicipality: z.string().min(1, "El municipio es requerido"),
  locationAddress: z.string().min(1, "La dirección es requerida"),
  locationReference: z.string().optional(),
  conditionNotes: z.string().optional(),
  hasHeightWork: z.boolean().default(false),
  hasElectricRisk: z.boolean().default(false),
  hasComplicatedAccess: z.boolean().default(false),
  hasSpecialConditions: z.boolean().default(false),
  specialConditionsDescription: z.string().optional(),
});

export type AppointmentFormData = z.infer<typeof appointmentSchema>;


// The client submits a calendar date and a separate time, both in Colombia.
export const appointmentRequestSchema = z.object({
  serviceId: z.string().uuid("Selecciona un servicio válido"),
  scheduledDate: dateKeySchema.refine((date) => date >= businessNow().date, "Selecciona una fecha actual o futura"),
  startTime: clockSchema, endTime: clockSchema,
  locationAddress: z.string().trim().min(5, "Escribe una dirección completa").max(300),
  locationMunicipality: z.string().trim().min(2, "Escribe el municipio").max(100),
  locationReference: z.string().max(1000).optional(), locationNotes: z.string().max(1000).optional(),
  conditionNotes: z.string().max(2000).optional(),
  hasHeightWork: z.boolean().optional(), hasElectricRisk: z.boolean().optional(),
  hasComplicatedAccess: z.boolean().optional(), hasSpecialConditions: z.boolean().optional(),
  specialConditionsDescription: z.string().max(2000).optional(),
}).refine((input) => input.endTime > input.startTime, { message: "La hora final debe ser posterior a la inicial" });
