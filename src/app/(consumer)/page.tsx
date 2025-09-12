import { db } from "@/drizzle/db";
import { ProductTable, ProductTag } from "@/drizzle/schema";
import { ProductCard } from "@/features/products/components/ProductCard";
import { getProductGlobalTag } from "@/features/products/db/cache";
import { wherePublicProducts } from "@/features/products/permissions/products";
import { asc } from "drizzle-orm";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";

export default async function HomPage() {
  const products = await getPublicProducts();
  return (
    <div className="container my-10">
      <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-8">
        {products.map((product) => (
          <ProductCard key={product.id} {...product} tags={product.tags as ProductTag[]} />
        ))}
      </div>
    </div>
  );
}

async function getPublicProducts() {
  "use cache";
  cacheTag(getProductGlobalTag());

  return db.query.ProductTable.findMany({
    columns: {
      id: true,
      name: true,
      description: true,
      priceInDollars: true,
      imageUrl: true,
      tags: true,
    },
    where: wherePublicProducts,
    orderBy: asc(ProductTable.name),
  });
}
