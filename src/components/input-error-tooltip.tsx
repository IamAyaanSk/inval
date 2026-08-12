"use client";

import { Info } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export type InputErrorTooltipProps = {
  error?: { message?: string } | null;
  className?: string;
};

export function InputErrorTooltip({
  error,
  className,
}: InputErrorTooltipProps) {
  if (!error?.message) return null;

  return (
    <Tooltip>
      <TooltipTrigger
        type="button"
        tabIndex={-1}
        className={cn(
          "absolute text-destructive hover:text-destructive/80 transition-colors cursor-pointer z-10",
          className ?? "right-2",
        )}
      >
        <Info className="size-4 shrink-0" />
      </TooltipTrigger>
      <TooltipContent side="top">{error.message}</TooltipContent>
    </Tooltip>
  );
}
