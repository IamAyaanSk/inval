import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export type EditorStatus = "saving" | "saved" | "error";
type EditorStatusIndicatorProps = {
  status: EditorStatus;
  errorMessage?: string;
};

export const EditorStatusIndicator = ({
  status,
  errorMessage,
}: EditorStatusIndicatorProps) => {
  let icon = null;
  let label = "";

  if (status === "saving") {
    icon = <Loader2 className="size-3.5 animate-spin text-muted-foreground" />;
    label = "Saving changes...";
  } else if (status === "saved") {
    icon = <CheckCircle2 className="size-3.5 text-emerald-500" />;
    label = "Saved";
  } else if (status === "error") {
    icon = <AlertCircle className="size-3.5 text-destructive" />;
    label = errorMessage || "Failed to save changes";
  }

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <button
            type="button"
            className="flex items-center justify-center p-1 rounded-md hover:bg-muted/50 transition-colors"
          />
        }
      >
        {icon}
      </TooltipTrigger>
      <TooltipContent side="top">{label}</TooltipContent>
    </Tooltip>
  );
};
