ALTER TABLE "lessons" RENAME COLUMN "courseId" TO "sectionId";--> statement-breakpoint
ALTER TABLE "lessons" DROP CONSTRAINT "lessons_courseId_course_sections_id_fk";
--> statement-breakpoint
ALTER TABLE "lessons" ADD CONSTRAINT "lessons_sectionId_course_sections_id_fk" FOREIGN KEY ("sectionId") REFERENCES "public"."course_sections"("id") ON DELETE cascade ON UPDATE no action;