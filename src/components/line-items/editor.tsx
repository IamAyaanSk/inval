"use client";

import { DiscountType } from "@/generated/prisma/browser";
import {
  useUpdateLineItemMutation,
  useDeleteLineItemMutation,
} from "@/lib/queries/line-items";
import { cn, formatCurrency } from "@/lib/utils";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { Trash } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { GetDocumentByIdApiResponse } from "@/lib/validations/documents";
import {
  type LineItemForm,
  lineItemFormSchema,
} from "@/lib/validations/line-items";
import { useAutoSaveForm } from "@/lib/hooks/use-auto-save-form";
import { EditorStatusIndicator } from "@/components/editor-status";
import { InputErrorTooltip } from "@/components/input-error-tooltip";

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
    <div className="bg-card p-3 rounded-2xl">
      <div className="grid grid-cols-8 text-sm gap-2">
        <Controller
          control={control}
          name="description"
          render={({ field, fieldState }) => (
            <Field className="col-span-3" data-invalid={fieldState.invalid}>
              <FieldLabel className="text-[11px] hidden text-muted-foreground">
                Description
              </FieldLabel>

              <div className="relative flex items-center">
                <Input
                  {...field}
                  placeholder="Item description"
                  disabled={disabled}
                  aria-invalid={fieldState.invalid}
                  className={cn(fieldState.error && "pr-8")}
                />
                <InputErrorTooltip error={fieldState.error} />
              </div>
            </Field>
          )}
        />

        <Controller
          control={control}
          name="unitPrice"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel className="text-[11px] hidden text-muted-foreground">
                Unit Price ($)
              </FieldLabel>

              <div className="relative flex items-center">
                <Input
                  {...field}
                  type="text"
                  inputMode="decimal"
                  disabled={disabled}
                  aria-invalid={fieldState.invalid}
                  className={cn(fieldState.error && "pr-8")}
                />
                <InputErrorTooltip error={fieldState.error} />
              </div>
            </Field>
          )}
        />

        <Controller
          control={control}
          name="quantity"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel className="text-[11px] hidden text-muted-foreground">
                Quantity
              </FieldLabel>

              <div className="relative flex items-center">
                <Input
                  {...field}
                  type="number"
                  min={1}
                  disabled={disabled}
                  aria-invalid={fieldState.invalid}
                  className={cn(fieldState.error && "pr-8")}
                  onChange={(event) => {
                    const val = event.target.valueAsNumber;
                    field.onChange(Number.isNaN(val) ? 0 : val);
                  }}
                />
                <InputErrorTooltip error={fieldState.error} />
              </div>
            </Field>
          )}
        />

        <Controller
          control={control}
          name="discount"
          render={({ field, fieldState }) => (
            <Field className="col-span-2" data-invalid={fieldState.invalid}>
              <FieldLabel className="text-[11px] hidden text-muted-foreground">
                Discount
              </FieldLabel>

              <div className="relative flex items-center">
                <Input
                  {...field}
                  type="text"
                  inputMode="decimal"
                  disabled={disabled}
                  aria-invalid={fieldState.invalid}
                  className={cn(fieldState.error && "pr-14")}
                />

                <InputErrorTooltip
                  error={fieldState.error}
                  className="right-9"
                />

                <Controller
                  control={control}
                  name="discountType"
                  render={({ field: typeField }) => (
                    <select
                      {...typeField}
                      disabled={disabled}
                      className="
                        h-full                        
                        border-l                        
                        bg-muted/40                                                
                        text-xs
                        font-semibold
                        rounded-r-lg
                        outline-none
                        focus:bg-background
                        transition-colors
                        cursor-pointer
                        absolute right-0 top-0
                        px-1.5
                      "
                    >
                      <option value={DiscountType.FIXED}>$</option>
                      <option value={DiscountType.PERCENTAGE}>%</option>
                    </select>
                  )}
                />
              </div>
            </Field>
          )}
        />

        <Controller
          control={control}
          name="taxPercentage"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel className="text-[11px] hidden text-muted-foreground">
                Tax (%)
              </FieldLabel>

              <div className="relative flex items-center">
                <Input
                  {...field}
                  type="text"
                  inputMode="decimal"
                  disabled={disabled}
                  aria-invalid={fieldState.invalid}
                  className={cn(fieldState.error && "pr-8")}
                />
                <InputErrorTooltip error={fieldState.error} />
              </div>
            </Field>
          )}
        />
      </div>

      <div
        className="
          flex flex-wrap
          items-center justify-between
          gap-2          
          pt-2
          text-xs                 
        "
      >
        <div className="flex items-center justify-center">
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
            <Trash className="size-4" />
          </Button>
          <EditorStatusIndicator status={status} errorMessage={errorMessage} />
        </div>

        <div className="flex gap-8">
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
    </div>
  );
}
