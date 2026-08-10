-- AlterTable
ALTER TABLE "document" ADD COLUMN     "grandTotal" DECIMAL(12,2),
ADD COLUMN     "totalDiscount" DECIMAL(12,2),
ADD COLUMN     "totalTax" DECIMAL(12,2);
