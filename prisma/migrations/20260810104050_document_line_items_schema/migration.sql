-- CreateEnum
CREATE TYPE "DocumentStatus" AS ENUM ('DRAFT', 'FINALIZED');

-- CreateEnum
CREATE TYPE "DiscountType" AS ENUM ('PERCENTAGE', 'FIXED');

-- CreateTable
CREATE TABLE "document" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "customer" TEXT NOT NULL,
    "issueDate" TIMESTAMP(3) NOT NULL,
    "status" "DocumentStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "line_item" (
    "id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" DECIMAL(12,2) NOT NULL,
    "taxPercentage" DECIMAL(12,2),
    "discount" DECIMAL(12,2),
    "discountType" "DiscountType",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "documentId" TEXT NOT NULL,

    CONSTRAINT "line_item_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "document_status_idx" ON "document"("status");

-- CreateIndex
CREATE INDEX "document_issueDate_idx" ON "document"("issueDate");

-- CreateIndex
CREATE INDEX "line_item_documentId_idx" ON "line_item"("documentId");

-- AddForeignKey
ALTER TABLE "line_item" ADD CONSTRAINT "line_item_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "document"("id") ON DELETE CASCADE ON UPDATE CASCADE;
