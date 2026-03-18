// MPP server setup for our service
// Docs: https://mpp.dev | SDK: https://github.com/wevm/mppx

import { USDC } from "./tempo";

export function createMppServer(recipientAddress: `0x${string}`) {
  return import("mppx/server").then(({ Mppx, tempo }) =>
    Mppx.create({
      methods: [
        tempo({
          currency: USDC,
          recipient: recipientAddress,
        }),
      ],
    })
  );
}
