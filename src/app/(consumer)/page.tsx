import { db } from "@/drizzle/db";
import { ProductTable, ProductTag } from "@/drizzle/schema";
import { getProductGlobalTag } from "@/features/products/db/cache";
import { wherePublicProducts } from "@/features/products/permissions/products";
import { asc, desc } from "drizzle-orm";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import { ProductGrid } from "@/components/ProductGrid";
import { getUserCoupon } from "@/lib/userCountryHeader";

export type SortOption = "latest" | "oldest" | "price-low" | "price-high";

export default async function HomePage() {
  const products = await getPublicProducts();
  const coupon = await getUserCoupon();
  
  return (
    <div className="container my-10">
      <ProductGrid 
        products={products.map(product => ({ ...product, tags: product.tags as ProductTag[] }))} 
        coupon={coupon}
      />
    </div>
  );
}

async function getPublicProducts(sortBy: SortOption = "latest") {
  "use cache";
  cacheTag(getProductGlobalTag());

  let orderBy;
  switch (sortBy) {
    case "oldest":
      orderBy = asc(ProductTable.createdAt);
      break;
    case "price-low":
      orderBy = asc(ProductTable.priceInDollars);
      break;
    case "price-high":
      orderBy = desc(ProductTable.priceInDollars);
      break;
    case "latest":
    default:
      orderBy = desc(ProductTable.createdAt);
      break;
  }

  return db.query.ProductTable.findMany({
    columns: {
      id: true,
      name: true,
      description: true,
      priceInDollars: true,
      imageUrl: true,
      tags: true,
      createdAt: true,
    },
    where: wherePublicProducts,
    orderBy,
  });
}
