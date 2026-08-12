"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { cn, formatDateToInputValue } from "@/lib/utils";
import {
  documentMetaFormSchema,
  type DocumentMetaForm,
} from "@/lib/validations/documents";
import { useUpdateDocumentMetaMutation } from "@/lib/queries/documents";
import { useAutoSaveForm } from "@/lib/hooks/use-auto-save-form";
import { EditorStatusIndicator } from "@/components/editor-status";
import { InputErrorTooltip } from "@/components/input-error-tooltip";

type DocumentMetaEditorProps = {
  documentId: string;
  documentMeta: DocumentMetaForm;
  setEditorHasError: React.Dispatch<React.SetStateAction<boolean>>;
};

export function DocumentMetaEditor({
  documentMeta,
  documentId,
  setEditorHasError,
}: DocumentMetaEditorProps) {
  const form = useForm<DocumentMetaForm>({
    defaultValues: {
      title: documentMeta.title,
      customer: documentMeta.customer,
      issueDate: formatDateToInputValue(new Date(documentMeta.issueDate)),
    },
    resolver: zodResolver(documentMetaFormSchema),
  });

  const {
    register,
    formState: { errors },
  } = form;

  const updateMetaMutation = useUpdateDocumentMetaMutation();

  const { status, errorMessage } = useAutoSaveForm({
    form,
    setEditorHasError,
    onSave: (values) =>
      updateMetaMutation.mutateAsync({
        documentId,
        body: values,
      }),
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Document Details
        </h3>
        <EditorStatusIndicator status={status} errorMessage={errorMessage} />
      </div>

      <FieldGroup className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <Field className="sm:col-span-2" data-invalid={!!errors.title}>
          <FieldLabel className="text-xs text-muted-foreground font-medium">
            Title
          </FieldLabel>
          <div className="relative flex items-center">
            <Input
              {...register("title")}
              placeholder="Document title"
              aria-invalid={!!errors.title}
              className={cn(errors.title && "pr-8")}
            />
            <InputErrorTooltip error={errors.title} />
          </div>
        </Field>

        <Field className="sm:col-span-1" data-invalid={!!errors.customer}>
          <FieldLabel className="text-xs text-muted-foreground font-medium">
            Customer Name
          </FieldLabel>
          <div className="relative flex items-center">
            <Input
              {...register("customer")}
              placeholder="Customer name"
              aria-invalid={!!errors.customer}
              className={cn(errors.customer && "pr-8")}
            />
            <InputErrorTooltip error={errors.customer} />
          </div>
        </Field>

        <Field className="sm:col-span-1" data-invalid={!!errors.issueDate}>
          <FieldLabel className="text-xs text-muted-foreground font-medium">
            Issue Date
          </FieldLabel>
          <div className="relative flex items-center">
            <Input
              {...register("issueDate")}
              type="date"
              aria-invalid={!!errors.issueDate}
              className={cn(errors.issueDate && "pr-8")}
            />
            <InputErrorTooltip error={errors.issueDate} />
          </div>
        </Field>
      </FieldGroup>
    </div>
  );
}
