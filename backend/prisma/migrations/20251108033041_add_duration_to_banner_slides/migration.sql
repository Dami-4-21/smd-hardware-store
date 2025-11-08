-- CreateEnum
CREATE TYPE "SlideType" AS ENUM ('IMAGE', 'TEXT');

-- CreateTable
CREATE TABLE "banner_slides" (
    "id" TEXT NOT NULL,
    "title" TEXT,
    "subtitle" TEXT,
    "button_text" TEXT,
    "slide_type" "SlideType" NOT NULL,
    "image_url" TEXT,
    "background_color" TEXT,
    "text_color" TEXT,
    "link_type" TEXT,
    "linked_product_id" TEXT,
    "linked_category_id" TEXT,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "duration" INTEGER DEFAULT 5,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "banner_slides_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "banner_slides" ADD CONSTRAINT "banner_slides_linked_product_id_fkey" FOREIGN KEY ("linked_product_id") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "banner_slides" ADD CONSTRAINT "banner_slides_linked_category_id_fkey" FOREIGN KEY ("linked_category_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;
