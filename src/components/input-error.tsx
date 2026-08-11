import { Info } from "lucide-react";

import { FieldError } from "@/components/ui/field";
import { cn } from "@/lib/utils";

type FormInputErrorProps = Parameters<typeof FieldError>[0];

export function FormInputError({
  errors,
  className,
  ...props
}: FormInputErrorProps) {
  if (!errors?.length || !errors[0]) return null;

  return (
    <div className="flex items-center gap-1.5">
      <Info className="size-3 text-destructive" />
      <FieldError
        className={cn("text-xs", className)}
        errors={errors}
        {...props}
      />
    </div>
  );
}
