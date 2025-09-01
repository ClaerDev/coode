import { PageHeader } from "@/components/PageHeader"
import { db } from "@/drizzle/db"
import { CourseTable } from "@/drizzle/schema"
import { getCourseIdTag } from "@/features/courses/db/cache/courses"
import { eq } from "drizzle-orm"
import { cacheTag } from "next/dist/server/use-cache/cache-tag"
import { notFound } from "next/navigation"

export default async function CoursePage({
  params,
}: {
  params: Promise<{ courseId: string }>
}) {
  const { courseId } = await params
  const course = await getCourse(courseId)

  if (course == null) return notFound()

  return (
    <div className="my-6 container">
      <PageHeader className="mb-2" title={course.name} />
      <p className="text-muted-foreground">{course.description}</p>
    </div>
  )
}

async function getCourse(id: string) {
  "use cache"
  cacheTag(getCourseIdTag(id))

  return db.query.CourseTable.findFirst({
    columns: { id: true, name: true, description: true },
    where: eq(CourseTable.id, id),
  })
}