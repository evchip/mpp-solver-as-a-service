// GET /api/market?ticker=KXBTC-26MAR28-90000
// Get a single market's details: odds, volume, close time
// Cost: 0.05 USDC per call

import { NextRequest } from "next/server";
import { getMarket } from "@/lib/kalshi";
import { createMppServer } from "@/lib/mpp";

const SERVICE_WALLET = process.env.SERVICE_WALLET_ADDRESS as `0x${string}`;

export async function GET(req: NextRequest) {
  const mpp = await createMppServer(SERVICE_WALLET);
  const payment = await mpp.charge({ amount: "0.05" })(req);
  if (payment.status === 402) return payment.challenge;

  const ticker = req.nextUrl.searchParams.get("ticker") ?? "";
  if (!ticker) {
    return payment.withReceipt(
      Response.json({ error: "query param 'ticker' required" }, { status: 400 })
    );
  }

  const market = await getMarket(ticker);
  return payment.withReceipt(Response.json({ market }));
}
