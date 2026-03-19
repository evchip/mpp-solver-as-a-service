// GET /api/proof?orderId=0x...
// Returns merkle proof data for a fulfilled escrow order

import { NextRequest } from "next/server";
import { getProofData } from "@/lib/fulfillment";

export async function GET(req: NextRequest) {
  const orderId = req.nextUrl.searchParams.get("orderId");
  if (!orderId) {
    return Response.json({ error: "orderId required" }, { status: 400 });
  }

  const proof = getProofData(orderId);
  if (!proof) {
    return Response.json({ error: "No proof available for this order" }, { status: 404 });
  }

  return Response.json(proof);
}
