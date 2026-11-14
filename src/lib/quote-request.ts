import { z } from "zod";

export const quoteServices = [
  "Instalación nueva",
  "Mantenimiento o reparación",
  "Visita técnica y asesoría",
] as const;
export const quoteSpaces = [
  "Hogar",
  "Negocio",
  "Finca",
  "Otro espacio",
] as const;
export const quoteAreas = [
  "Entradas y accesos",
  "Interiores",
  "Exteriores",
  "Necesito orientación",
] as const;
export const quoteQuantities = [
  "Por definir",
  "1 a 2",
  "3 a 4",
  "5 o más",
] as const;
export const quoteRequestSchema = z.object({
  space: z.enum(quoteSpaces),
  service: z.enum(quoteServices),
  areas: z
    .array(z.enum(quoteAreas))
    .min(1, "Selecciona al menos una zona o pide orientación")
    .max(4),
  quantity: z.enum(quoteQuantities),
  municipality: z.string().trim().min(2, "Escribe tu municipio").max(100),
  notes: z.string().trim().max(800),
});
export type QuoteRequest = z.infer<typeof quoteRequestSchema>;

export function initialQuoteService(
  slug: string | undefined,
): QuoteRequest["service"] {
  return slug === "instalacion"
    ? quoteServices[0]
    : slug === "mantenimiento"
      ? quoteServices[1]
      : quoteServices[2];
}
export function quoteRequestText(request: QuoteRequest): string {
  const data = quoteRequestSchema.parse(request);
  return [
    "SOLICITUD DE COTIZACIÓN · INNOVAR SECURITY",
    "",
    `Espacio: ${data.space}`,
    `Necesidad: ${data.service}`,
    `Zonas a evaluar: ${data.areas.join(", ")}`,
    `Cantidad orientativa de cámaras: ${data.quantity}`,
    `Municipio: ${data.municipality}`,
    ...(data.notes ? [`Detalles: ${data.notes}`] : []),
    "",
    "Quiero conocer disponibilidad, alcance, equipos, valor total con impuestos y desplazamiento, garantía y condiciones del servicio.",
    "",
    "Este resumen es una solicitud inicial. No es una cotización definitiva, una compra ni una cita confirmada.",
  ].join("\n");
}
