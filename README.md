# Prediction Markets on MPP

Search prediction markets and buy positions cross-chain. Pay with USDC on Tempo, receive CTF tokens on Polygon.

Two things:
1. **Data service** -- first prediction market API on MPP (Polymarket + Kalshi)
2. **Cross-chain solver** -- pay on Tempo, get a Polymarket position on Polygon

---

## Endpoints

### Data (read-only)

| Method | Path | Cost | Description |
|--------|------|------|-------------|
| GET | `/api/polymarket?q=bitcoin` | 0.10 USDC | Search Polymarket markets |
| GET | `/api/markets?q=bitcoin` | 0.10 USDC | Search Kalshi markets |
| GET | `/api/market?ticker=KXBTC-...` | 0.05 USDC | Single Kalshi market detail |
| GET | `/api/kalshi-markets` | 0.05 USDC | Trending Kalshi markets |

### Solver (cross-chain execution)

| Method | Path | Cost | Description |
|--------|------|------|-------------|
| POST | `/api/buy-position` | 0.50 USDC + position cost | Pay on Tempo, receive CTF on Polygon |

```
Tempo (payment)              Polygon (execution)
─────────────────            ──────────────────
User pays USDC  ──────────>  Solver buys CTF tokens
via MPP                      on Polymarket CLOB
                <──────────  Solver transfers CTF
                             to user's address
```

Trust model (hackathon): solver is our server.
Future: trustless via Tempo's enshrined escrow precompile (confirmed on Tempo's roadmap).

Settlement proof (stretch): solver posts CTF Transfer event into merkle tree exposed via API, merkle root posted on Tempo for on-chain verification.

---

## Setup

```bash
cp .env.example .env.local
bun install
bun dev
```

### What you need

| Item | Where | Notes |
|------|-------|-------|
| Tempo wallet | `tempo wallet login` | Receives MPP payments |
| Kalshi API creds | kalshi.com -> API settings | ECDSA P-256 |
| Solver Polygon wallet | `cast wallet new` | Needs USDC on Polygon |
| Polymarket CLOB API key | docs.polymarket.com | For order placement |

---

## Build Order (hackathon day)

### M0 -- 30 min: MPP + Polymarket data

| Task | P | Effort | Notes |
|------|---|--------|-------|
| Set SERVICE_WALLET_ADDRESS, `bun dev` | P0 | 5m | |
| Hit `/api/polymarket?q=bitcoin` -- verify 402 + real data | P0 | 10m | Gamma API is public, no auth |
| Test with `tempo request` | P0 | 10m | End-to-end MPP payment |

### M1 -- 2hr: Kalshi auth + data

| Task | P | Effort | Notes |
|------|---|--------|-------|
| Kalshi ECDSA P-256 auth in `src/lib/kalshi.ts` | P0 | 1hr | [Auth docs](https://trading-api.readme.io/reference/authentication) |
| Test `/api/markets?q=bitcoin` with real data | P0 | 15m | |
| Deploy data endpoints (Vercel/Railway) | P0 | 30m | So agents can reach it |

### M2 -- 4hr: Solver

| Task | P | Effort | Notes |
|------|---|--------|-------|
| Polymarket CLOB API key + auth | P0 | 45m | [CLOB docs](https://docs.polymarket.com) |
| Implement `placeSolverOrder()` with real CLOB | P0 | 1hr | EIP-712 signed order |
| Implement CTF transfer to user's Polygon address | P0 | 30m | ERC1155 safeTransferFrom |
| Test `/api/buy-position` end-to-end | P0 | 30m | |

### M3 -- 5hr: Demo

| Task | P | Effort | Notes |
|------|---|--------|-------|
| Agent demo: Claude searches markets via MPP, recommends, user buys | P0 | 30m | |
| Deploy solver endpoint | P0 | 15m | |

### Stretch

| Task | P | Effort | Notes |
|------|---|--------|-------|
| Merkle proof of delivery (CTF Transfer event) | P2 | 1.5hr | Merkle root on Tempo, proof via API |
| On-chain verification contract on Tempo | P2 | 1hr | Verify merkle proof |
| Price comparison: Polymarket vs Kalshi odds for same event | P2 | 30m | |
| Allium/Dune data enrichment via MPP | P2 | 30m | |

---

## Key Docs

- [MPP](https://mpp.dev) / [mppx](https://github.com/wevm/mppx)
- [Tempo mainnet](https://docs.tempo.xyz) -- chain ID 4217
- [Polymarket CLOB](https://docs.polymarket.com) -- order API
- [Polymarket Gamma](https://gamma-api.polymarket.com) -- market data (public)
- [Kalshi API](https://trading-api.readme.io/reference/getting-started)
- [CTF (Gnosis)](https://docs.gnosis.io/conditionaltokens/) -- ERC1155 position tokens

---

## Demo Script (2 min)

1. "Prediction markets are one of the most useful data sources for AI agents. But there's no way for an agent to access them on MPP, and there's definitely no way for an agent to buy a position cross-chain."
2. `tempo request -t -X GET "https://HOST/api/polymarket?q=bitcoin"` -- show search + payment
3. "Now the interesting part. I want to buy a YES position on this market. The market is on Polygon, but I'm paying with USDC on Tempo."
4. `tempo request -t -X POST --json '{"token_id":"...","side":"YES","amount_usd":5,"recipient_polygon":"0x..."}' "https://HOST/api/buy-position"`
5. Show the CTF tokens arriving in the user's Polygon wallet.
6. "Today this works with a trusted solver. When Tempo ships the enshrined escrow precompile Georgios mentioned, this becomes trustless. The solver posts a merkle proof of the CTF transfer, verified on Tempo."
