# Polymarket on MPP

Search prediction markets and buy positions cross-chain. Pay USDC on Tempo, receive CTF tokens on Polygon. Every fill and transfer is verifiable on-chain.

---

## Endpoints

| Method | Path | Cost | Description |
|--------|------|------|-------------|
| GET | `/api/polymarket?q=bitcoin&limit=10` | 0.10 USDC | Search Polymarket markets |
| POST | `/api/buy-position` | 0.50 USDC | Solver: pay on Tempo, receive CTF on Polygon |

### Buy position request

```json
{
  "token_id": "71321...",
  "side": "YES",
  "amount_usd": 10,
  "recipient_polygon": "0xYOUR_POLYGON_ADDRESS"
}
```

### How the solver works

```
Tempo                        Polygon
─────                        ───────
User pays USDC ──────────>   Solver buys CTF on CLOB
via MPP                      ↓
               <──────────   Transfers CTF to user
                             (verifiable tx hash returned)
```

Trust: centralized solver (hackathon). Future: trustless via Tempo's enshrined escrow precompile.

---

## Setup

```bash
cp .env.example .env.local
bun install
bun dev
```

### What you need

| Item | Notes |
|------|-------|
| Tempo wallet | `tempo wallet login` -- receives MPP payments |
| Solver Polygon wallet | Needs USDC on Polygon to front position costs |
| Polymarket CLOB API key | [docs.polymarket.com](https://docs.polymarket.com/#create-api-key) |

---

## Build Order

### M0 -- 30 min: Polymarket data works

| Task | P | Effort | Notes |
|------|---|--------|-------|
| Set SERVICE_WALLET_ADDRESS | P0 | 5m | |
| `/api/polymarket?q=bitcoin` returns real data behind MPP | P0 | 15m | Gamma API is public, no auth |
| Test with `tempo request` | P0 | 10m | |

### M1 -- 2hr: CLOB order placement

| Task | P | Effort | Notes |
|------|---|--------|-------|
| Get Polymarket CLOB API key | P0 | 15m | [Create API key](https://docs.polymarket.com/#create-api-key) |
| Implement `placeSolverOrder()` with real CLOB auth | P0 | 1.5hr | EIP-712 signed orders |
| Test: solver places order, gets fill | P0 | 15m | |

### M2 -- 3.5hr: CTF transfer

| Task | P | Effort | Notes |
|------|---|--------|-------|
| Implement CTF ERC1155 transfer from solver to user | P0 | 45m | `safeTransferFrom` on Polygon |
| Test full `/api/buy-position` flow: MPP payment -> CLOB fill -> CTF transfer | P0 | 30m | |
| Return Polygon tx hash as proof | P0 | 10m | |

### M3 -- 4.5hr: Deploy + demo

| Task | P | Effort | Notes |
|------|---|--------|-------|
| Deploy to Railway/Vercel | P0 | 30m | |
| End-to-end demo: `tempo request` -> CTF arrives in wallet | P0 | 30m | |

### Stretch

| Task | P | Effort | Notes |
|------|---|--------|-------|
| Merkle proof of delivery | P2 | 1.5hr | CTF Transfer event in merkle tree, root on Tempo |
| On-chain verification on Tempo | P2 | 1hr | Contract verifies merkle proof |
| Agent demo: Claude searches + recommends + buys via MPP | P2 | 30m | |
| Price/odds enrichment via Allium (MPP) | P2 | 30m | |

---

## Key Docs

- [MPP](https://mpp.dev) / [mppx](https://github.com/wevm/mppx)
- [Tempo mainnet](https://docs.tempo.xyz) -- chain ID 4217
- [Polymarket CLOB](https://docs.polymarket.com)
- [Polymarket Gamma API](https://gamma-api.polymarket.com) -- market data (public)
- [CTF / Gnosis Conditional Tokens](https://docs.gnosis.io/conditionaltokens/) -- ERC1155

---

## Demo Script (2 min)

1. "Prediction markets are one of the most useful data sources for AI -- but an agent can't buy a position today. The market is on Polygon, the agent's wallet is on Tempo, and there's no bridge for intent execution."
2. `tempo request -t -X GET "https://HOST/api/polymarket?q=bitcoin"` -- show data + payment
3. "Now the interesting part. I want to buy a YES position. I'm paying on Tempo. The position is on Polygon."
4. `tempo request -t -X POST --json '{"token_id":"...","side":"YES","amount_usd":5,"recipient_polygon":"0x..."}' "https://HOST/api/buy-position"`
5. Show CTF tokens in the Polygon wallet. Show the Polygon tx hash.
6. "Every step is verifiable on-chain. Today the solver is trusted. When Tempo ships the enshrined escrow precompile that Georgios mentioned, this becomes trustless -- the solver posts a merkle proof of the CTF transfer, verified on Tempo. I've built this exact proof system before."
