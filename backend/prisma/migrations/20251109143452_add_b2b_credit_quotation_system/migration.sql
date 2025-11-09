-- CreateEnum
CREATE TYPE "PaymentTerm" AS ENUM ('NET_30', 'NET_60', 'NET_90', 'NET_120', 'IMMEDIATE');

-- CreateEnum
CREATE TYPE "AccountStatus" AS ENUM ('COMMERCIAL_IN_PROCESS', 'FINANCIAL_IN_PROCESS', 'ACTIVE', 'FINANCIAL_NON_CURRENT', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "QuotationStatus" AS ENUM ('DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'DECLINED', 'CONVERTED_TO_ORDER', 'EXPIRED');

-- AlterEnum
ALTER TYPE "PaymentMethod" ADD VALUE 'NET_TERMS';
ALTER TYPE "PaymentMethod" ADD VALUE 'CHEQUE';

-- AlterTable: Add B2B financial fields to users
ALTER TABLE "users" ADD COLUMN "financial_limit" DECIMAL(10,2) DEFAULT 0;
ALTER TABLE "users" ADD COLUMN "current_outstanding" DECIMAL(10,2) DEFAULT 0;
ALTER TABLE "users" ADD COLUMN "payment_term" "PaymentTerm";
ALTER TABLE "users" ADD COLUMN "account_status" "AccountStatus" NOT NULL DEFAULT 'COMMERCIAL_IN_PROCESS';

-- AlterTable: Add B2B fields to orders
ALTER TABLE "orders" ADD COLUMN "quotation_id" TEXT;
ALTER TABLE "orders" ADD COLUMN "payment_term" "PaymentTerm";
ALTER TABLE "orders" ADD COLUMN "due_date" TIMESTAMP(3);

-- CreateTable: quotations
CREATE TABLE "quotations" (
    "id" TEXT NOT NULL,
    "quotation_number" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "status" "QuotationStatus" NOT NULL DEFAULT 'DRAFT',
    "subtotal" DECIMAL(10,2) NOT NULL,
    "tax_amount" DECIMAL(10,2) NOT NULL,
    "total_amount" DECIMAL(10,2) NOT NULL,
    "anticipated_outstanding" DECIMAL(10,2) NOT NULL,
    "shipping_address_id" TEXT,
    "shipping_address" TEXT,
    "admin_decision_reason" TEXT,
    "reviewed_by" TEXT,
    "reviewed_at" TIMESTAMP(3),
    "converted_to_order_id" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "quotations_pkey" PRIMARY KEY ("id")
);

-- CreateTable: quotation_items
CREATE TABLE "quotation_items" (
    "id" TEXT NOT NULL,
    "quotation_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "product_name" TEXT NOT NULL,
    "product_sku" TEXT,
    "selected_size" TEXT,
    "selected_unit_type" TEXT,
    "quantity" INTEGER NOT NULL,
    "unit_price" DECIMAL(10,2) NOT NULL,
    "total_price" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "quotation_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "quotations_quotation_number_key" ON "quotations"("quotation_number");

-- CreateIndex
CREATE UNIQUE INDEX "quotations_converted_to_order_id_key" ON "quotations"("converted_to_order_id");

-- CreateIndex
CREATE UNIQUE INDEX "orders_quotation_id_key" ON "orders"("quotation_id");

-- AddForeignKey
ALTER TABLE "quotations" ADD CONSTRAINT "quotations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotations" ADD CONSTRAINT "quotations_shipping_address_id_fkey" FOREIGN KEY ("shipping_address_id") REFERENCES "addresses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotations" ADD CONSTRAINT "quotations_converted_to_order_id_fkey" FOREIGN KEY ("converted_to_order_id") REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotations" ADD CONSTRAINT "quotations_reviewed_by_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotation_items" ADD CONSTRAINT "quotation_items_quotation_id_fkey" FOREIGN KEY ("quotation_id") REFERENCES "quotations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotation_items" ADD CONSTRAINT "quotation_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
