// Check solver wallet: balances + approvals
// Run: SOLVER_POLYGON_PRIVATE_KEY=0x... bun scripts/check-solver.ts

import { createPublicClient, http, parseAbi, formatUnits } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { polygon } from "viem/chains";

const CTF_ADDRESS = "0x4D97DCd97eC945f40cF65F87097ACe5EA0476045";
const CTF_EXCHANGE = "0x4bFb41d5B3570DeFd03C39a9A4D8dE6Bd8B8982E";
const NEG_RISK_CTF_EXCHANGE = "0xC5d563A36AE78145C45a50134d48A1215220f80a";
const NEG_RISK_ADAPTER = "0xd91E80cF2E7be2e162c6513ceD06f1dD0dA35296";
const USDC_POLYGON = "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174";

const erc20Abi = parseAbi([
  "function balanceOf(address) view returns (uint256)",
  "function allowance(address owner, address spender) view returns (uint256)",
]);
const erc1155Abi = parseAbi([
  "function isApprovedForAll(address account, address operator) view returns (bool)",
]);

async function main() {
  const pk = process.env.SOLVER_POLYGON_PRIVATE_KEY as `0x${string}`;
  const address = process.argv[2] as `0x${string}` | undefined;
  const rpcUrl = process.env.POLYGON_RPC_URL ?? "https://polygon-rpc.com";

  const solver = address ?? (pk ? privateKeyToAccount(pk).address : undefined);
  if (!solver) { console.error("Pass address as arg or set SOLVER_POLYGON_PRIVATE_KEY"); process.exit(1); }

  const client = createPublicClient({ chain: polygon, transport: http(rpcUrl) });
  console.log("Solver:", solver);

  const matic = await client.getBalance({ address: solver });
  const usdc = await client.readContract({ address: USDC_POLYGON, abi: erc20Abi, functionName: "balanceOf", args: [solver] });
  console.log(`\nBalances:`);
  console.log(`  MATIC: ${formatUnits(matic, 18)}`);
  console.log(`  USDC:  ${formatUnits(usdc, 6)}`);

  console.log(`\nApprovals:`);
  for (const [label, op] of [["CTF_EXCHANGE", CTF_EXCHANGE], ["NEG_RISK_CTF", NEG_RISK_CTF_EXCHANGE], ["NEG_RISK_ADAPTER", NEG_RISK_ADAPTER]] as const) {
    const usdcOk = await client.readContract({ address: USDC_POLYGON, abi: erc20Abi, functionName: "allowance", args: [solver, op] });
    const ctfOk = await client.readContract({ address: CTF_ADDRESS, abi: erc1155Abi, functionName: "isApprovedForAll", args: [solver, op] });
    console.log(`  ${label}: USDC=${usdcOk > 0n ? "OK" : "MISSING"}  CTF=${ctfOk ? "OK" : "MISSING"}`);
  }
}

main().catch(console.error);
