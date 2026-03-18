# Kalshi on MPP

Prediction market data for AI agents. Pay per request with USDC on Tempo.

The first prediction market service on the [MPP marketplace](https://mpp.dev/services). Any MPP client (tempo CLI, mppx, pympp, mpp-rs) can search Kalshi markets and get odds.

---

## Endpoints

| Method | Path | Cost | Description |
|--------|------|------|-------------|
| GET | `/api/markets?q=bitcoin&limit=10` | 0.10 USDC | Search markets by keyword |
| GET | `/api/market?ticker=KXBTC-...` | 0.05 USDC | Single market odds, volume, close time |
| GET | `/api/kalshi-markets?category=...&limit=20` | 0.05 USDC | List trending/featured markets |

All endpoints return HTTP 402 with an MPP challenge when called without payment.

## Try it

```bash
# Search for bitcoin markets
tempo request -t -X GET "https://YOUR_HOST/api/markets?q=bitcoin"

# Get a specific market
tempo request -t -X GET "https://YOUR_HOST/api/market?ticker=KXBTC-26MAR28-90000"

# Dry run (check cost without paying)
tempo request -t --dry-run -X GET "https://YOUR_HOST/api/markets?q=bitcoin"
```

---

## Setup

```bash
cp .env.example .env.local
bun install
bun dev
```

### Kalshi API credentials

Kalshi uses ECDSA P-256 signed request headers. You need:
1. Sign up at kalshi.com
2. Settings -> API -> generate key pair
3. Add to `.env.local`

### Deploy

For the hackathon: deploy to Railway, Fly.io, or Vercel so other agents can reach it.

---

## Project Plan

Priority: **P0** = must ship, **P1** = should ship, **P2** = stretch

### Milestone 0 -- First 30 min: MPP charges work

| Task | Priority | Effort | Notes |
|------|----------|--------|-------|
| Set SERVICE_WALLET_ADDRESS in .env.local | P0 | 5m | Use your tempo wallet address |
| `bun dev`, hit `/api/markets?q=test` -- verify 402 response | P0 | 10m | Tests MPP server side |
| Call with `tempo request` -- verify payment + response | P0 | 15m | Tests end-to-end |

### Milestone 1 -- 2hr mark: Kalshi auth + real data

| Task | Priority | Effort | Notes |
|------|----------|--------|-------|
| Implement Kalshi ECDSA P-256 auth in `src/lib/kalshi.ts` | P0 | 1hr | [Kalshi auth docs](https://trading-api.readme.io/reference/authentication) |
| Test `/api/markets?q=bitcoin` returns real Kalshi data | P0 | 15m | |
| Test `/api/market?ticker=...` returns single market | P0 | 15m | |
| Test `/api/kalshi-markets` returns trending markets | P0 | 15m | |

### Milestone 2 -- 3hr mark: Deploy + demo from CLI

| Task | Priority | Effort | Notes |
|------|----------|--------|-------|
| Deploy to Railway or Vercel | P0 | 30m | |
| Test `tempo request` against deployed URL | P0 | 15m | |
| Write llms.txt for service discovery | P1 | 15m | So agents can self-discover endpoints |

### Milestone 3 -- 4hr mark: Agent demo

| Task | Priority | Effort | Notes |
|------|----------|--------|-------|
| Demo: Claude (via `anthropic.mpp.tempo.xyz`) calls our service | P0 | 30m | Show agent-to-service flow |
| Demo: multi-step -- agent searches markets, picks best, explains | P1 | 30m | |

### Milestone 4 -- 5-6hr mark: Stretch

| Task | Priority | Effort | Notes |
|------|----------|--------|-------|
| Add `/api/evaluate` -- Claude-powered market analysis (calls Claude via MPP internally) | P2 | 1hr | Service-calls-service pattern |
| Polymarket integration as second data source | P2 | 1.5hr | Unified prediction market API |
| Landing page polish (live endpoint tester) | P2 | 30m | |
| Register on mpp.dev/services | P2 | 15m | If submission process exists |

---

## Key Docs

- [MPP protocol](https://mpp.dev)
- [mppx SDK](https://github.com/wevm/mppx) -- TypeScript
- [mpp-rs SDK](https://github.com/tempoxyz/mpp-rs) -- Rust
- [Tempo mainnet](https://docs.tempo.xyz/quickstart/connection-details) -- chain ID 4217
- [Kalshi API](https://trading-api.readme.io/reference/getting-started)

---

## Demo Script (2 min)

1. "Prediction markets are one of the most useful data sources for AI agents, but there's no way for an agent to access them programmatically without API keys and accounts. I built the first prediction market service on the MPP marketplace."
2. Show mpp.dev/services -- "50+ services, zero for prediction markets. Until now."
3. `tempo request -t -X GET "https://HOST/api/markets?q=bitcoin"` -- show payment + response
4. Show Claude calling the service via MPP: agent searches markets, picks the best bet, explains why.
5. "Any agent in the ecosystem can now pay 10 cents to search prediction markets. No API keys. No accounts. Just USDC on Tempo."
