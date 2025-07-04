import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import { eq, asc } from "drizzle-orm";
import { CourseTable, ProductTable } from "@/drizzle/schema";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { getCourseGlobalTag } from "@/features/courses/db/cache/courses";
import { db } from "@/drizzle/db";
import { ProductForm } from "@/features/products/components/ProductForm";
import { getProductIdTag } from "@/features/products/db/cache";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const { productId } = await params;
  const product = await getProduct(productId);

  if (product == null) return notFound();

  return (
    <div className="container my-6">
      <PageHeader title="New Product" />
      <ProductForm
        product={{
          ...product,
          courseIds: product.courseProducts.map((c) => c.courseId),
        }}
        courses={await getCourses()}
      />
    </div>
  );
}

async function getCourses() {
  "use cache";
  cacheTag(getCourseGlobalTag());

  return db.query.CourseTable.findMany({
    orderBy: asc(CourseTable.name),
    columns: {
      id: true,
      name: true,
    },
  });
}

async function getProduct(id: string) {
  "use cache";
  cacheTag(getProductIdTag(id));

  return db.query.ProductTable.findFirst({
    columns: {
      id: true,
      name: true,
      status: true,
      description: true,
      priceInDollars: true,
      imageUrl: true,
    },
    where: eq(ProductTable.id, id),
    with: { courseProducts: { columns: { courseId: true } } },
  });
}
