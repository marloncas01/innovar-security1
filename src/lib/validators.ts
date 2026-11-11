import { z } from "zod";

export const signUpSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres").max(100),
  email: z.string().email("Email inválido"),
  phone: z.string().min(7, "Teléfono inválido").max(20),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres").max(100),
});

export const signInSchema = z.object({
  email: z.string().email("Email inválido"),
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
