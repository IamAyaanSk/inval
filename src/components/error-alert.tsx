import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type ErrorAlertProps = {
  error?: unknown;
  fallbackMessage?: string;
  className?: string;
};

export function ErrorAlert({
  error,
  fallbackMessage = "An unexpected error occurred",
  className,
}: ErrorAlertProps) {
  if (!error) return null;

  const message =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : fallbackMessage;

  return (
    <div
      className={cn(
        "flex items-center gap-2.5 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive",
        className,
      )}
    >
      <AlertCircle className="size-4 shrink-0" />
      <p className="font-medium">{message}</p>
    </div>
  );
}
