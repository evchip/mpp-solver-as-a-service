// One-time setup: approve USDC + CTF (ERC1155) for the solver EOA on Polygon
// Run: SOLVER_POLYGON_PRIVATE_KEY=0x... POLYGON_RPC_URL=... bun scripts/setup-solver.ts

import { createWalletClient, createPublicClient, http, encodeFunctionData, parseAbi, formatUnits } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { polygon } from "viem/chains";

// Polymarket contract addresses (from Amplifi)
const CTF_ADDRESS = "0x4D97DCd97eC945f40cF65F87097ACe5EA0476045";
const CTF_EXCHANGE = "0x4bFb41d5B3570DeFd03C39a9A4D8dE6Bd8B8982E";
const NEG_RISK_CTF_EXCHANGE = "0xC5d563A36AE78145C45a50134d48A1215220f80a";
const NEG_RISK_ADAPTER = "0xd91E80cF2E7be2e162c6513ceD06f1dD0dA35296";
const USDC_POLYGON = "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174";
const MAX_UINT256 = 2n ** 256n - 1n;

const SPENDERS = [CTF_EXCHANGE, NEG_RISK_CTF_EXCHANGE, NEG_RISK_ADAPTER] as const;

const erc20Abi = parseAbi([
  "function approve(address spender, uint256 amount) returns (bool)",
  "function balanceOf(address) view returns (uint256)",
  "function allowance(address owner, address spender) view returns (uint256)",
]);

const erc1155Abi = parseAbi([
  "function setApprovalForAll(address operator, bool approved)",
  "function isApprovedForAll(address account, address operator) view returns (bool)",
]);

async function main() {
  const pk = process.env.SOLVER_POLYGON_PRIVATE_KEY as `0x${string}`;
  const rpcUrl = process.env.POLYGON_RPC_URL ?? "https://polygon-rpc.com";
  if (!pk) { console.error("Set SOLVER_POLYGON_PRIVATE_KEY"); process.exit(1); }

  const account = privateKeyToAccount(pk);
  const publicClient = createPublicClient({ chain: polygon, transport: http(rpcUrl) });
  const walletClient = createWalletClient({ account, chain: polygon, transport: http(rpcUrl) });

  console.log("Solver address:", account.address);

  // Check balances
  const maticBal = await publicClient.getBalance({ address: account.address });
  const usdcBal = await publicClient.readContract({ address: USDC_POLYGON, abi: erc20Abi, functionName: "balanceOf", args: [account.address] });
  console.log(`MATIC: ${formatUnits(maticBal, 18)}`);
  console.log(`USDC:  ${formatUnits(usdcBal, 6)}`);

  if (maticBal === 0n) { console.error("\nNo MATIC for gas! Fund the solver wallet first."); process.exit(1); }

  // USDC approvals
  for (const spender of SPENDERS) {
    const allowance = await publicClient.readContract({ address: USDC_POLYGON, abi: erc20Abi, functionName: "allowance", args: [account.address, spender] });
    if (allowance >= MAX_UINT256 / 2n) {
      console.log(`USDC -> ${spender}: already approved`);
      continue;
    }
    console.log(`Approving USDC -> ${spender}...`);
    const hash = await walletClient.writeContract({ address: USDC_POLYGON, abi: erc20Abi, functionName: "approve", args: [spender, MAX_UINT256] });
    await publicClient.waitForTransactionReceipt({ hash });
    console.log(`  tx: ${hash}`);
  }

  // ERC1155 (CTF) approvals
  for (const operator of SPENDERS) {
    const approved = await publicClient.readContract({ address: CTF_ADDRESS, abi: erc1155Abi, functionName: "isApprovedForAll", args: [account.address, operator] });
    if (approved) {
      console.log(`CTF  -> ${operator}: already approved`);
      continue;
    }
    console.log(`Approving CTF -> ${operator}...`);
    const hash = await walletClient.writeContract({ address: CTF_ADDRESS, abi: erc1155Abi, functionName: "setApprovalForAll", args: [operator, true] });
    await publicClient.waitForTransactionReceipt({ hash });
    console.log(`  tx: ${hash}`);
  }

  console.log("\nSolver setup complete!");
}

main().catch((err) => { console.error("Failed:", err); process.exit(1); });
