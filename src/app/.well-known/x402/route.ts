// GET /.well-known/x402
// x402/MPP discovery document for mppscan and AgentCash

export async function GET() {
  const baseUrl = process.env.RAILWAY_PUBLIC_DOMAIN
    ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`
    : "http://localhost:3000";

  return Response.json({
    version: 1,
    openapi: `${baseUrl}/openapi.json`,
    resources: [
      { url: `${baseUrl}/api/polymarket`, method: "GET", price: "0.10", currency: "USDC" },
      { url: `${baseUrl}/api/advisor`, method: "POST", price: "0.25", currency: "USDC" },
      { url: `${baseUrl}/api/buy-position`, method: "POST", price: "0.50", currency: "USDC" },
      { url: `${baseUrl}/api/proof`, method: "GET", price: "0", currency: "USDC" },
    ],
    mppResources: [
      `${baseUrl}/api/polymarket`,
      `${baseUrl}/api/advisor`,
      `${baseUrl}/api/buy-position`,
    ],
    description:
      "Cross-chain prediction market solver. Pay on Tempo, get a Polymarket position on Polygon. Escrow-based settlement with merkle proof verification. LLM advisor powered by Claude via Anthropic MPP.",
    instructions: `# Solver as a Service

> Cross-chain prediction market solver on MPP. Pay on Tempo, receive positions on Polygon.

Base URL: \`${baseUrl}\`

## Quick Start

1. Call the advisor to get a trade recommendation:
   \`tempo request -X POST --json '{"query":"bitcoin","budget_usd":5}' ${baseUrl}/api/advisor\`
2. Follow the next_steps in the response to deposit into escrow and fill the order.

## Routes

| Endpoint | Method | Cost | Description |
|----------|--------|------|-------------|
| /api/polymarket | GET | $0.10 | Search Polymarket markets by keyword |
| /api/advisor | POST | $0.25 | LLM market advisor (Claude via Anthropic MPP) |
| /api/buy-position | POST | $0.50 | Fill an escrow order with full settlement |
| /api/proof | GET | free | Get merkle proof for a fulfilled order |

## Input Schemas

**GET /api/polymarket**
\`?q=bitcoin&limit=10\`

**POST /api/advisor**
\`\`\`json
{"query": "bitcoin", "budget_usd": 5}
\`\`\`

**POST /api/buy-position** (escrow flow)
\`\`\`json
{"order_id": "0x...", "recipient_polygon": "0x..."}
\`\`\`

**POST /api/buy-position** (direct flow)
\`\`\`json
{"token_id": "123...", "amount_usd": 5, "recipient_polygon": "0x..."}
\`\`\`

**GET /api/proof**
\`?orderId=0x...\`

## Payment

All paid endpoints use MPP (Machine Payments Protocol) on Tempo. Send a request, receive a 402 challenge, pay via Tempo wallet, receive the response.
`,
  });
}
