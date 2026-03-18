// GET /api/markets?q=bitcoin&limit=10
// Search prediction markets across Kalshi
// Cost: 0.10 USDC per call

import { NextRequest } from "next/server";
import { searchMarkets } from "@/lib/kalshi";
import { createMppServer } from "@/lib/mpp";

const SERVICE_WALLET = process.env.SERVICE_WALLET_ADDRESS as `0x${string}`;

export async function GET(req: NextRequest) {
  const mpp = await createMppServer(SERVICE_WALLET);
  const payment = await mpp.charge({ amount: "0.10" })(req);
  if (payment.status === 402) return payment.challenge;

  const query = req.nextUrl.searchParams.get("q") ?? "";
  const limit = parseInt(req.nextUrl.searchParams.get("limit") ?? "10");

  if (!query) {
    return payment.withReceipt(
      Response.json({ error: "query param 'q' required" }, { status: 400 })
    );
  }

  const markets = await searchMarkets(query, limit);
  return payment.withReceipt(Response.json({ markets, count: markets.length }));
}
