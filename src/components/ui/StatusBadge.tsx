import { cn } from "@/lib/utils";

type AppointmentStatus =
  | "PENDING"
  | "CONFIRMED"
  | "REPROGRAM_REQUESTED"
  | "REPROGRAMMED"
  | "CANCELLED"
  | "COMPLETED"
  | "CLIENT_NO_SHOW"
  | "NO_SHOW"
  | "PAID"
  | "PAYMENT_PENDING"
  | "PROCESSING"
  | "FAILED"
  | "REFUNDED"
  | "DRAFT"
  | "SENT"
  | "ACCEPTED"
  | "REJECTED";

interface StatusBadgeProps {
  status: AppointmentStatus | string;
  className?: string;
}

const STATUS_CONFIG: Record<string, { label: string; dotClass: string; textClass: string; bgClass: string }> = {
  PENDING: {
    label: "Pendiente",
    dotClass: "bg-amber-400",
    textClass: "text-amber-300",
    bgClass: "bg-amber-900/40 border-amber-700/50",
  },
  CONFIRMED: {
    label: "Confirmada",
    dotClass: "bg-green-400",
    textClass: "text-green-300",
    bgClass: "bg-green-900/40 border-green-700/50",
  },
  REPROGRAM_REQUESTED: {
    label: "Reprogramación solicitada",
    dotClass: "bg-orange-400",
    textClass: "text-orange-300",
    bgClass: "bg-orange-900/40 border-orange-700/50",
  },
  REPROGRAMMED: {
    label: "Reprogramada",
    dotClass: "bg-blue-400",
    textClass: "text-blue-300",
    bgClass: "bg-blue-900/40 border-blue-700/50",
  },
  CANCELLED: {
    label: "Cancelada",
    dotClass: "bg-red-400",
    textClass: "text-red-300",
    bgClass: "bg-red-900/40 border-red-700/50",
  },
  COMPLETED: {
    label: "Completada",
    dotClass: "bg-emerald-400",
    textClass: "text-emerald-300",
    bgClass: "bg-emerald-900/40 border-emerald-700/50",
  },
  CLIENT_NO_SHOW: {
    label: "Cliente no disponible",
    dotClass: "bg-red-300",
    textClass: "text-red-300/80",
    bgClass: "bg-red-900/30 border-red-800/40",
  },
  NO_SHOW: {
    label: "No asistió",
    dotClass: "bg-red-300",
    textClass: "text-red-300/80",
    bgClass: "bg-red-900/30 border-red-800/40",
  },
  PAID: {
    label: "Pagada",
    dotClass: "bg-green-400",
    textClass: "text-green-300",
    bgClass: "bg-green-900/40 border-green-700/50",
  },
  PAYMENT_PENDING: {
    label: "Pendiente de pago",
    dotClass: "bg-amber-400",
    textClass: "text-amber-300",
    bgClass: "bg-amber-900/40 border-amber-700/50",
  },
  PROCESSING: {
    label: "En proceso",
    dotClass: "bg-blue-400",
    textClass: "text-blue-300",
    bgClass: "bg-blue-900/40 border-blue-700/50",
  },
  FAILED: {
    label: "Fallido",
    dotClass: "bg-red-400",
    textClass: "text-red-300",
    bgClass: "bg-red-900/40 border-red-700/50",
  },
  REFUNDED: {
    label: "Reembolsado",
    dotClass: "bg-purple-400",
    textClass: "text-purple-300",
    bgClass: "bg-purple-900/40 border-purple-700/50",
  },
  DRAFT: {
    label: "Borrador",
    dotClass: "bg-gray-400",
    textClass: "text-gray-400",
    bgClass: "bg-gray-800/40 border-gray-600/50",
  },
  SENT: {
    label: "Enviada",
    dotClass: "bg-blue-400",
    textClass: "text-blue-300",
    bgClass: "bg-blue-900/40 border-blue-700/50",
  },
  ACCEPTED: {
    label: "Aceptada",
    dotClass: "bg-green-400",
    textClass: "text-green-300",
    bgClass: "bg-green-900/40 border-green-700/50",
  },
  REJECTED: {
    label: "Rechazada",
    dotClass: "bg-red-400",
    textClass: "text-red-300",
    bgClass: "bg-red-900/40 border-red-700/50",
  },
  ACTIVE: {
    label: "Activo",
    dotClass: "bg-green-400",
    textClass: "text-green-300",
    bgClass: "bg-green-900/40 border-green-700/50",
  },
  INACTIVE: {
    label: "Inactivo",
    dotClass: "bg-gray-400",
    textClass: "text-gray-400",
    bgClass: "bg-gray-800/40 border-gray-600/50",
  },
};

const ACTIVE_STATUSES = new Set(["PENDING", "CONFIRMED"]);

const DEFAULT_CONFIG = {
  label: "Desconocido",
  dotClass: "bg-gray-400",
  textClass: "text-gray-400",
  bgClass: "bg-gray-800/40 border-gray-600/50",
};

export default function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? { ...DEFAULT_CONFIG, label: status };
  const isActive = ACTIVE_STATUSES.has(status);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border",
        config.bgClass,
        config.textClass,
        className
      )}
    >
      <span className="relative flex h-2 w-2">
        {isActive && (
          <span
            className={cn(
              "absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping",
              config.dotClass
            )}
          />
        )}
        <span
          className={cn(
            "relative inline-flex h-2 w-2 rounded-full",
            config.dotClass
          )}
        />
      </span>
      {config.label}
    </span>
  );
}

export type { AppointmentStatus, StatusBadgeProps };
