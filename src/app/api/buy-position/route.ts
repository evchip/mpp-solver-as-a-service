// POST /api/buy-position
// Solver: user pays on Tempo via MPP, solver buys CTF on Polymarket and transfers to user

import { NextRequest } from "next/server";
import { buyShares, transferCTF, getCTFBalance } from "@/lib/polymarket";
import { createMppServer } from "@/lib/mpp";

const SERVICE_WALLET = process.env.SERVICE_WALLET_ADDRESS as `0x${string}`;

export interface BuyPositionRequest {
  token_id: string;
  amount_usd: number;
  recipient_polygon: string;
}

export async function POST(req: NextRequest) {
  const mpp = await createMppServer(SERVICE_WALLET);
  const payment = await mpp.charge({ amount: "0.50" })(req);
  if (payment.status === 402) return payment.challenge;

  const body: BuyPositionRequest = await req.json();
  const { token_id, amount_usd, recipient_polygon } = body;

  if (!token_id || !amount_usd || !recipient_polygon) {
    return payment.withReceipt(
      Response.json({ error: "token_id, amount_usd, recipient_polygon required" }, { status: 400 })
    );
  }

  // Step 1: Buy shares on Polymarket CLOB
  let fill;
  try {
    fill = await buyShares(token_id, amount_usd);
  } catch (err: any) {
    return payment.withReceipt(
      Response.json({ error: `Order failed: ${err.message}` }, { status: 502 })
    );
  }

  // Step 2: Wait briefly for CLOB settlement, then check balance
  await new Promise((r) => setTimeout(r, 3000));
  const balance = await getCTFBalance(token_id);

  if (balance === 0n) {
    return payment.withReceipt(
      Response.json({ error: "Order matched but no shares settled yet", fill }, { status: 502 })
    );
  }

  // Step 3: Transfer CTF tokens to user's Polygon address
  const txHash = await transferCTF(
    token_id,
    balance,
    recipient_polygon as `0x${string}`
  );

  return payment.withReceipt(Response.json({
    status: "filled_and_transferred",
    fill: {
      orderId: fill.orderId,
      avgPrice: fill.avgPrice,
      shares: balance.toString(),
    },
    transfer: {
      polygon_tx: txHash,
      polygon_explorer: `https://polygonscan.com/tx/${txHash}`,
      recipient: recipient_polygon,
      token_id,
      ctf_contract: "0x4D97DCd97eC945f40cF65F87097ACe5EA0476045",
    },
  }));
}
