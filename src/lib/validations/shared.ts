import { z } from "zod";

export const getNameSchema = (forName: string) =>
  z
    .string()
    .trim()
    .min(2, `${forName} must be at least 2 characters`)
    .max(120, `${forName} is too long`);

export const getPositiveDecimalSchema = (forEntity: string) =>
  z
    .string()
    .regex(/^\d+(?:\.\d{1,2})?$/, {
      message: `${forEntity} must be a valid decimal with up to 2 decimal places`,
    })
    .refine((value) => Number(value) > 0, {
      message: `${forEntity} must be greater than 0`,
    });

export const iso8601DateTimeSchema = z.iso.datetime(
  "Enter a valid ISO 8601 datetime",
);

export const ulidSchema = z.ulid("Invalid id");

export const descriptionSchema = z.string().trim().min(1).max(500);

// Api responses validation schemas
const apiResponseStatusSchema = z.enum(["success", "error"]);

const apiResponseBaseSchema = z.object({
  status: apiResponseStatusSchema,
  message: z.string(),
});

// better type resolutions by using function overloads here
// https://www.typescriptlang.org/docs/handbook/2/functions.html#function-overloads
export function createApiResponseSchema(): typeof apiResponseBaseSchema;
export function createApiResponseSchema<T extends z.ZodType>(
  dataSchema: T,
): ReturnType<typeof apiResponseBaseSchema.extend<{ data: T }>>;
export function createApiResponseSchema<T extends z.ZodType>(dataSchema?: T) {
  if (dataSchema) {
    return apiResponseBaseSchema.extend({ data: dataSchema });
  }
  return apiResponseBaseSchema;
}

export type ApiResponseBase = z.infer<typeof apiResponseBaseSchema>;
export type ApiResponse<T> = ApiResponseBase & { data: T };
