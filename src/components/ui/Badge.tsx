import { cn } from "@/lib/utils";

interface BadgeProps {
  variant?: "default" | "success" | "warning" | "danger" | "info" | "pending";
  children: React.ReactNode;
  className?: string;
}

export default function Badge({ variant = "default", children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        {
          "bg-metal-700 text-metal-200": variant === "default",
          "bg-green-900/50 text-green-300 border border-green-700": variant === "success",
          "bg-yellow-900/50 text-yellow-300 border border-yellow-700": variant === "warning",
          "bg-red-900/50 text-red-300 border border-red-700": variant === "danger",
          "bg-blue-900/50 text-blue-300 border border-blue-700": variant === "info",
          "bg-amber-900/50 text-amber-300 border border-amber-700": variant === "pending",
        },
        className
      )}
    >
      {children}
    </span>
  );
}
