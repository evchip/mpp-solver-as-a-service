# Tempo Developer Friction Log

Issues encountered while building a cross-chain solver with escrow + merkle proof settlement on Tempo. Sharing with the Tempo team for feedback.

## 1. Standard Foundry cannot deploy to Tempo

**Problem:** `forge script --broadcast` fails with "insufficient funds for gas" because Tempo uses USDC-based gas via fee tokens, not native ETH-style gas. Standard Foundry doesn't know about `--tempo.fee-token`.

**Workaround:** Had to discover and download `tempoxyz/tempo-foundry` from GitHub releases. The fork adds `--tempo.fee-token` flag.

**Suggestion:** Document this prominently. The plan mentioned `foundryup -n tempo` but that flag doesn't exist on standard foundryup. Consider adding tempo-foundry as a `tempo add foundry` extension, or getting the flag upstreamed.

## 2. Standard viem cannot send transactions on Tempo

**Problem:** `viem` `writeContract`/`sendTransaction` sends raw EIP-1559 transactions. These fail on Tempo because raw EOAs have 0 native gas balance. Tempo's gas mechanism requires either:
- Fee token specification (like tempo-foundry's `--tempo.fee-token`)
- Access key + root account pattern (like tempo-cast's `--tempo.access-key` + `--tempo.root-account`)

**Workaround:** For write operations, shell out to `tempo-cast send` instead of using viem. Read operations work fine via standard viem.

**Suggestion:** A `tempo-viem` transport or middleware that automatically adds fee token headers/fields to transactions would make the DX seamless. Currently, any TypeScript project that needs to send transactions on Tempo has to shell out to tempo-cast.

## 3. `eth_getBalance` returns misleading values

**Problem:** `eth_getBalance` returns the same large hex value (`0x9612084f...`) for every address, regardless of actual balance. But transaction execution correctly rejects with "have 0". This is confusing when debugging.

**Suggestion:** Either return the actual native balance (0 for unfunded accounts), or document that `eth_getBalance` isn't meaningful on Tempo and developers should check USDC balance instead.

## 4. Passkey scoped key cannot be used as a raw EOA

**Problem:** The scoped access key from `tempo wallet keys` has a private key, but using it with `privateKeyToAccount()` in viem creates a raw EOA at the derived address (`0x3fec...`), not the passkey wallet (`0xef07...`). The derived address has no funds.

**Context:** This is by design (the key signs on behalf of the wallet via the Account Keychain precompile), but it's a gotcha for developers who expect the private key to behave like a normal EOA key.

**Suggestion:** Document clearly that scoped keys must be used via `--tempo.access-key` + `--tempo.root-account` (in tempo-cast) or via the wallet CLI. A viem example showing the correct pattern would help.

## 5. No clear contract deployment documentation

**Problem:** Could not find deployment docs on docs.tempo.xyz (SPA rendering issues from CLI, so may exist but weren't accessible). Had to discover `tempoxyz/tempo-foundry` by listing all repos in the GitHub org.

**Suggestion:** Add a "Deploy your first contract" guide that covers:
- Installing tempo-foundry
- Using `--tempo.fee-token` for gas
- Using access keys for deployment from passkey wallets

## 6. Multiple wallet support unclear

**Problem:** Need separate passkey wallets for user vs solver roles, but `tempo wallet login` appears to restore the same wallet. No `--profile` or account switching mechanism visible in the CLI.

**Suggestion:** If multi-wallet is supported, add `tempo wallet login --profile <name>` or similar. If not, document how to run separate wallet contexts (e.g., different config directories).

## 7. Alchemy MPP uses SIWE auth, not standard MPP 402 flow

**Problem:** The Alchemy MPP service at `https://mpp.alchemy.com` returns 401 with `Authorization: SIWE <base64(message)>.<signature>` instead of the standard MPP 402 challenge. `tempo request` doesn't handle this auth mechanism.

**Expected behavior:** Service returns 402 with `WWW-Authenticate: Payment ...` header, `tempo request` handles the challenge automatically (like it does for every other MPP service).

**Impact:** Can't use Alchemy via MPP from `tempo request` or the `mppx` client SDK. The service directory lists Alchemy as an MPP service with session pricing, but the actual endpoint doesn't follow the MPP 402 flow.

**Suggestion:** Either align Alchemy's MPP endpoint to return 402 challenges, or document the SIWE auth flow required to use it. The error message suggests `npx skills add alchemyplatform/skills --yes` but this is opaque for developers expecting standard MPP.

## 8. Viem has no Tempo transaction support (critical DX gap)

**Problem:** Viem is co-developed by the Tempo team, yet it cannot send transactions on Tempo. Every `writeContract`/`sendTransaction` call fails with "insufficient funds for gas" because viem sends standard EIP-1559 transactions that require native gas balance, which Tempo accounts don't have.

**Impact:** This is the single biggest friction point. Server-side code (Next.js API routes, scripts) cannot write to Tempo without shelling out to `tempo-cast`. This means:
- No programmatic contract deployment from TypeScript
- No in-process transaction signing
- No viem-native workflows (estimate gas → sign → send → wait for receipt)
- Every write operation requires `execSync('tempo-cast send ...')`, which is fragile and leaks private keys to process arguments

**What's needed:** A Tempo-specific viem transport or chain configuration that:
- Adds the `feeToken` field to transactions
- Supports the access key + root account pattern for passkey wallets
- Works with standard `createWalletClient` / `writeContract` API

This would immediately unblock every TypeScript project building on Tempo.

## Environment

- tempo CLI: v0.1.4
- tempo-foundry: v1.6.0-t1c1
- macOS arm64
- Project: cross-chain Polymarket solver with escrow + merkle proof settlement
