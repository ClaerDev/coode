ALTER TABLE "purchases" DROP CONSTRAINT "purchases_productId_course_id_fk";
--> statement-breakpoint
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_productId_products_id_fk" FOREIGN KEY ("productId") REFERENCES "public"."products"("id") ON DELETE restrict ON UPDATE no action;