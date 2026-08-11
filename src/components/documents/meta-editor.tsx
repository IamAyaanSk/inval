"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { FormInputError } from "@/components/input-error";
import { TooltipProvider } from "@/components/ui/tooltip";
import { formatDateToInputValue } from "@/lib/utils";
import {
  documentMetaFormSchema,
  type DocumentMetaForm,
} from "@/lib/validations/documents";
import { useUpdateDocumentMetaMutation } from "@/lib/queries/documents";
import { useAutoSaveForm } from "@/lib/hooks/use-auto-save-form";
import { EditorStatusIndicator } from "@/components/editor-status";

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
    <TooltipProvider>
      <div className="flex flex-col gap-6 rounded-2xl border bg-card p-6 md:p-8 shadow-xs text-card-foreground">
        <EditorStatusIndicator status={status} errorMessage={errorMessage} />
        <FieldGroup className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field data-invalid={!!errors.title}>
            <FieldLabel className="text-xs">Title</FieldLabel>
            <Input
              {...register("title")}
              placeholder="Document title"
              aria-invalid={!!errors.title}
            />
            {errors.title && <FormInputError errors={[errors.title]} />}
          </Field>

          <Field data-invalid={!!errors.customer}>
            <FieldLabel className="text-xs">Customer Name</FieldLabel>
            <Input
              {...register("customer")}
              placeholder="Customer name"
              aria-invalid={!!errors.customer}
            />
            {errors.customer && <FormInputError errors={[errors.customer]} />}
          </Field>

          <Field className="sm:col-span-2" data-invalid={!!errors.issueDate}>
            <FieldLabel className="text-xs">Issue Date</FieldLabel>
            <Input
              {...register("issueDate")}
              type="date"
              aria-invalid={!!errors.issueDate}
            />
            {errors.issueDate && <FormInputError errors={[errors.issueDate]} />}
          </Field>
        </FieldGroup>
      </div>
    </TooltipProvider>
  );
}
