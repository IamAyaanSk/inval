import { describe, expect, it } from "vitest";
import { Prisma } from "@/generated/prisma/client";
import {
  calculateDocumentTotalOrThrow,
  decimalToString,
  roundDecimal,
} from "@/lib/rate-calculator";
import { ApiError } from "@/lib/api/errors";

const dec = (val: string | number) => new Prisma.Decimal(val);

describe("rate-calculator", () => {
  // Discount tests
  describe("Fixed Discount Rules", () => {
    it("handles zero fixed discount correctly", () => {
      const lineItems = [
        {
          id: "item_1",
          description: "Item 1",
          quantity: 2,
          unitPrice: dec("50.00"),
          discount: dec("0.00"),
          discountType: "FIXED" as const,
          taxPercentage: null,
        },
      ];

      const result = calculateDocumentTotalOrThrow(lineItems);
      expect(result.calculatedLineItems[0].lineDiscountAmount).toBe("0.00");
      expect(result.calculatedLineItems[0].lineTotal).toBe("100.00");
    });

    it("allows fixed discount equal to line subtotal", () => {
      const lineItems = [
        {
          id: "item_1",
          description: "Item 1",
          quantity: 2,
          unitPrice: dec("50.00"),
          discount: dec("100.00"),
          discountType: "FIXED" as const,
          taxPercentage: dec("10.00"),
        },
      ];

      const result = calculateDocumentTotalOrThrow(lineItems);
      expect(result.calculatedLineItems[0].lineSubTotal).toBe("100.00");
      expect(result.calculatedLineItems[0].lineDiscountAmount).toBe("100.00");
      expect(result.calculatedLineItems[0].lineTaxAmount).toBe("0.00");
      expect(result.calculatedLineItems[0].lineTotal).toBe("0.00");
    });

    it("throws ApiError when fixed discount exceeds line subtotal", () => {
      const lineItems = [
        {
          id: "item_1",
          description: "Item 1",
          quantity: 1,
          unitPrice: dec("100.00"),
          discount: dec("150.00"),
          discountType: "FIXED" as const,
          taxPercentage: null,
        },
      ];

      expect(() => calculateDocumentTotalOrThrow(lineItems)).toThrow(ApiError);
      try {
        calculateDocumentTotalOrThrow(lineItems);
      } catch (err) {
        expect(err).toBeInstanceOf(ApiError);
        expect((err as ApiError).message).toBe(
          "Fixed discount cannot exceed line subtotal",
        );
        expect((err as ApiError).httpStatusCode).toBe(422);
      }
    });
  });

  describe("Percentage Discount Rules", () => {
    it("handles 100% percentage discount correctly", () => {
      const lineItems = [
        {
          id: "item_1",
          description: "Item 1",
          quantity: 1,
          unitPrice: dec("200.00"),
          discount: dec("100.00"),
          discountType: "PERCENTAGE" as const,
          taxPercentage: dec("15.00"),
        },
      ];

      const result = calculateDocumentTotalOrThrow(lineItems);
      expect(result.calculatedLineItems[0].lineDiscountAmount).toBe("200.00");
      expect(result.calculatedLineItems[0].lineTaxAmount).toBe("0.00");
      expect(result.calculatedLineItems[0].lineTotal).toBe("0.00");
    });

    it("throws ApiError when percentage discount exceeds 100%", () => {
      const lineItems = [
        {
          id: "item_1",
          description: "Item 1",
          quantity: 1,
          unitPrice: dec("100.00"),
          discount: dec("105.00"),
          discountType: "PERCENTAGE" as const,
          taxPercentage: null,
        },
      ];

      expect(() => calculateDocumentTotalOrThrow(lineItems)).toThrow(ApiError);
      try {
        calculateDocumentTotalOrThrow(lineItems);
      } catch (err) {
        expect(err).toBeInstanceOf(ApiError);
        expect((err as ApiError).message).toBe(
          "Percentage discount cannot exceed 100%",
        );
        expect((err as ApiError).httpStatusCode).toBe(422);
      }
    });
  });

  describe("Tax Percentage Rules", () => {
    it("applies tax strictly on the discounted line amount", () => {
      const lineItems = [
        {
          id: "item_1",
          description: "Item 1",
          quantity: 1,
          unitPrice: dec("100.00"),
          discount: dec("50.00"),
          discountType: "PERCENTAGE" as const,
          taxPercentage: dec("10.00"),
        },
      ];

      const result = calculateDocumentTotalOrThrow(lineItems);
      expect(result.calculatedLineItems[0].lineSubTotal).toBe("100.00");
      expect(result.calculatedLineItems[0].lineDiscountAmount).toBe("50.00");
      expect(result.calculatedLineItems[0].lineTaxAmount).toBe("5.00");
      expect(result.calculatedLineItems[0].lineTotal).toBe("55.00");
    });

    it("throws ApiError when tax percentage exceeds 100%", () => {
      const lineItems = [
        {
          id: "item_1",
          description: "Item 1",
          quantity: 1,
          unitPrice: dec("100.00"),
          discount: null,
          discountType: null,
          taxPercentage: dec("110.00"),
        },
      ];

      expect(() => calculateDocumentTotalOrThrow(lineItems)).toThrow(ApiError);
      try {
        calculateDocumentTotalOrThrow(lineItems);
      } catch (err) {
        expect(err).toBeInstanceOf(ApiError);
        expect((err as ApiError).message).toBe(
          "Percentage tax cannot exceed 100%",
        );
        expect((err as ApiError).httpStatusCode).toBe(422);
      }
    });
  });

  describe("Helper Functions", () => {
    it("roundDecimal rounds to specified decimal places", () => {
      expect(roundDecimal(dec("10.5555")).toString()).toBe("10.56");
      expect(roundDecimal(dec("10.5544")).toString()).toBe("10.55");
      expect(roundDecimal(dec("10.5")).toString()).toBe("10.5");
    });

    it("decimalToString converts decimal or null to string with default 2 decimal places", () => {
      expect(decimalToString(dec("10.5"))).toBe("10.50");
      expect(decimalToString(null)).toBe("0.00");
      expect(decimalToString(dec("100"))).toBe("100.00");
    });
  });

  // Some edge cases I can think of
  describe("Edge & Boundary Cases", () => {
    it("handles empty line items array gracefully", () => {
      const result = calculateDocumentTotalOrThrow([]);
      expect(result.subTotal).toBe("0.00");
      expect(result.discountAmount).toBe("0.00");
      expect(result.taxAmount).toBe("0.00");
      expect(result.grandTotal).toBe("0.00");
      expect(result.calculatedLineItems).toEqual([]);
    });

    it("handles multiple quantities and price scaling", () => {
      const lineItems = [
        {
          id: "item_bulk",
          description: "Bulk Item",
          quantity: 10,
          unitPrice: dec("25.50"),
          discount: dec("10.00"),
          discountType: "PERCENTAGE" as const,
          taxPercentage: dec("8.00"),
        },
      ];

      const result = calculateDocumentTotalOrThrow(lineItems);
      expect(result.subTotal).toBe("255.00");
      expect(result.discountAmount).toBe("25.50");
      expect(result.taxAmount).toBe("18.36");
      expect(result.grandTotal).toBe("247.86");
    });
  });
});
