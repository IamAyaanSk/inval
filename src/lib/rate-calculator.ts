import "server-only";

import { LineItem, Prisma } from "@/generated/prisma/client";
import { Decimal } from "@prisma/client/runtime/client";
import { ApiError } from "@/lib/api/errors";

type MinimalProcessableLineItem = Pick<
  LineItem,
  | "description"
  | "discountType"
  | "discount"
  | "unitPrice"
  | "quantity"
  | "taxPercentage"
>;

type CalculatedLineItem = Pick<
  MinimalProcessableLineItem,
  "description" | "quantity"
> & {
  lineTotal: string;
  lineSubTotal: string;
  lineTaxAmount: string;
  lineDiscountAmount: string;
  discount: string;
  unitPrice: string;
  taxPercentage: string;
};

export const roundDecimal = (decimal: Decimal, points = 2) =>
  decimal.toDecimalPlaces(points);

// Format decimal to send it in api resposne
export const decimalToString = (decimal: Decimal | null, points: number = 2) =>
  (decimal ?? 0).toFixed(points);

const _calculateLineItemTotalOrThrow = (
  lineItem: MinimalProcessableLineItem,
) => {
  const decimalZero = new Prisma.Decimal(0);

  let lineDiscountAmount = decimalZero;
  let lineTaxAmount = decimalZero;

  const { quantity, unitPrice, taxPercentage, discount, discountType } =
    lineItem;

  const lineSubTotal = unitPrice.mul(quantity);

  const isDiscountProcessable =
    discount != null && !discount.equals(decimalZero) && discountType != null;

  if (isDiscountProcessable) {
    switch (discountType) {
      case "FIXED":
        if (discount.gt(lineSubTotal))
          throw new ApiError({
            message: "Fixed discount cannot exceed line subtotal",
            httpStatusCode: 422,
          });

        lineDiscountAmount = discount;
        break;
      case "PERCENTAGE":
        if (discount.gt(100)) {
          throw new ApiError({
            message: "Percentage discount cannot exceed 100%",
            httpStatusCode: 422,
          });
        }

        lineDiscountAmount = lineSubTotal.mul(discount.div(100));
        break;
    }
  }

  const discountedAmount = lineSubTotal.sub(lineDiscountAmount);

  if (taxPercentage != null) {
    if (taxPercentage.gt(100)) {
      throw new ApiError({
        message: "Percentage tax cannot exceed 100%",
        httpStatusCode: 422,
      });
    }

    lineTaxAmount = discountedAmount.mul(taxPercentage.div(100));
  }

  const lineTotal = discountedAmount.add(lineTaxAmount);

  // Round it with helper, ase we will use it in calculation further
  return {
    lineTotal: roundDecimal(lineTotal),
    lineSubTotal: roundDecimal(lineSubTotal),
    lineTaxAmount: roundDecimal(lineTaxAmount),
    lineDiscountAmount: roundDecimal(lineDiscountAmount),
  };
};

export const calculateDocumentTotalOrThrow = (
  lineItems: MinimalProcessableLineItem[],
) => {
  const decimalZero = new Prisma.Decimal(0);

  let subTotal = decimalZero;
  let discountAmount = decimalZero;
  let taxAmount = decimalZero;
  let grandTotal = decimalZero;

  const calculatedLineItems: CalculatedLineItem[] = [];

  lineItems.forEach((lineItem) => {
    const { lineDiscountAmount, lineSubTotal, lineTaxAmount, lineTotal } =
      _calculateLineItemTotalOrThrow(lineItem);

    discountAmount = discountAmount.add(lineDiscountAmount);
    subTotal = subTotal.add(lineSubTotal);
    taxAmount = taxAmount.add(lineTaxAmount);
    grandTotal = grandTotal.add(lineTotal);

    calculatedLineItems.push({
      ...lineItem,
      discount: decimalToString(lineItem.discount),
      taxPercentage: decimalToString(lineItem.taxPercentage),
      unitPrice: decimalToString(lineItem.unitPrice),
      lineDiscountAmount: decimalToString(lineDiscountAmount),
      lineSubTotal: decimalToString(lineSubTotal),
      lineTaxAmount: decimalToString(lineTaxAmount),
      lineTotal: decimalToString(lineTotal),
    });
  });

  return {
    subTotal: subTotal,
    discountAmount,
    taxAmount,
    grandTotal,
    calculatedLineItems,
  };
};
