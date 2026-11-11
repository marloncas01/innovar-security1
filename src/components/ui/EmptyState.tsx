import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export default function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-12 text-center", className)}>
      {icon && (
        <div className="text-metal-600 mb-4">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-medium text-metal-300 mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-metal-500 max-w-sm mb-4">{description}</p>
      )}
      {action}
    </div>
  );
}
