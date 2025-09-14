import { getCurrentUser } from "@/app/services/clerk"
import { stripeServerClient } from "@/app/services/stripe/stripeServer"
import { isDummyStripeSession, createMockStripeSession } from "@/lib/stripeUtils"
import { LoadingSpinner } from "@/components/LoadingSpinner"
import { PageHeader } from "@/components/PageHeader"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { db } from "@/drizzle/db"
import { PurchaseTable } from "@/drizzle/schema"
import { getPurchaseIdTag } from "@/features/purchase/db/cache"
import { formatDate, formatPrice } from "@/lib/formatters"
import { cn } from "@/lib/utils"
import { and, eq } from "drizzle-orm"
import { cacheTag } from "next/dist/server/use-cache/cache-tag"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Fragment, Suspense } from "react"
import Stripe from "stripe"

export default async function PurchasePage({
  params,
}: {
  params: Promise<{ purchaseId: string }>
}) {
  const { purchaseId } = await params

  return (
    <div className="container my-6">
      <Suspense fallback={<LoadingSpinner className="size-36 mx-auto" />}>
        <SuspenseBoundary purchaseId={purchaseId} />
      </Suspense>
    </div>
  )
}

async function SuspenseBoundary({ purchaseId }: { purchaseId: string }) {
  const { userId, redirectToSignIn, user } = await getCurrentUser({
    allData: true,
  })
  if (userId == null || user == null) return redirectToSignIn()

  const purchase = await getPurchase({ userId, id: purchaseId })

  if (purchase == null) return notFound()

  const { receiptUrl, pricingRows } = await getStripeDetails(
    purchase.stripeSessionId,
    purchase.pricePaidInCents,
    purchase.refundedAt != null
  )

  return (
    <>
      <PageHeader title={purchase.productDetails.name}>
        {receiptUrl && (
          <Button variant="outline" asChild>
            <Link target="_blank" href={receiptUrl}>
              View Receipt
            </Link>
          </Button>
        )}
      </PageHeader>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex justify-between items-start gap-4">
            <div className="flex flex-col gap-1">
              <CardTitle>Receipt</CardTitle>
              <CardDescription>ID: {purchaseId}</CardDescription>
            </div>
            <Badge className="text-base">
              {purchase.refundedAt ? "Refunded" : "Paid"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pb-4 grid grid-cols-2 gap-8 border-t pt-4">
          <div>
            <label className="text-sm text-muted-foreground">Date</label>
            <div>{formatDate(purchase.createdAt)}</div>
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Product</label>
            <div>{purchase.productDetails.name}</div>
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Customer</label>
            <div>{user.name}</div>
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Seller</label>
            <div>Web Dev Simplified</div>
          </div>
        </CardContent>
        <CardFooter className="grid grid-cols-2 gap-y-4 gap-x-8 border-t pt-4">
          {pricingRows.map(({ label, amountInDollars, isBold }) => (
            <Fragment key={label}>
              <div className={cn(isBold && "font-bold")}>{label}</div>
              <div className={cn("justify-self-end", isBold && "font-bold")}>
                {formatPrice(amountInDollars, { showZeroAsNumber: true })}
              </div>
            </Fragment>
          ))}
        </CardFooter>
      </Card>
    </>
  )
}

async function getPurchase({ userId, id }: { userId: string; id: string }) {
  "use cache"
  cacheTag(getPurchaseIdTag(id))

  return db.query.PurchaseTable.findFirst({
    columns: {
      pricePaidInCents: true,
      refundedAt: true,
      productDetails: true,
      createdAt: true,
      stripeSessionId: true,
    },
    where: and(eq(PurchaseTable.id, id), eq(PurchaseTable.userId, userId)),
  })
}

async function getStripeDetails(
  stripeSessionId: string,
  pricePaidInCents: number,
  isRefunded: boolean
) {
  // Handle dummy data from seeding
  if (isDummyStripeSession(stripeSessionId)) {
    console.warn(`Using mock Stripe data for dummy session: ${stripeSessionId}`);
    const mockSession = createMockStripeSession(stripeSessionId, pricePaidInCents);
    
    // Calculate refund amount for dummy data
    const refundAmount = isRefunded ? pricePaidInCents : undefined;
    
    return {
      receiptUrl: mockSession.payment_intent.latest_charge.receipt_url,
      pricingRows: getPricingRows(mockSession.total_details, {
        total: pricePaidInCents - (refundAmount ?? 0),
        subtotal: pricePaidInCents,
        refund: refundAmount,
      }),
    };
  }

  const { payment_intent, total_details, amount_total, amount_subtotal } =
    await stripeServerClient.checkout.sessions.retrieve(stripeSessionId, {
      expand: [
        "payment_intent.latest_charge",
        "total_details.breakdown.discounts",
      ],
    })

  const refundAmount =
    typeof payment_intent !== "string" &&
    typeof payment_intent?.latest_charge !== "string"
      ? payment_intent?.latest_charge?.amount_refunded
      : isRefunded
      ? pricePaidInCents
      : undefined

  return {
    receiptUrl: getReceiptUrl(payment_intent),
    pricingRows: getPricingRows(total_details, {
      total: (amount_total ?? pricePaidInCents) - (refundAmount ?? 0),
      subtotal: amount_subtotal ?? pricePaidInCents,
      refund: refundAmount,
    }),
  }
}

function getReceiptUrl(paymentIntent: Stripe.PaymentIntent | string | null) {
  if (
    typeof paymentIntent === "string" ||
    typeof paymentIntent?.latest_charge === "string"
  ) {
    return
  }

  return paymentIntent?.latest_charge?.receipt_url
}

function getPricingRows(
  totalDetails: Stripe.Checkout.Session.TotalDetails | null,
  {
    total,
    subtotal,
    refund,
  }: { total: number; subtotal: number; refund?: number }
) {
  const pricingRows: {
    label: string
    amountInDollars: number
    isBold?: boolean
  }[] = []

  if (totalDetails?.breakdown != null) {
    totalDetails.breakdown.discounts.forEach(discount => {
      pricingRows.push({
        label: `${discount.discount.coupon.name} (${discount.discount.coupon.percent_off}% off)`,
        amountInDollars: discount.amount / -100,
      })
    })
  }

  if (refund) {
    pricingRows.push({
      label: "Refund",
      amountInDollars: refund / -100,
    })
  }

  if (pricingRows.length === 0) {
    return [{ label: "Total", amountInDollars: total / 100, isBold: true }]
  }

  return [
    {
      label: "Subtotal",
      amountInDollars: subtotal / 100,
    },
    ...pricingRows,
    {
      label: "Total",
      amountInDollars: total / 100,
      isBold: true,
    },
  ]
}