// MPP server setup for our service
// Docs: https://mpp.dev | SDK: https://github.com/wevm/mppx

import Stripe from "stripe"
import { USDC } from "./tempo"
import { MppCard } from "mpp-card/server"

export function createMppServer(recipientAddress: `0x${string}`) {
  return import("mppx/server").then(({ Mppx, tempo, stripe }) => {
    const stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY!)
    return Mppx.create({
      methods: [
        tempo.charge({ currency: USDC, recipient: recipientAddress }),
        stripe.charge({
          currency: "usd",
          decimals: 2,
          client: stripeClient,
          // networkId: process.env.STRIPE_NETWORK_ID!,
          networkId: "internal",
          paymentMethodTypes: ["card"],
        }),
      ],
    })
  })
}

// export function createMppServer() {
//   return MppCard.create({
//     acceptedNetworks: ["visa"],
//     merchantName: "Demo",
//     privateKey: process.env.MPP_CARD_PRIVATE_KEY,
//     secretKey: process.env.MPP_SECRET_KEY,
//     gateway: {
//       async charge({ token, amount, currency, idempotencyKey }) {
//         // Call your payment processor here
//         return { reference: "demo_" + Date.now(), status: "success" }
//         // return { reference: 'txn_123', status: 'success' }
//       },
//     },
//   })
// }
