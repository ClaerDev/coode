import { getGlobalTag, getUserTag } from "@/lib/dataCache"
import { revalidateTag } from "next/cache"

export function getCourseGlobalTag(){
    return getGlobalTag("courses")
}

export function getCourseIdTag(id: string){
    return getUserTag("courses", id)
}

export function revalidateCourseCache(id: string){
    revalidateTag(getCourseGlobalTag())
    revalidateTag(getCourseIdTag(id))
}