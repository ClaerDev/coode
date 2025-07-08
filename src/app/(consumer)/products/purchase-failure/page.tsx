import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function ProductPurchaseFailurePage() {
  return (
    <div className="container my-6">
      <div className="flex flex-col gap-4 items-start">
        <div className="text-3xl font-semibold">Purchase Failed</div>
        <div className="text-xl">
          There was a problem purchasing your product.
        </div>
        <Button asChild className="text-xl h-auto py-4 px-8 rounded-lg">
          <Link href="/">Try again</Link>
        </Button>
      </div>
    </div>
  )
}