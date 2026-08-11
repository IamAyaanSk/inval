"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Plus } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { FormInputError } from "@/components/input-error";
import { useCreateDocumentMutation } from "@/lib/queries/documents";
import {
  createDocumentApiRequestBodySchema,
  type CreateDocumentApiRequestBody,
} from "@/lib/validations/documents";

export function NewDocumentDialog() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const createMutation = useCreateDocumentMutation();

  const form = useForm<CreateDocumentApiRequestBody>({
    resolver: zodResolver(createDocumentApiRequestBodySchema),
    defaultValues: {
      title: "",
      customer: "",
      issueDate: new Date().toISOString(),
    },
  });

  const {
    handleSubmit,
    control,
    reset,
    formState: { isSubmitting },
  } = form;

  async function onSubmit(values: CreateDocumentApiRequestBody) {
    try {
      const data = await createMutation.mutateAsync(values);
      toast.success("Document created");
      setOpen(false);
      reset();
      router.push(`/dashboard/documents/${data.id}`);
    } catch {
      toast.error("Failed to create document");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        className="border"
        render={
          <button className="group flex w-40 shrink-0 flex-col overflow-hidden rounded-xl transition-all hover:ring-primary/40 hover:shadow-md cursor-pointer" />
        }
      >
        <div className="flex h-48 items-center justify-center bg-muted/40 transition-colors group-hover:bg-primary/5">
          <Plus className="size-12 text-primary transition-colors" />
        </div>
        <div className="flex flex-col gap-0.5 border-t px-3 py-2.5">
          <p className="text-sm font-medium">New Document</p>
          <p className="text-xs text-muted-foreground">Create a draft</p>
        </div>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Document</DialogTitle>
          <DialogDescription>
            Fill in the details to create a new draft document.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FieldGroup>
            <Controller
              name="title"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="new-doc-title">
                    Document Title
                  </FieldLabel>
                  <Input
                    {...field}
                    id="new-doc-title"
                    placeholder="Banking service"
                    aria-invalid={fieldState.invalid}
                    disabled={isSubmitting}
                  />
                  {fieldState.invalid ? (
                    <FormInputError errors={[fieldState.error]} />
                  ) : null}
                </Field>
              )}
            />

            <Controller
              name="customer"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="new-doc-customer">
                    Customer Name
                  </FieldLabel>
                  <Input
                    {...field}
                    id="new-doc-customer"
                    placeholder="Acme Corp."
                    aria-invalid={fieldState.invalid}
                    disabled={isSubmitting}
                  />
                  {fieldState.invalid ? (
                    <FormInputError errors={[fieldState.error]} />
                  ) : null}
                </Field>
              )}
            />

            <Controller
              name="issueDate"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="new-doc-issue-date">
                    Issue Date
                  </FieldLabel>
                  <Input
                    id="new-doc-issue-date"
                    type="date"
                    value={field.value ? field.value.slice(0, 10) : ""}
                    onChange={(e) => {
                      const date = new Date(e.target.value);
                      if (!isNaN(date.getTime())) {
                        field.onChange(date.toISOString());
                      }
                    }}
                    aria-invalid={fieldState.invalid}
                    disabled={isSubmitting}
                  />
                  {fieldState.invalid ? (
                    <FormInputError errors={[fieldState.error]} />
                  ) : null}
                </Field>
              )}
            />
          </FieldGroup>

          <DialogFooter className="mt-4" showCloseButton>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Document"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
