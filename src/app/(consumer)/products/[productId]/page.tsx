import { getCurrentUser } from "@/app/services/clerk";
import { SkeletonButton } from "@/components/Skeleton";
import { Button } from "@/components/ui/button";
import { db } from "@/drizzle/db";
import {
  CourseSectionTable,
  LessonTable,
  ProductTable,
} from "@/drizzle/schema";
import { getCourseIdTag } from "@/features/courses/db/cache/courses";
import { getCourseSectionCourseTag } from "@/features/courseSections/db/cache";
import { wherePublicCourseSections } from "@/features/courseSections/permissions/sections";
import { getLessonCourseTag } from "@/features/lessons/db/cache/lessons";
import { wherePublicLessons } from "@/features/lessons/permissions/lessons";
import { getProductIdTag } from "@/features/products/db/cache";
import { userOwnsProduct } from "@/features/products/db/products";
import { wherePublicProducts } from "@/features/products/permissions/products";
import { formatPlural, formatPrice } from "@/lib/formatters";
import { sumArray } from "@/lib/sumArray";
import { getUserCoupon } from "@/lib/userCountryHeader";
import { and, asc, eq } from "drizzle-orm";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Accordion } from "@radix-ui/react-accordion";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { VideoIcon } from "lucide-react";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const { productId } = await params;
  const product = await getPublicProduct(productId);

  if (product == null) {
    return notFound();
  }
  const courseCount = product.courses.length;
  const lessonCount = sumArray(product.courses, (course) =>
    sumArray(course.courseSections, (section) => section.lessons.length)
  );

  return (
    <div className="container my-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center rounded-2xl border bg-card/60 backdrop-blur supports-[backdrop-filter]:bg-card/50 p-6 md:p-8 shadow-sm">
        <div className="flex gap-8 lg:gap-10 items-start">
          <div className="flex gap-6 flex-col items-start w-full">
            <div className="flex flex-col gap-3">
              <Suspense
                fallback={
                  <div className="text-2xl font-semibold tracking-tight">
                    {formatPrice(product.priceInDollars)}
                  </div>
                }
              >
                <Price price={product.priceInDollars} />
              </Suspense>

              <h1 className="font-semibold text-3xl md:text-4xl leading-tight tracking-tight">
                {product.name}
              </h1>

              <div className="text-sm md:text-base text-muted-foreground flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center rounded-full border px-2.5 py-1 text-xs md:text-sm">
                  {formatPlural(courseCount, {
                    singular: "course",
                    plural: "courses",
                  })}
                </span>
                <span className="opacity-50">•</span>
                <span className="inline-flex items-center rounded-full border px-2.5 py-1 text-xs md:text-sm">
                  {formatPlural(lessonCount, {
                    singular: "lesson",
                    plural: "lessons",
                  })}
                </span>
              </div>

              <div className="text-base md:text-lg text-muted-foreground/90 leading-relaxed">
                {product.description}
              </div>

              <Suspense fallback={<SkeletonButton className="h-11 w-40" />}>
                <PurchaseButton productId={product.id} />
              </Suspense>
            </div>
          </div>
        </div>

        <div className="relative aspect-video w-full max-w-xl mx-auto lg:mx-0">
          <Image
            src={product.imageUrl}
            fill
            alt={product.name}
            className="object-cover rounded-xl shadow-md ring-1 ring-black/5"
            sizes="(max-width: 1024px) 100vw, 560px"
          />
          <div className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-t from-black/0 via-black/0 to-black/5" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6 md:gap-8 mt-8 items-start">
        {product.courses.map((course) => (
          <Card
            key={course.id}
            className="rounded-xl border bg-card/60 backdrop-blur supports-[backdrop-filter]:bg-card/50 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 pt-5"
          >
            <CardHeader className="pb-3">
              <CardTitle className="text-lg md:text-xl tracking-tight">
                {course.name}
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                {formatPlural(course.courseSections.length, {
                  plural: "sections",
                  singular: "section",
                })}{" "}
                •{" "}
                {formatPlural(
                  sumArray(course.courseSections, (s) => s.lessons.length),
                  { plural: "lessons", singular: "lesson" }
                )}
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-0">
              <Accordion type="multiple" className="divide-y">
                {course.courseSections.map((section) => (
                  <AccordionItem
                    key={section.id}
                    value={section.id}
                    className="border-none"
                  >
                    <AccordionTrigger className="flex gap-3 py-3 hover:no-underline">
                      <div className="flex flex-col flex-grow text-left">
                        <span className="text-base md:text-lg font-medium leading-snug">
                          {section.name}
                        </span>
                        <span className="text-xs md:text-sm text-muted-foreground">
                          {formatPlural(section.lessons.length, {
                            plural: "lessons",
                            singular: "lesson",
                          })}
                        </span>
                      </div>
                    </AccordionTrigger>

                    <AccordionContent className="flex flex-col gap-2 pb-4">
                      {section.lessons.map((lesson) => (
                        <div
                          key={lesson.id}
                          className="flex items-center gap-2 text-sm md:text-base px-1"
                        >
                          <VideoIcon className="size-4 shrink-0 opacity-80" />
                          {lesson.status === "preview" ? (
                            <Link
                              href={`/courses/${course.id}/lessons/${lesson.id}`}
                              className="underline underline-offset-4 text-primary hover:text-primary/80 transition-colors"
                            >
                              {lesson.name}
                            </Link>
                          ) : (
                            <span className="text-muted-foreground">
                              {lesson.name}
                            </span>
                          )}
                        </div>
                      ))}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

async function PurchaseButton({ productId }: { productId: string }) {
  const { userId } = await getCurrentUser();
  const alreadyOwnsProduct =
    userId != null && (await userOwnsProduct({ userId, productId }));
  if (alreadyOwnsProduct) {
    return (
      <div className="text-base md:text-lg text-emerald-600 dark:text-emerald-400 font-medium">
        You already own this product
      </div>
    );
  } else {
    return (
      <Button
        className="text-base md:text-lg h-11 md:h-12 px-6 md:px-8 rounded-lg shadow-sm hover:shadow transition-all hover:-translate-y-0.5"
        asChild
      >
        <Link href={`/products/${productId}/purchase`}>Get Now</Link>
      </Button>
    );
  }
}

async function Price({ price }: { price: number }) {
  const coupon = await getUserCoupon();
  if (price === 0 || coupon == null) {
    return (
      <div className="text-2xl md:text-3xl font-semibold tracking-tight">
        {formatPrice(price)}
      </div>
    );
  }

  return (
    <div className="flex items-baseline gap-2">
      <div className="line-through text-sm opacity-60">
        {formatPrice(price)}
      </div>
      <div className="text-2xl md:text-3xl font-semibold tracking-tight">
        {formatPrice(price * (1 - coupon.discountPercentage))}
      </div>
      <span className="ml-1 inline-flex items-center rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-500/20 px-2 py-0.5 text-xs font-medium">
        Coupon applied
      </span>
    </div>
  );
}

async function getPublicProduct(id: string) {
  "use cache";
  cacheTag(getProductIdTag(id));

  const product = await db.query.ProductTable.findFirst({
    columns: {
      id: true,
      name: true,
      description: true,
      priceInDollars: true,
      imageUrl: true,
    },
    where: and(eq(ProductTable.id, id), wherePublicProducts),
    with: {
      courseProducts: {
        columns: {},
        with: {
          course: {
            columns: {
              id: true,
              name: true,
            },
            with: {
              courseSections: {
                columns: {
                  id: true,
                  name: true,
                },
                where: wherePublicCourseSections,
                orderBy: asc(CourseSectionTable.order),
                with: {
                  lessons: {
                    columns: {
                      id: true,
                      name: true,
                      status: true,
                    },
                    where: wherePublicLessons,
                    orderBy: asc(LessonTable.order),
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  if (product == null) return product;
  cacheTag(
    ...product.courseProducts.flatMap((cp) => [
      getLessonCourseTag(cp.course.id),
      getCourseSectionCourseTag(cp.course.id),
      getCourseIdTag(cp.course.id),
    ])
  );

  const { courseProducts, ...other } = product;
  return {
    ...other,
    courses: courseProducts.map((cp) => cp.course),
  };
}
