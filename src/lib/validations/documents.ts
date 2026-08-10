import { DocumentStatus } from "@/generated/prisma/browser";
import {
  createApiResponseSchema,
  getPositiveDecimalSchema,
  getNameSchema,
  iso8601DateTimeSchema,
  ulidSchema,
} from "@/lib/validations/shared";
import { z } from "zod";
import { lineItemBaseSchema } from "@/lib/validations/line-items";

export const documentBaseSchema = z.object({
  id: ulidSchema,
  title: getNameSchema("Document title"),
  customer: getNameSchema("Customer name"),
  issueDate: iso8601DateTimeSchema,
  status: z.enum(DocumentStatus),
  lineItems: z.array(lineItemBaseSchema),

  subTotal: getPositiveDecimalSchema("Sub total"),
  discountAmount: getPositiveDecimalSchema("Calculated discount"),
  taxAmount: getPositiveDecimalSchema("Calculated tax"),
  grandTotal: getPositiveDecimalSchema("Grand total"),
});

// Get document
export const getDocumentByIdApiResponseSchema =
  createApiResponseSchema(documentBaseSchema);

export type GetDocumentByIdApiResponse = z.infer<
  typeof getDocumentByIdApiResponseSchema
>;

// Update document meta
export const updateDocumentMetaApiRequestBodySchema = z.object({
  title: documentBaseSchema.shape.title.optional(),
  customer: documentBaseSchema.shape.customer.optional(),
  issueDate: documentBaseSchema.shape.issueDate.optional(),
});

export const updateDocumentMetaApiResponseSchema = createApiResponseSchema(
  documentBaseSchema.pick({
    id: true,
    title: true,
    customer: true,
    issueDate: true,
  }),
);

export type UpdateDocumentMetaApiRequestBody = z.infer<
  typeof updateDocumentMetaApiRequestBodySchema
>;
export type UpdateDocumentMetaApiResponse = z.infer<
  typeof updateDocumentMetaApiResponseSchema
>;

// Create new document
export const createDocumentApiRequestBodySchema = documentBaseSchema.pick({
  title: true,
  customer: true,
  issueDate: true,
});

export const createDocumentApiResponseSchema = createApiResponseSchema(
  documentBaseSchema.pick({
    id: true,
  }),
);

export type CreateDocumentApiRequestBody = z.infer<
  typeof createDocumentApiRequestBodySchema
>;
export type CreateDocumentApiResponseSchema = z.infer<
  typeof createDocumentApiResponseSchema
>;
