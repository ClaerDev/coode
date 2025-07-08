import { and, eq, isNull } from "drizzle-orm"
import { db } from "@/drizzle/db"
import { revalidateProductCache } from "./cache"
import {
  CourseProductTable,
  ProductTable,
  PurchaseTable,
} from "@/drizzle/schema"
import { cacheTag } from "next/dist/server/use-cache/cache-tag"
import { getPurchaseUserTag } from "@/features/purchase/db/cache"

export async function userOwnsProduct({
  userId,
  productId,
}: {
  userId: string
  productId: string
}) {
  "use cache"
  cacheTag(getPurchaseUserTag(userId))

  const existingPurchase = await db.query.PurchaseTable.findFirst({
    where: and(
      eq(PurchaseTable.productId, productId),
      eq(PurchaseTable.userId, userId),
      isNull(PurchaseTable.refundedAt)
    ),
  })

  return existingPurchase != null
}

export async function insertProduct(
  data: typeof ProductTable.$inferInsert & { courseIds: string[] }
) {
  const newProduct = await db.transaction(async trx => {
    const [newProduct] = await trx.insert(ProductTable).values(data).returning()
    if (newProduct == null) {
      trx.rollback()
      throw new Error("Failed to create product")
    }

    await trx.insert(CourseProductTable).values(
      data.courseIds.map(courseId => ({
        productId: newProduct.id,
        courseId,
      }))
    )

    return newProduct
  })

  revalidateProductCache(newProduct.id)

  return newProduct
}

export async function updateProduct(
  id: string,
  data: Partial<typeof ProductTable.$inferInsert> & { courseIds: string[] }
) {
  const updatedProduct = await db.transaction(async trx => {
    const [updatedProduct] = await trx
      .update(ProductTable)
      .set(data)
      .where(eq(ProductTable.id, id))
      .returning()
    if (updatedProduct == null) {
      trx.rollback()
      throw new Error("Failed to create product")
    }

    await trx
      .delete(CourseProductTable)
      .where(eq(CourseProductTable.productId, updatedProduct.id))

    await trx.insert(CourseProductTable).values(
      data.courseIds.map(courseId => ({
        productId: updatedProduct.id,
        courseId,
      }))
    )

    return updatedProduct
  })

  revalidateProductCache(updatedProduct.id)

  return updatedProduct
}

export async function deleteProduct(id: string) {
  const [deletedProduct] = await db
    .delete(ProductTable)
    .where(eq(ProductTable.id, id))
    .returning()
  if (deletedProduct == null) throw new Error("Failed to delete product")

  revalidateProductCache(deletedProduct.id)

  return deletedProduct
}