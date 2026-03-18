import { defineChain } from "viem";

export const tempo = defineChain({
  id: 4217,
  name: "Tempo",
  nativeCurrency: { name: "USD", symbol: "USD", decimals: 18 },
  rpcUrls: {
    default: { http: [process.env.TEMPO_RPC_URL ?? "https://rpc.tempo.xyz"] },
  },
  blockExplorers: {
    default: { name: "Tempo Explorer", url: "https://explore.tempo.xyz" },
  },
});

// USDC on Tempo mainnet
export const USDC = "0x20c000000000000000000000b9537d11c60e8b50" as const;
