import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { db } from "@/drizzle/db";
import {
  CourseSectionTable,
  CourseTable,
  LessonTable,
  ProductTable,
  PurchaseTable,
  UserCourseAccessTable,
} from "@/drizzle/schema";
import { getCourseGlobalTag } from "@/features/courses/db/cache/courses";
import { getUserCourseAccessGlobalTag } from "@/features/courses/db/cache/userCourseAccess";
import { getCourseSectionGlobalTag } from "@/features/courseSections/db/cache";
import { getLessonGlobalTag } from "@/features/lessons/db/cache/lessons";
import { getProductGlobalTag } from "@/features/products/db/cache";
import { getPurchaseGlobalTag } from "@/features/purchase/db/cache";
import { formatNumber, formatPrice } from "@/lib/formatters";
import { count, countDistinct, isNotNull, sql, sum } from "drizzle-orm";
import {
  Badge,
  BookOpen,
  Cable,
  Layers,
  ListChecks,
  Package,
  PackageOpen,
  RotateCcw,
  ShoppingCart,
  Users,
  Wallet,
} from "lucide-react";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import { ReactNode } from "react";

export default async function AdminPage() {
  const [
    {
      averageNetPurchasesPerCustomer,
      netPurchases,
      netSales,
      refundedPurchases,
      totalRefunds,
    },
    totalStudents,
    totalProducts,
    totalCourses,
    totalCourseSections,
    totalLessons,
  ] = await Promise.all([
    getPurchaseDetails(),
    getTotalStudents(),
    getTotalProducts(),
    getTotalCourses(),
    getTotalCourseSections(),
    getTotalLessons(),
  ]);

  return (
    <div className="container mx-auto px-4 my-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Admin Overview
        </h1>
        <p className="text-sm text-slate-500">
          Key sales and learning activity across your LMS.
        </p>
      </div>

      {/* Primary KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5">
        <StatCard
          title="Net Sales"
          accent="from-emerald-400 to-emerald-200"
          icon={<Wallet className="h-5 w-5" />}
          delta={6.4} // optional—replace with real delta if you have one
        >
          {formatPrice(netSales)}
        </StatCard>

        <StatCard
          title="Refunded Sales"
          accent="from-rose-400 to-rose-200"
          icon={<RotateCcw className="h-5 w-5" />}
          delta={-1.2}
        >
          {formatPrice(totalRefunds)}
        </StatCard>

        <StatCard
          title="Un-Refunded Purchases"
          accent="from-indigo-400 to-indigo-200"
          icon={<ShoppingCart className="h-5 w-5" />}
          delta={3.1}
        >
          {formatNumber(netPurchases)}
        </StatCard>

        <StatCard
          title="Refunded Purchases"
          accent="from-amber-400 to-amber-200"
          icon={<PackageOpen className="h-5 w-5" />}
          delta={-0.8}
        >
          {formatNumber(refundedPurchases)}
        </StatCard>

        <StatCard
          title="Purchases / User"
          accent="from-violet-400 to-violet-200"
          icon={<Layers className="h-5 w-5" />}
          delta={1.9}
        >
          {formatNumber(averageNetPurchasesPerCustomer, {
            maximumFractionDigits: 2,
          })}
        </StatCard>
        <StatCard
          title="Students"
          accent="from-cyan-400 to-cyan-200"
          icon={<Users className="h-5 w-5" />}
          delta={5.2}
        >
          {formatNumber(totalStudents)}
        </StatCard>
        <StatCard
          title="Products"
          accent="from-sky-400 to-sky-200"
          icon={<Package className="h-5 w-5" />}
          delta={0.6}
        >
          {formatNumber(totalProducts)}
        </StatCard>
        <StatCard
          title="Courses"
          accent="from-fuchsia-400 to-fuchsia-200"
          icon={<BookOpen className="h-5 w-5" />}
          delta={2.3}
        >
          {formatNumber(totalCourses)}
        </StatCard>
        <StatCard
          title="Lessons"
          accent="from-teal-400 to-teal-200"
          icon={<ListChecks className="h-5 w-5" />}
          delta={4.1}
        >
          {formatNumber(totalLessons)}
        </StatCard>
        <StatCard
          title="Course Sections"
          accent="from-sky-400 to-sky-200"
          icon={<Cable className="h-5 w-5" />}
          delta={4.1}
        >
          {formatNumber(totalCourseSections)}
        </StatCard>
      </div>
    </div>
  );
}

function StatCard({
  title,
  children,
  icon,
  accent = "from-slate-200 to-slate-100",
  delta,
}: {
  title: string;
  children: ReactNode;
  icon?: ReactNode;
  accent?: string;
  delta?: number;
}) {
  return (
    <Card className="relative overflow-hidden rounded-2xl border border-slate-200/60 shadow-sm py-5">
      {/* Soft gradient wash */}
      <div
        className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${accent} opacity-[0.12]`}
      />
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardDescription className="text-[13px] text-slate-600">
              {title}
            </CardDescription>
            <CardTitle className="font-bold text-2xl tracking-tight text-slate-900">
              {children}
            </CardTitle>
          </div>
          <div className="shrink-0 text-slate-400">{icon}</div>
        </div>
      </CardHeader>

      {delta !== undefined && (
        <CardContent className="pt-0">
          <Badge
            className={`rounded-full px-2 py-1 text-xs ${
              delta >= 0
                ? "bg-emerald-500/15 text-emerald-600"
                : "bg-rose-500/15 text-rose-600"
            }`}
          >
            {delta >= 0 ? "▲" : "▼"} {Math.abs(delta).toFixed(1)}%
          </Badge>
        </CardContent>
      )}
    </Card>
  );
}

async function getPurchaseDetails() {
  "use cache";
  cacheTag(getPurchaseGlobalTag());

  const data = await db
    .select({
      totalSales: sql<number>`COALESCE(${sum(
        PurchaseTable.pricePaidInCents
      )}, 0)`.mapWith(Number),
      totalPurchases: count(PurchaseTable.id),
      totalUsers: countDistinct(PurchaseTable.userId),
      isRefund: isNotNull(PurchaseTable.refundedAt),
    })
    .from(PurchaseTable)
    .groupBy((table) => table.isRefund);

  const [refundData] = data.filter((row) => row.isRefund);
  const [salesData] = data.filter((row) => !row.isRefund);

  const netSales = (salesData?.totalSales ?? 0) / 100;
  const totalRefunds = (refundData?.totalSales ?? 0) / 100;
  const netPurchases = salesData?.totalPurchases ?? 0;
  const refundedPurchases = refundData?.totalPurchases ?? 0;
  const averageNetPurchasesPerCustomer =
    salesData?.totalUsers != null && salesData.totalUsers > 0
      ? netPurchases / salesData.totalUsers
      : 0;

  return {
    netSales,
    totalRefunds,
    netPurchases,
    refundedPurchases,
    averageNetPurchasesPerCustomer,
  };
}

async function getTotalStudents() {
  "use cache";
  cacheTag(getUserCourseAccessGlobalTag());

  const [data] = await db
    .select({ totalStudents: countDistinct(UserCourseAccessTable.userId) })
    .from(UserCourseAccessTable);

  if (data == null) return 0;
  return data.totalStudents;
}

async function getTotalCourses() {
  "use cache";
  cacheTag(getCourseGlobalTag());

  const [data] = await db
    .select({ totalCourses: count(CourseTable.id) })
    .from(CourseTable);

  if (data == null) return 0;
  return data.totalCourses;
}

async function getTotalProducts() {
  "use cache";
  cacheTag(getProductGlobalTag());

  const [data] = await db
    .select({ totalProducts: count(ProductTable.id) })
    .from(ProductTable);
  if (data == null) return 0;
  return data.totalProducts;
}

async function getTotalLessons() {
  "use cache";
  cacheTag(getLessonGlobalTag());

  const [data] = await db
    .select({ totalLessons: count(LessonTable.id) })
    .from(LessonTable);
  if (data == null) return 0;
  return data.totalLessons;
}

async function getTotalCourseSections() {
  "use cache";
  cacheTag(getCourseSectionGlobalTag());

  const [data] = await db
    .select({ totalCourseSections: count(CourseSectionTable.id) })
    .from(CourseSectionTable);
  if (data == null) return 0;
  return data.totalCourseSections;
}
