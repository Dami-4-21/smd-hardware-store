-- CreateTable
CREATE TABLE "product_pack_sizes" (
    "id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "pack_type" TEXT NOT NULL,
    "pack_quantity" INTEGER NOT NULL,
    "size" TEXT,
    "unit_type" TEXT,
    "price" DECIMAL(10,2) NOT NULL,
    "stock_quantity" INTEGER NOT NULL,
    "sku" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_pack_sizes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "product_pack_sizes_product_id_pack_type_size_key" ON "product_pack_sizes"("product_id", "pack_type", "size");

-- AddForeignKey
ALTER TABLE "product_pack_sizes" ADD CONSTRAINT "product_pack_sizes_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
