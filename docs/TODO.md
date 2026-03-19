# TODO

## Tomorrow (hackathon day)

### High priority
- [ ] LLM market advisor in the GUI: chat input, calls search endpoint, recommends markets, constructs deposit params for user to sign. 2-3 hours. Use Claude or OpenAI, give it the search results as structured JSON context.
- [ ] Find 2-3 active liquid markets before the demo. Token IDs can expire or go illiquid.
- [ ] Test with recipient set to Polymarket Safe (`0x5BcfE...`) to show real CTF delivery in portfolio.
- [ ] Replace placeholder gifs in the trust model section with something on-brand.
- [ ] Deploy to a public URL (Railway/Vercel) so judges can see the landing page.

### Nice to have
- [ ] GUI for deposit: show wallet balance, deposit form, active orders. Replaces the tempo-cast CLI commands.
- [ ] Show live escrow state on the landing page (orders, settlements).

## Known issues

### Alchemy MPP (not blocking)
- Alchemy MPP returns 401 (SIWE auth) instead of 402 (MPP challenge).
- `tempo request` can't handle it. Would need EIP-4361 SIWE signing.
- Currently falls back to direct Polygon RPC for verification. Works but loses the "MPP all the way down" narrative.
- See `docs/tempo-developer-friction.md` item 7.

### Viem on Tempo (workaround in place)
- Standard viem cannot send transactions on Tempo (no fee token support).
- All write operations shell out to `tempo-cast`. Fragile, leaks keys to process args.
- See `docs/tempo-developer-friction.md` item 8.

### Contract
- `commitRoot` allows overwriting old batch roots (`batchIndex <= nextBatchIndex` should be `==`).
- Merkle tree state is in-memory. Lost on server restart.
- $2 still locked in escrow from failed test runs (unknown order IDs). Not recoverable without event indexing.

### Architecture
- Solver is not event-driven. Only acts when the API is called, doesn't watch for deposits.
- Service fee hardcoded at $0.50.
- CLOB API key cached in memory, auto-recovers on restart but logs a scary error.

## Future work

### Position lifecycle
The solver manages the full lifecycle: watches the position, sells at a target price, transfers proceeds back to the user on Tempo. "Make money on a foreign chain without ever touching it." Requires a reverse escrow (solver locks proceeds, user releases CTF) which has its own trust model to design.

### Agent-to-agent
An AI agent with a Tempo wallet searches markets, evaluates odds, deposits into escrow, and triggers the solver. Fully autonomous cross-chain trading with no human in the loop. The agent uses MPP to search, MPP to fill, and the escrow handles trust.

### Multi-chain
Deploy the escrow pattern to other chains. The solver buys anything on any chain. User always pays on Tempo. Same merkle proof pattern, different target chain.

### Alchemy MPP
Debug the SIWE auth flow or wait for Alchemy to align with standard MPP 402. Once working, verification becomes "MPP all the way down": the service pays Alchemy via MPP to verify cross-chain transfers.
