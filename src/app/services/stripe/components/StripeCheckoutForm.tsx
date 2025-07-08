"use client"

import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout,
} from "@stripe/react-stripe-js"
import { stripeClientPromise } from "../stripeClient"
import { getClientSessionSecret } from "../actions/stripe"

export function StripeCheckoutForm({
  product,
  user,
}: {
  product: {
    priceInDollars: number
    name: string
    id: string
    imageUrl: string
    description: string
  }
  user: {
    email: string
    id: string
  }
}) {
  return (
    <EmbeddedCheckoutProvider
      stripe={stripeClientPromise}
      options={{
        fetchClientSecret: getClientSessionSecret.bind(null, product, user),
      }}
    >
      <EmbeddedCheckout />
    </EmbeddedCheckoutProvider>
  )
}