// POST /api/buy-position
// The solver endpoint: user pays on Tempo, solver buys a Polymarket position and transfers CTF
//
// Flow:
// 1. Agent/user calls this endpoint via MPP (pays USDC on Tempo)
// 2. Solver places order on Polymarket CLOB (Polygon)
// 3. Solver transfers CTF tokens to user's Polygon address
// 4. Returns tx hash as proof of delivery
//
// Trust model (hackathon): solver is our server, trusted.
// Future: enshrined escrow precompile on Tempo makes this trustless.

import { NextRequest } from "next/server";
import { getPrice, placeSolverOrder } from "@/lib/polymarket";
import { createMppServer } from "@/lib/mpp";

const SERVICE_WALLET = process.env.SERVICE_WALLET_ADDRESS as `0x${string}`;

export interface BuyPositionRequest {
  token_id: string;          // Polymarket outcome token ID
  side: "YES" | "NO";       // which outcome to buy
  amount_usd: number;       // how much to spend (in USD)
  recipient_polygon: string; // user's Polygon address to receive CTF tokens
}

export async function POST(req: NextRequest) {
  const mpp = await createMppServer(SERVICE_WALLET);

  // Charge the service fee (separate from the position cost)
  // The position cost itself is fronted by the solver on Polygon
  const payment = await mpp.charge({ amount: "0.50" })(req);
  if (payment.status === 402) return payment.challenge;

  const body: BuyPositionRequest = await req.json();
  const { token_id, side, amount_usd, recipient_polygon } = body;

  if (!token_id || !side || !amount_usd || !recipient_polygon) {
    return payment.withReceipt(
      Response.json({ error: "token_id, side, amount_usd, recipient_polygon required" }, { status: 400 })
    );
  }

  // Step 1: Get current price from CLOB
  const price = await getPrice(token_id);
  const shares = Math.floor(amount_usd / parseFloat(price));

  // Step 2: Place order on Polymarket via solver wallet
  const order = await placeSolverOrder({
    tokenId: token_id,
    side: side === "YES" ? "BUY" : "SELL",
    size: shares,
    price: parseFloat(price),
  });

  // Step 3: Transfer CTF tokens to user's Polygon address
  // TODO day-of: implement CTF transfer using solver's Polygon wallet
  // const transferTx = await transferCTF(token_id, shares, recipient_polygon);
  const transferTx = { hash: `0x_mock_transfer_${Date.now()}`, status: "pending" };

  return payment.withReceipt(Response.json({
    status: "filled",
    order,
    transfer: {
      polygon_tx: transferTx.hash,
      recipient: recipient_polygon,
      token_id,
      shares,
    },
    // Future: merkle proof of delivery (CTF Transfer event in merkle tree,
    // root posted on Tempo for on-chain verification)
    proof: null,
  }));
}
