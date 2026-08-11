import { z } from "zod";
import {
  createApiResponseSchema,
  descriptionSchema,
  getNonNegativeDecimalSchema,
  ulidSchema,
} from "@/lib/validations/shared";
import { DiscountType } from "@/generated/prisma/browser";
export const lineItemBaseSchema = z.object({
  id: ulidSchema,
  description: descriptionSchema,
  quantity: z
    .number({ message: "Quantity is required" })
    .int("Quantity must be a whole number")
    .positive("Quantity must be at least 1"),
  unitPrice: getNonNegativeDecimalSchema("Unit price"),
  discount: getNonNegativeDecimalSchema("Discount").optional(),
  discountType: z.enum(DiscountType).optional(),
  taxPercentage: getNonNegativeDecimalSchema("Tax").optional(),

  lineSubTotal: getNonNegativeDecimalSchema("Sub total"),
  lineDiscountAmount: getNonNegativeDecimalSchema("Calculated discount"),
  lineTaxAmount: getNonNegativeDecimalSchema("Calculated tax"),
  lineTotal: getNonNegativeDecimalSchema("Line total"),
});

export const documentTotalsSchema = z.object({
  discountAmount: getNonNegativeDecimalSchema("Calculated discount"),
  subTotal: getNonNegativeDecimalSchema("Sub total"),
  grandTotal: getNonNegativeDecimalSchema("Grand total"),
  taxAmount: getNonNegativeDecimalSchema("Calculated tax"),
});

// form
export const lineItemFormSchema = lineItemBaseSchema
  .pick({
    description: true,
    quantity: true,
    unitPrice: true,
    discount: true,
    discountType: true,
    taxPercentage: true,
  })
  .superRefine((val, ctx) => {
    const quantity = val.quantity ?? 0;
    const unitPrice = parseFloat(val.unitPrice ?? "0");
    const subTotal = quantity * (isNaN(unitPrice) ? 0 : unitPrice);

    if (val.discount) {
      const discountVal = parseFloat(val.discount);
      if (!isNaN(discountVal)) {
        if (val.discountType === DiscountType.PERCENTAGE) {
          if (discountVal > 100) {
            ctx.addIssue({
              code: "custom",
              path: ["discount"],
              message: "Percentage discount cannot exceed 100%",
            });
          }
        } else if (
          val.discountType === DiscountType.FIXED ||
          !val.discountType
        ) {
          if (discountVal > subTotal) {
            ctx.addIssue({
              code: "custom",
              path: ["discount"],
              message: "Fixed discount cannot exceed line subtotal",
            });
          }
        }
      }
    }

    if (val.taxPercentage) {
      const taxVal = parseFloat(val.taxPercentage);
      if (!isNaN(taxVal) && taxVal > 100) {
        ctx.addIssue({
          code: "custom",
          path: ["taxPercentage"],
          message: "Percentage tax cannot exceed 100%",
        });
      }
    }
  });

export type LineItemForm = z.infer<typeof lineItemFormSchema>;

// Update line item
export const updateLineItemRequestBodySchema = z.object({
  description: lineItemBaseSchema.shape.description.optional(),
  quantity: lineItemBaseSchema.shape.quantity.optional(),
  unitPrice: lineItemBaseSchema.shape.unitPrice.optional(),
  discount: lineItemBaseSchema.shape.discount.optional(),
  discountType: lineItemBaseSchema.shape.discountType.optional(),
  taxPercentage: lineItemBaseSchema.shape.taxPercentage.optional(),
});

export const updateLineItemApiResponseSchema = createApiResponseSchema(
  z.object({
    lineItem: lineItemBaseSchema,
    documentTotals: documentTotalsSchema,
  }),
);

export type UpdateLineItemRequestBody = z.infer<
  typeof updateLineItemRequestBodySchema
>;

export type UpdateLineItemApiResponse = z.infer<
  typeof updateLineItemApiResponseSchema
>;

// delete line item
export const deleteLineItemApiResponseSchema = createApiResponseSchema(
  z.object({
    lineItemId: lineItemBaseSchema.shape.id,
    documentTotals: documentTotalsSchema,
  }),
);

export type DeleteLineItemApiResponse = z.infer<
  typeof deleteLineItemApiResponseSchema
>;

// create line item
export const createLineItemRequestBodySchema = lineItemBaseSchema.pick({
  description: true,
  quantity: true,
  unitPrice: true,
  discount: true,
  discountType: true,
  taxPercentage: true,
});

export const createLineItemApiResponseSchema = createApiResponseSchema(
  z.object({
    lineItem: lineItemBaseSchema,
    documentTotals: documentTotalsSchema,
  }),
);

export type CreateLineItemRequestBody = z.infer<
  typeof createLineItemRequestBodySchema
>;
export type CreateLineItemApiResponse = z.infer<
  typeof createLineItemApiResponseSchema
>;
