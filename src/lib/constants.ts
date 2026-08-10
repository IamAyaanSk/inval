import { DiscountType } from "@/generated/prisma/browser";

export const DEFAULT_LINE_ITEM = {
  description: "Hosting fee",
  quantity: 1,
  unitPrice: "100.00",
  taxPercentage: "5",
  discount: "0.00",
  discountType: DiscountType.FIXED,
};
