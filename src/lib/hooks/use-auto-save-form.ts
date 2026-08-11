"use client";

import { useEffect, useRef, useState } from "react";
import { UseFormReturn, FieldValues } from "react-hook-form";
import { EditorStatus } from "@/components/editor-status";
import { DEFAULT_DEBOUNCE_TIME_IN_MS } from "@/lib/constants";

type AutoSaveOptions<T extends FieldValues> = {
  form: UseFormReturn<T>;
  onSave: (values: T) => Promise<unknown> | void;
  setEditorHasError?: (hasError: boolean) => void;
  debounceMs?: number;
};

export function useAutoSaveForm<T extends FieldValues>({
  form,
  onSave,
  setEditorHasError,
  debounceMs = DEFAULT_DEBOUNCE_TIME_IN_MS,
}: AutoSaveOptions<T>) {
  const [status, setStatus] = useState<EditorStatus>("saved");
  const [errorMessage, setErrorMessage] = useState<string>();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const { watch, trigger, getValues } = form;

  useEffect(() => {
    const subscription = watch(() => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      timerRef.current = setTimeout(async () => {
        const valid = await trigger();
        if (!valid) {
          setEditorHasError?.(true);
          return;
        }

        setEditorHasError?.(false);
        setStatus("saving");
        setErrorMessage(undefined);

        try {
          await onSave(getValues());
          setStatus("saved");
        } catch (err) {
          setStatus("error");
          setErrorMessage(
            err instanceof Error ? err.message : "Failed to save changes",
          );
        }
      }, debounceMs);
    });

    return () => {
      subscription.unsubscribe();
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [watch, trigger, getValues, onSave, setEditorHasError, debounceMs]);

  return { status, errorMessage };
}
