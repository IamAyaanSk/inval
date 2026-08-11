"use client";

import { DiscountType } from "@/generated/prisma/browser";
import {
  useUpdateLineItemMutation,
  useDeleteLineItemMutation,
} from "@/lib/queries/line-items";
import { formatCurrency } from "@/lib/utils";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { Trash2 } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { FormInputError } from "@/components/input-error";
import { GetDocumentByIdApiResponse } from "@/lib/validations/documents";
import {
  type LineItemForm,
  lineItemFormSchema,
} from "@/lib/validations/line-items";
import { useAutoSaveForm } from "@/lib/hooks/use-auto-save-form";
import { EditorStatusIndicator } from "@/components/editor-status";

type LineItemEditorProps = {
  documentId: string;
  item: GetDocumentByIdApiResponse["data"]["lineItems"][number];
  setEditorHasError: React.Dispatch<React.SetStateAction<boolean>>;
  disabled?: boolean;
};

export function LineItemEditor({
  documentId,
  item,
  setEditorHasError,
  disabled = false,
}: LineItemEditorProps) {
  const updateLineItemMutation = useUpdateLineItemMutation(documentId);
  const deleteLineItemMutation = useDeleteLineItemMutation(documentId);

  const form = useForm<LineItemForm>({
    mode: "onChange",
    defaultValues: {
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      discount: item.discount ?? "0",
      discountType: item.discountType ?? DiscountType.FIXED,
      taxPercentage: item.taxPercentage ?? "0",
    },
    resolver: zodResolver(lineItemFormSchema),
  });

  const { control } = form;

  const { status, errorMessage } = useAutoSaveForm({
    form,
    setEditorHasError,
    onSave: (values) =>
      updateLineItemMutation.mutateAsync({
        lineItemId: item.id,
        body: values,
      }),
  });

  const handleDelete = () => {
    deleteLineItemMutation.mutate(item.id);
  };

  return (
    <div
      className="
        flex flex-col gap-3 rounded-xl border
        bg-muted/20 p-3.5
        transition-colors
        hover:border-foreground/20
      "
    >
      <div className="flex items-center justify-between gap-2">
        <Controller
          control={control}
          name="description"
          render={({ field, fieldState }) => (
            <Field className="flex-1" data-invalid={fieldState.invalid}>
              <FieldLabel className="text-[11px] text-muted-foreground">
                Description
              </FieldLabel>

              <Input
                {...field}
                placeholder="Item description"
                disabled={disabled}
                aria-invalid={fieldState.invalid}
              />

              {fieldState.error && (
                <FormInputError errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />

        <div className="flex items-center gap-1.5 mt-5">
          <EditorStatusIndicator status={status} errorMessage={errorMessage} />

          <Button
            size="icon-sm"
            variant="ghost"
            type="button"
            onClick={handleDelete}
            disabled={disabled || deleteLineItemMutation.isPending}
            className="
              text-muted-foreground
              hover:text-destructive
              shrink-0
            "
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Controller
          control={control}
          name="unitPrice"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel className="text-[11px] text-muted-foreground">
                Unit Price ($)
              </FieldLabel>

              <Input
                {...field}
                type="text"
                inputMode="decimal"
                disabled={disabled}
                aria-invalid={fieldState.invalid}
              />

              {fieldState.error && (
                <FormInputError errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />

        <Controller
          control={control}
          name="quantity"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel className="text-[11px] text-muted-foreground">
                Quantity
              </FieldLabel>

              <Input
                {...field}
                type="number"
                min={1}
                disabled={disabled}
                aria-invalid={fieldState.invalid}
                onChange={(event) => {
                  const val = event.target.valueAsNumber;
                  field.onChange(Number.isNaN(val) ? 0 : val);
                }}
              />

              {fieldState.error && (
                <FormInputError errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />

        <Controller
          control={control}
          name="discount"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel className="text-[11px] text-muted-foreground">
                Discount
              </FieldLabel>

              <div
                className="
                  flex items-center rounded-lg
                  border border-input
                  bg-transparent
                  focus-within:border-ring
                  focus-within:ring-1
                  focus-within:ring-ring
                "
              >
                <Input
                  {...field}
                  type="text"
                  inputMode="decimal"
                  disabled={disabled}
                  aria-invalid={fieldState.invalid}
                  className="
                    border-0
                    focus-visible:ring-0
                    focus-visible:border-0
                    rounded-r-none
                    h-8
                    text-xs
                  "
                />

                <Controller
                  control={control}
                  name="discountType"
                  render={({ field: typeField }) => (
                    <select
                      {...typeField}
                      disabled={disabled}
                      className="
                        h-8
                        border-l
                        border-input
                        bg-muted/40
                        px-2
                        text-xs
                        font-semibold
                        rounded-r-lg
                        outline-none
                        focus:bg-background
                        transition-colors
                        cursor-pointer
                      "
                    >
                      <option value={DiscountType.FIXED}>$</option>

                      <option value={DiscountType.PERCENTAGE}>%</option>
                    </select>
                  )}
                />
              </div>

              {fieldState.error && (
                <FormInputError errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />

        <Controller
          control={control}
          name="taxPercentage"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel className="text-[11px] text-muted-foreground">
                Tax (%)
              </FieldLabel>

              <Input
                {...field}
                type="text"
                inputMode="decimal"
                disabled={disabled}
                aria-invalid={fieldState.invalid}
              />

              {fieldState.error && (
                <FormInputError errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />
      </div>

      <div
        className="
          flex flex-wrap
          items-center justify-between
          gap-2
          border-t border-border/60
          pt-2
          text-[11px]
          text-muted-foreground
        "
      >
        <div className="flex items-center gap-3 flex-wrap">
          <span>
            Subtotal:{" "}
            <strong className="text-foreground">
              {formatCurrency(item.lineSubTotal)}
            </strong>
          </span>

          <span>
            Discount:{" "}
            <strong className="text-foreground">
              -{formatCurrency(item.lineDiscountAmount)}
            </strong>
          </span>

          <span>
            Tax:{" "}
            <strong className="text-foreground">
              +{formatCurrency(item.lineTaxAmount)}
            </strong>
          </span>
        </div>

        <div>
          Total:{" "}
          <strong
            className="
              text-sm
              font-semibold
              text-primary
            "
          >
            {formatCurrency(item.lineTotal)}
          </strong>
        </div>
      </div>
    </div>
  );
}
