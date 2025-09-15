import { getCurrentUser } from "@/app/services/clerk";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { db } from "@/drizzle/db";
import { PurchaseTable } from "@/drizzle/schema";
import {
  UserPurchaseTable,
  UserPurchaseTableSkeleton,
} from "@/features/purchase/components/UserPurchaseTable";
import { getPurchaseUserTag } from "@/features/purchase/db/cache";
import { desc, eq } from "drizzle-orm";
import { BookOpen } from "lucide-react";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import Link from "next/link";
import { Suspense } from "react";

export default function PurchasesPage() {
  return (
    <div className="container my-6">
      <PageHeader title="Purchase History" />
      <Suspense fallback={<UserPurchaseTableSkeleton />}>
        <SuspenseBoundary />
      </Suspense>
    </div>
  );
}

async function SuspenseBoundary() {
  const { userId, redirectToSignIn } = await getCurrentUser();
  if (userId == null) return redirectToSignIn();

  const purchases = await getPurchases(userId);

  if (purchases.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-muted-foreground/30 bg-muted/20 p-8 text-center w-full mx-auto">
        <BookOpen className="h-12 w-12 text-muted-foreground/70" />
        <p className="text-base md:text-lg font-medium text-muted-foreground">
          You don’t have any courses yet
        </p>
        <Button
          asChild
          size="lg"
          className="px-6 py-2 rounded-lg font-semibold shadow-sm bg-black text-white 
                   hover:bg-white hover:text-black hover:border hover:border-black 
                   transition-all duration-300"
        >
          <Link href="/">Browse Courses</Link>
        </Button>
      </div>
    );
  }

  return <UserPurchaseTable purchases={purchases} />;
}

async function getPurchases(userId: string) {
  "use cache";
  cacheTag(getPurchaseUserTag(userId));

  return db.query.PurchaseTable.findMany({
    columns: {
      id: true,
      pricePaidInCents: true,
      refundedAt: true,
      productDetails: true,
      createdAt: true,
    },
    where: eq(PurchaseTable.userId, userId),
    orderBy: desc(PurchaseTable.createdAt),
  });
}
