import { courseSectionStatuses } from "@/drizzle/schema";
import { z } from "zod";

export const sectionSchema =z.object({
    name: z.string().min(1, "required"),
    status: z.enum(courseSectionStatuses),
})