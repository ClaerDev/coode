import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import { eq, asc } from "drizzle-orm";
import { CourseSectionTable, CourseTable, LessonTable } from "@/drizzle/schema";
import { getCourseSectionCourseTag } from "@/features/courseSections/db/cache";
import { getLessonCourseTag } from "@/features/lessons/db/cache/lessons";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { getCourseIdTag } from "@/features/courses/db/cache/courses";
import { db } from "@/drizzle/db";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CourseForm } from "@/features/courses/components/CourseForm";
import { SectionFormDialog } from "@/features/courseSections/components/SectionFormDialog";
import { DialogTrigger } from "@/components/ui/dialog";
import { EyeClosedIcon, PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SortableSectionList } from "@/features/courseSections/components/SortableSectionList";
import { cn } from "@/lib/utils";
import { LessonFormDialog } from "@/features/lessons/components/LessonFormDialog";
import { SortableLessonList } from "@/features/lessons/components/SortableLessonList";

export default async function EditCoursePage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const course = await getCourse(courseId);

  if (course == null) return notFound();

  return (
    <div className="container my-6">
      <PageHeader title={course.name} className="pt-2"/>
      <Tabs defaultValue="lessons">
        <TabsList>
          <TabsTrigger value="lessons">Lessons</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
        </TabsList>
        <TabsContent value="lessons" className="flex flex-col gap-2">
          <Card>
            <CardHeader className="flex items-center flex-row justify-between pt-4">
              <CardTitle className="font-bold text-lg">Sections</CardTitle>
              <SectionFormDialog courseId={course.id}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="text-black font-semibold hover:bg-black hover:text-white transition-colors gap-1.5">
                    <PlusIcon /> New Section
                  </Button>
                </DialogTrigger>
              </SectionFormDialog>
            </CardHeader>
            <CardContent className="pb-4">
              <SortableSectionList
                courseId={courseId}
                sections={course.courseSections}
              />
            </CardContent>
          </Card>
          <hr className="my-2"></hr>
          {course.courseSections.map((section) => (
            <Card key={section.id}>
              <CardHeader className="flex items-center flex-row justify-between gap-4 pt-4">
                <CardTitle
                  className={cn(
                    "flex items-center gap-2",
                    section.status === "private" && "text-muted-foreground"
                  )}
                >
                  {section.status === "private" && <EyeClosedIcon />}{" "}
                  {section.name}
                </CardTitle>
                <LessonFormDialog defaultSectionId={section.id} sections={course.courseSections}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="text-black font-semibold hover:bg-black hover:text-white transition-colors gap-1.5">
                      <PlusIcon /> New Lesson
                    </Button>
                  </DialogTrigger>
                </LessonFormDialog>
              </CardHeader>
              <CardContent className="pb-4">
                <SortableLessonList
                  sections={course.courseSections}
                  lessons={section.lessons}
                />
              </CardContent>
            </Card>
          ))}
        </TabsContent>
        <TabsContent value="details">
          <Card className="p-5">
            <CardHeader>
              <CourseForm course={course} />
            </CardHeader>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

async function getCourse(id: string) {
  "use cache";
  cacheTag(
    getCourseIdTag(id),
    getCourseSectionCourseTag(id),
    getLessonCourseTag(id)
  );

  return db.query.CourseTable.findFirst({
    columns: { id: true, name: true, description: true },
    where: eq(CourseTable.id, id),
    with: {
      courseSections: {
        orderBy: asc(CourseSectionTable.order),
        columns: { id: true, status: true, name: true },
        with: {
          lessons: {
            orderBy: asc(LessonTable.order),
            columns: {
              id: true,
              name: true,
              status: true,
              description: true,
              youtubeVideoId: true,
              sectionId: true,
            },
          },
        },
      },
    },
  });
}
