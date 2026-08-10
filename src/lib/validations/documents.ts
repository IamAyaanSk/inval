import { DiscountType, DocumentStatus } from "@/generated/prisma/browser";
import {
  createApiResponseSchema,
  descriptionSchema,
  getPositiveDecimalSchema,
  getNameSchema,
  iso8601DateTimeSchema,
} from "@/lib/validations/shared";
import { z } from "zod";

const getDocumentByIdLineItemSchema = z.object({
  description: descriptionSchema,
  quantity: z.number().positive(),
  unitPrice: getPositiveDecimalSchema("Unit price"),
  discount: getPositiveDecimalSchema("Discount"),
  discountType: z.enum(DiscountType).optional().nullable(),
  taxPercentage: getPositiveDecimalSchema("Tax"),

  lineSubTotal: getPositiveDecimalSchema("Sub total"),
  lineDiscountAmount: getPositiveDecimalSchema("Calculated discount"),
  lineTaxAmount: getPositiveDecimalSchema("Calculated tax"),
  lineTotal: getPositiveDecimalSchema("Line total"),
});

export const getDocumentByIdApiResponseSchema = createApiResponseSchema(
  z.object({
    title: getNameSchema("Document title"),
    customer: getNameSchema("Customer name"),
    issueDate: iso8601DateTimeSchema,
    status: z.enum(DocumentStatus),
    lineItems: z.array(getDocumentByIdLineItemSchema),

    subTotal: getPositiveDecimalSchema("Sub total"),
    discountAmount: getPositiveDecimalSchema("Calculated discount"),
    taxAmount: getPositiveDecimalSchema("Calculated tax"),
    grandTotal: getPositiveDecimalSchema("Grand total"),
  }),
);

export type GetDocumentByIdApiResponse = z.infer<
  typeof getDocumentByIdApiResponseSchema
>;
