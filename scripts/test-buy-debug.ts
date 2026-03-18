// Debug: inspect raw CLOB order response
import { ClobClient } from "@polymarket/clob-client";
import { createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { polygon } from "viem/chains";

const CLOB_URL = "https://clob.polymarket.com";

async function main() {
  const pk = process.env.SOLVER_POLYGON_PRIVATE_KEY as `0x${string}`;
  const rpcUrl = process.env.POLYGON_RPC_URL ?? "https://polygon-bor-rpc.publicnode.com";
  const account = privateKeyToAccount(pk);
  const signer = createWalletClient({ account, chain: polygon, transport: http(rpcUrl) });

  const tempClient = new ClobClient(CLOB_URL, 137, signer as any);
  const creds = await tempClient.createOrDeriveApiKey();
  const client = new ClobClient(CLOB_URL, 137, signer as any, {
    key: creds.key, secret: creds.secret, passphrase: creds.passphrase,
  });

  // Use the BTC/GTA market YES token
  const tokenId = "105267568073659068217311993901927962476298440625043565106676088842803600775810";

  console.log("Placing $5 market buy...");
  const order = await client.createAndPostMarketOrder({
    tokenID: tokenId,
    amount: 5,
    side: "BUY",
  });
  console.log("Raw response:", JSON.stringify(order, null, 2));
  console.log("Type of order:", typeof order);
  console.log("Keys:", Object.keys(order));
}

main().catch((err) => { console.error("Failed:", err); process.exit(1); });
