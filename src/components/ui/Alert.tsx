import { cn } from "@/lib/utils";

interface AlertProps {
  variant?: "info" | "success" | "warning" | "error";
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export default function Alert({ variant = "info", title, children, className }: AlertProps) {
  return (
    <div
      className={cn(
        "rounded-lg p-4 border",
        {
          "bg-blue-900/30 border-blue-700 text-blue-200": variant === "info",
          "bg-green-900/30 border-green-700 text-green-200": variant === "success",
          "bg-yellow-900/30 border-yellow-700 text-yellow-200": variant === "warning",
          "bg-red-900/30 border-red-700 text-red-200": variant === "error",
        },
        className
      )}
    >
      {title && <h4 className="font-semibold mb-1">{title}</h4>}
      <div className="text-sm">{children}</div>
    </div>
  );
}
