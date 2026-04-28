// MPP server setup for our service
// Docs: https://mpp.dev | SDK: https://github.com/wevm/mppx

import Stripe from "stripe"
import { USDC } from "./tempo"

export function createMppServer(recipientAddress: `0x${string}`) {
  return import("mppx/server").then(({ Mppx, tempo, stripe }) => {
    const stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY!)
    return Mppx.create({
      methods: [
        tempo({ currency: USDC, recipient: recipientAddress }),
        stripe.charge({
          client: stripeClient,
          networkId: process.env.STRIPE_NETWORK_ID!,
          paymentMethodTypes: ["card"],
        }),
      ],
    })
  })
}
