import { getCurrentUser } from "@/app/services/clerk";
import { PageHeader } from "@/components/PageHeader";
import {
  SkeletonArray,
  SkeletonButton,
  SkeletonText,
} from "@/components/Skeleton";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { db } from "@/drizzle/db";
import {
  CourseSectionTable,
  CourseTable,
  LessonTable,
  UserCourseAccessTable,
  UserLessonCompleteTable,
} from "@/drizzle/schema";
import { getCourseIdTag } from "@/features/courses/db/cache/courses";
import { getUserCourseAccessUserTag } from "@/features/courses/db/cache/userCourseAccess";
import { getCourseSectionCourseTag } from "@/features/courseSections/db/cache";
import { wherePublicCourseSections } from "@/features/courseSections/permissions/sections";
import { getLessonCourseTag } from "@/features/lessons/db/cache/lessons";
import { getUserLessonCompleteUserTag } from "@/features/lessons/db/cache/userLessonComplete";
import { wherePublicLessons } from "@/features/lessons/permissions/lessons";
import { formatPlural } from "@/lib/formatters";
import { and, countDistinct, eq } from "drizzle-orm";
import { BookOpen } from "lucide-react";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import Link from "next/link";
import { Suspense } from "react";

export default function CoursesPage() {
  return (
    <div className="container my-6">
      <PageHeader title="My Courses" />
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <Suspense
          fallback={
            <SkeletonArray amount={3}>
              <SkeletonCourseCard />
            </SkeletonArray>
          }
        >
          <CourseGrid />
        </Suspense>
      </div>
    </div>
  );
}

async function CourseGrid() {
  const { userId, redirectToSignIn } = await getCurrentUser();
  if (userId == null) return redirectToSignIn();

  const courses = await getUserCourses(userId);

  if (courses.length === 0) {
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

  return courses.map((course) => (
    <Card key={course.id} className="overflow-hidden flex flex-col pt-8">
      <CardHeader>
        <CardTitle>{course.name}</CardTitle>
        <CardDescription>
          {formatPlural(course.sectionsCount, {
            plural: "sections",
            singular: "section",
          })}{" "}
          •{" "}
          {formatPlural(course.lessonsCount, {
            plural: "lessons",
            singular: "lesson",
          })}
        </CardDescription>
      </CardHeader>
      <CardContent className="line-clamp-3" title={course.description}>
        {course.description}
      </CardContent>
      <div className="flex-grow" />
      <CardFooter>
        <Button
          asChild
          className="text-white hover:bg-white hover:border-2 hover:text-black transition-colors"
        >
          <Link href={`/courses/${course.id}`}>View Course</Link>
        </Button>
      </CardFooter>
      <div
        className="bg-black h-2 -mt-2"
        style={{
          width: `${(course.lessonsComplete / course.lessonsCount) * 100}%`,
        }}
      />
    </Card>
  ));
}

function SkeletonCourseCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <SkeletonText className="w-3/4" />
        </CardTitle>
        <CardDescription>
          <SkeletonText className="w-1/2" />
        </CardDescription>
      </CardHeader>
      <CardContent>
        <SkeletonText rows={3} />
      </CardContent>
      <CardFooter>
        <SkeletonButton />
      </CardFooter>
    </Card>
  );
}

async function getUserCourses(userId: string) {
  "use cache";
  cacheTag(
    getUserCourseAccessUserTag(userId),
    getUserLessonCompleteUserTag(userId)
  );

  const courses = await db
    .select({
      id: CourseTable.id,
      name: CourseTable.name,
      description: CourseTable.description,
      sectionsCount: countDistinct(CourseSectionTable.id),
      lessonsCount: countDistinct(LessonTable.id),
      lessonsComplete: countDistinct(UserLessonCompleteTable.lessonId),
    })
    .from(CourseTable)
    .innerJoin(
      UserCourseAccessTable,
      and(
        eq(UserCourseAccessTable.courseId, CourseTable.id),
        eq(UserCourseAccessTable.userId, userId)
      )
    )
    .leftJoin(
      CourseSectionTable,
      and(
        eq(CourseSectionTable.courseId, CourseTable.id),
        wherePublicCourseSections
      )
    )
    .leftJoin(
      LessonTable,
      and(eq(LessonTable.sectionId, CourseSectionTable.id), wherePublicLessons)
    )
    .leftJoin(
      UserLessonCompleteTable,
      and(
        eq(UserLessonCompleteTable.lessonId, LessonTable.id),
        eq(UserLessonCompleteTable.userId, userId)
      )
    )
    .orderBy(CourseTable.name)
    .groupBy(CourseTable.id);

  courses.forEach((course) => {
    cacheTag(
      getCourseIdTag(course.id),
      getCourseSectionCourseTag(course.id),
      getLessonCourseTag(course.id)
    );
  });

  return courses;
}
