// GET /api/kalshi-markets
// List trending/featured Kalshi markets (no query needed)
// Cost: 0.05 USDC per call

import { NextRequest } from "next/server";
import { createMppServer } from "@/lib/mpp";

const SERVICE_WALLET = process.env.SERVICE_WALLET_ADDRESS as `0x${string}`;
const BASE_URL = process.env.KALSHI_BASE_URL ?? "https://demo-api.kalshi.co/trade-api/v2";

export async function GET(req: NextRequest) {
  const mpp = await createMppServer(SERVICE_WALLET);
  const payment = await mpp.charge({ amount: "0.05" })(req);
  if (payment.status === 402) return payment.challenge;

  const category = req.nextUrl.searchParams.get("category") ?? "";
  const limit = req.nextUrl.searchParams.get("limit") ?? "20";

  // TODO day-of: add kalshiHeaders() auth
  const params = new URLSearchParams({ limit, status: "open" });
  if (category) params.set("series_ticker", category);

  const res = await fetch(`${BASE_URL}/markets?${params}`, {
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) {
    return payment.withReceipt(
      Response.json({ error: `Kalshi API error: ${res.status}` }, { status: 502 })
    );
  }

  const data = await res.json();
  return payment.withReceipt(Response.json({ markets: data.markets ?? [], count: data.markets?.length ?? 0 }));
}
