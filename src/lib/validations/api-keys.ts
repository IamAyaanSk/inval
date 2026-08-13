import { z } from "zod";
import { getNameSchema } from "@/lib/validations/shared";

export const createApiKeyFormSchema = z.object({
  name: getNameSchema("Key name"),
});

export type CreateApiKeyFormValues = z.infer<typeof createApiKeyFormSchema>;
