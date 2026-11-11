export const APP_NAME = process.env.APP_NAME || "Innovar Security";
export const APP_URL = process.env.NEXTAUTH_URL || "http://localhost:3000";
export const UPLOAD_MAX_SIZE = parseInt(process.env.UPLOAD_MAX_SIZE || "5242880");
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic"];
export const MAX_PHOTOS_PER_APPOINTMENT = parseInt(process.env.MAX_PHOTOS_PER_APPOINTMENT || "10");
export const DEFAULT_REPROGRAMATION_HOURS = parseInt(process.env.REPROGRAMATION_HOURS || "24");

// Status labels for display
export const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pendiente",
  PAYMENT_PENDING: "Pendiente de pago",
  PAYMENT_PROCESSING: "Pago en proceso",
  PAID: "Pagada",
  CONFIRMED: "Confirmada",
  REPROGRAM_REQUESTED: "Reprogramación solicitada",
  REPROGRAMMED: "Reprogramada",
  CANCELLED: "Cancelada",
  COMPLETED: "Realizada",
  CLIENT_NO_SHOW: "Cliente no disponible",
  NO_SHOW: "No asistió",
};

export const APPOINTMENT_STATUSES = {
  PENDING: "PENDING",
  CONFIRMED: "CONFIRMED",
  REPROGRAM_REQUESTED: "REPROGRAM_REQUESTED",
  REPROGRAMMED: "REPROGRAMMED",
  CANCELLED: "CANCELLED",
  COMPLETED: "COMPLETED",
  CLIENT_NO_SHOW: "CLIENT_NO_SHOW",
} as const;

export const HISTORY_ACTIONS = {
  CREATED: "CREATED",
  STATUS_CHANGED: "STATUS_CHANGED",
  REPROGRAM_REQUESTED: "REPROGRAM_REQUESTED",
  REPROGRAMMED: "REPROGRAMMED",
  REPROGRAM_REJECTED: "REPROGRAM_REJECTED",
  CANCELLED: "CANCELLED",
  NOTES_UPDATED: "NOTES_UPDATED",
} as const;

export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  PENDING: "Pendiente",
  PROCESSING: "En proceso",
  PAID: "Pagado",
  FAILED: "Fallido",
  CANCELLED: "Cancelado",
  REFUNDED: "Reembolsado",
};

export const PAYMENT_STATUSES = {
  PENDING: "PENDING",
  PROCESSING: "PROCESSING",
  PAID: "PAID",
  FAILED: "FAILED",
  CANCELLED: "CANCELLED",
  REFUNDED: "REFUNDED",
} as const;

export const QUOTE_STATUS_LABELS: Record<string, string> = {
  DRAFT: "Borrador",
  SENT: "Enviada",
  ACCEPTED: "Aceptada",
  REJECTED: "Rechazada",
  CANCELLED: "Cancelada",
};

export const QUOTE_STATUSES = {
  DRAFT: "DRAFT",
  SENT: "SENT",
  ACCEPTED: "ACCEPTED",
  REJECTED: "REJECTED",
  CANCELLED: "CANCELLED",
} as const;

export const REPROGRAM_STATUS_LABELS: Record<string, string> = {
  PENDING: "Pendiente",
  APPROVED: "Aprobada",
  REJECTED: "Rechazada",
};

export const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Administrador",
  CLIENT: "Cliente",
  TECHNICIAN: "Técnico",
};

export const NOTIFICATION_TYPES = {
  APPOINTMENT_CREATED: "APPOINTMENT_CREATED",
  PAYMENT_RECEIVED: "PAYMENT_RECEIVED",
  APPOINTMENT_CONFIRMED: "APPOINTMENT_CONFIRMED",
  APPOINTMENT_REPROGRAM_REQUESTED: "APPOINTMENT_REPROGRAM_REQUESTED",
  APPOINTMENT_REPROGRAMMED: "APPOINTMENT_REPROGRAMMED",
  APPOINTMENT_CANCELLED: "APPOINTMENT_CANCELLED",
  APPOINTMENT_COMPLETED: "APPOINTMENT_COMPLETED",
  APPOINTMENT_REMINDER: "APPOINTMENT_REMINDER",
  PAYMENT_FAILED: "PAYMENT_FAILED",
  QUOTE_SENT: "QUOTE_SENT",
  QUOTE_ACCEPTED: "QUOTE_ACCEPTED",
  QUOTE_REJECTED: "QUOTE_REJECTED",
  REPROGRAM_APPROVED: "REPROGRAM_APPROVED",
  REPROGRAM_REJECTED: "REPROGRAM_REJECTED",
} as const;

export const NOTIFICATION_TYPE_LABELS: Record<string, string> = {
  APPOINTMENT_CREATED: "Cita creada",
  PAYMENT_RECEIVED: "Pago recibido",
  APPOINTMENT_CONFIRMED: "Cita confirmada",
  APPOINTMENT_REPROGRAM_REQUESTED: "Reprogramación solicitada",
  APPOINTMENT_REPROGRAMMED: "Cita reprogramada",
  APPOINTMENT_CANCELLED: "Cita cancelada",
  APPOINTMENT_COMPLETED: "Cita completada",
  APPOINTMENT_REMINDER: "Recordatorio de cita",
  PAYMENT_FAILED: "Pago fallido",
  QUOTE_SENT: "Cotización enviada",
  QUOTE_ACCEPTED: "Cotización aceptada",
  QUOTE_REJECTED: "Cotización rechazada",
  REPROGRAM_APPROVED: "Reprogramación aprobada",
  REPROGRAM_REJECTED: "Reprogramación rechazada",
};
