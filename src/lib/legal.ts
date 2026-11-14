import { z } from "zod";
export const LEGAL_VERSION = "2026-11-14";
export const legalFields = [
  {
    key: "legal_name",
    label: "Nombre completo o razón social del responsable",
  },
  { key: "legal_tax_id", label: "NIT / identificación del prestador" },
  { key: "legal_address", label: "Dirección física para notificaciones" },
  { key: "legal_email", label: "Correo de atención y protección de datos" },
] as const;

export const legalAcceptanceSchema = z.object({
  acceptedTerms: z.literal(true),
  acceptedPrivacy: z.literal(true),
  isAdult: z.literal(true),
});
