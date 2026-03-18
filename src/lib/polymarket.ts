// Polymarket CLOB API client
// Docs: https://docs.polymarket.com
// Chain: Polygon PoS
// Tokens: CTF (Conditional Token Framework) ERC1155

const CLOB_URL = process.env.POLYMARKET_CLOB_URL ?? "https://clob.polymarket.com";
const GAMMA_URL = "https://gamma-api.polymarket.com";

export interface PolymarketMarket {
  condition_id: string;
  question_id: string;
  question: string;
  tokens: { token_id: string; outcome: string; price: string }[];
  active: boolean;
  closed: boolean;
  volume: string;
  end_date_iso: string;
}

// Search markets via Gamma API (public, no auth needed)
export async function searchMarkets(query: string, limit = 10): Promise<PolymarketMarket[]> {
  const params = new URLSearchParams({
    _limit: String(limit),
    active: "true",
    closed: "false",
  });
  const res = await fetch(`${GAMMA_URL}/markets?${params}`, {
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error(`Polymarket search failed: ${res.status}`);
  const markets: PolymarketMarket[] = await res.json();
  // Filter by query relevance
  if (!query) return markets;
  return markets.filter((m) =>
    m.question.toLowerCase().includes(query.toLowerCase())
  );
}

// Get a single market by condition_id
export async function getMarket(conditionId: string): Promise<PolymarketMarket> {
  const res = await fetch(`${GAMMA_URL}/markets/${conditionId}`);
  if (!res.ok) throw new Error(`Polymarket market fetch failed: ${res.status}`);
  return res.json();
}

// Get orderbook for a token_id from CLOB
export async function getOrderbook(tokenId: string) {
  const res = await fetch(`${CLOB_URL}/book?token_id=${tokenId}`);
  if (!res.ok) throw new Error(`CLOB orderbook failed: ${res.status}`);
  return res.json();
}

// Get current price for a token
export async function getPrice(tokenId: string): Promise<string> {
  const res = await fetch(`${CLOB_URL}/price?token_id=${tokenId}&side=buy`);
  if (!res.ok) throw new Error(`CLOB price failed: ${res.status}`);
  const data = await res.json();
  return data.price;
}

// TODO day-of: CLOB order placement requires L1 API key + ECDSA signing
// See: https://docs.polymarket.com/#create-api-key
// For the hackathon solver, the solver wallet needs:
// 1. A Polymarket CLOB API key (created via their API)
// 2. USDC on Polygon (to buy positions)
// 3. Approval for CTF contract to transfer tokens

export interface SolverOrderParams {
  tokenId: string;
  side: "BUY" | "SELL";
  size: number;      // number of shares
  price: number;     // 0-1 (e.g., 0.65 = 65 cents)
}

export async function placeSolverOrder(params: SolverOrderParams) {
  // TODO: implement CLOB order placement with solver wallet
  // This requires:
  // 1. Build order object with EIP-712 signature
  // 2. POST to CLOB /order endpoint
  // For now, return a mock to unblock the rest of the flow
  return {
    orderID: `mock-${Date.now()}`,
    status: "MATCHED",
    ...params,
  };
}

// CTF token contract on Polygon
export const CTF_ADDRESS = "0x4D97DCd97eC945f40cF65F87097ACe5EA0476045" as const;
export const USDC_POLYGON = "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174" as const;
