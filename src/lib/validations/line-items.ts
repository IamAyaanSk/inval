import { z } from "zod";
import {
  createApiResponseSchema,
  descriptionSchema,
  getPositiveDecimalSchema,
  ulidSchema,
} from "@/lib/validations/shared";
import { DiscountType } from "@/generated/prisma/browser";
import { documentBaseSchema } from "@/lib/validations/documents";

export const lineItemBaseSchema = z.object({
  id: ulidSchema,
  description: descriptionSchema,
  quantity: z.number().positive(),
  unitPrice: getPositiveDecimalSchema("Unit price"),
  discount: getPositiveDecimalSchema("Discount").optional(),
  discountType: z.enum(DiscountType).optional(),
  taxPercentage: getPositiveDecimalSchema("Tax").optional(),

  lineSubTotal: getPositiveDecimalSchema("Sub total"),
  lineDiscountAmount: getPositiveDecimalSchema("Calculated discount"),
  lineTaxAmount: getPositiveDecimalSchema("Calculated tax"),
  lineTotal: getPositiveDecimalSchema("Line total"),
});

const documentTotalsSchema = documentBaseSchema.pick({
  discountAmount: true,
  subTotal: true,
  grandTotal: true,
  taxAmount: true,
});

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
