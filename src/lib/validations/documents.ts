import { DiscountType, DocumentStatus } from "@/generated/prisma/browser";
import {
  createApiResponseSchema,
  descriptionSchema,
  getPositiveDecimalSchema,
  getNameSchema,
  iso8601DateTimeSchema,
  ulidSchema,
} from "@/lib/validations/shared";
import { z } from "zod";

// Get document
const getDocumentByIdLineItemSchema = z.object({
  id: ulidSchema,
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
    id: ulidSchema,
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

// Update document meta
export const updateDocumentMetaApiRequestBodySchema = z.object({
  title: getNameSchema("Document title").optional(),
  customer: getNameSchema("Customer name").optional(),
  issueDate: iso8601DateTimeSchema.optional(),
});

export const updateDocumentMetaApiResponseSchema = createApiResponseSchema(
  z.object({
    id: ulidSchema,
    title: getNameSchema("Document title"),
    customer: getNameSchema("Customer name"),
    issueDate: iso8601DateTimeSchema,
  }),
);

export type UpdateDocumentMetaApiRequestBody = z.infer<
  typeof updateDocumentMetaApiRequestBodySchema
>;
export type UpdateDocumentMetaApiResponse = z.infer<
  typeof updateDocumentMetaApiResponseSchema
>;

// Create new document
export const createDocumentApiRequestBodySchema = z.object({
  title: getNameSchema("Document title"),
  customer: getNameSchema("Customer name"),
  issueDate: iso8601DateTimeSchema,
});

export const createDocumentApiResponseSchema = createApiResponseSchema(
  z.object({
    id: ulidSchema, // Will use this for redirection to document page
  }),
);

export type CreateDocumentApiRequestBody = z.infer<
  typeof createDocumentApiRequestBodySchema
>;
export type CreateDocumentApiResponseSchema = z.infer<
  typeof createDocumentApiResponseSchema
>;
