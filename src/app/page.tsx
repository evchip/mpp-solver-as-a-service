"use client";

export default function Home() {
  return (
    <main style={{ maxWidth: 640, margin: "80px auto", padding: "0 24px" }}>
      <h1 style={{ fontSize: 24, marginBottom: 8 }}>Prediction Markets on MPP</h1>
      <p style={{ color: "#888", marginBottom: 40, fontSize: 14 }}>
        Search prediction markets and buy positions cross-chain. Pay with USDC on Tempo.
      </p>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 14, color: "#aaa", marginBottom: 12 }}>Data Endpoints</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Endpoint
            method="GET"
            path="/api/polymarket?q=bitcoin"
            cost="0.10"
            description="Search Polymarket markets"
          />
          <Endpoint
            method="GET"
            path="/api/markets?q=bitcoin"
            cost="0.10"
            description="Search Kalshi markets"
          />
          <Endpoint
            method="GET"
            path="/api/market?ticker=KXBTC..."
            cost="0.05"
            description="Single Kalshi market: odds, volume, close time"
          />
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 14, color: "#aaa", marginBottom: 12 }}>
          Solver
          <span style={{ color: "#f59e0b", fontSize: 11, marginLeft: 8 }}>cross-chain</span>
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Endpoint
            method="POST"
            path="/api/buy-position"
            cost="0.50 + position"
            description="Pay on Tempo, receive a Polymarket position on Polygon"
          />
        </div>
        <p style={{ color: "#555", fontSize: 12, marginTop: 12 }}>
          The solver buys CTF tokens on Polymarket and transfers them to your Polygon address.
          Currently trusted (our server). Future: trustless via Tempo's enshrined escrow precompile.
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 14, color: "#aaa", marginBottom: 12 }}>Usage</h2>
        <pre style={{ background: "#111", padding: 16, borderRadius: 8, fontSize: 12, overflow: "auto" }}>
{`# Search Polymarket
tempo request -t -X GET "https://HOST/api/polymarket?q=bitcoin"

# Buy a position (pay on Tempo, receive on Polygon)
tempo request -t -X POST --json '{
  "token_id": "71321...",
  "side": "YES",
  "amount_usd": 10,
  "recipient_polygon": "0xYOUR_POLYGON_ADDRESS"
}' "https://HOST/api/buy-position"`}
        </pre>
      </section>

      <section>
        <h2 style={{ fontSize: 14, color: "#aaa", marginBottom: 12 }}>How it works</h2>
        <pre style={{ background: "#111", padding: 16, borderRadius: 8, fontSize: 12, overflow: "auto", color: "#888" }}>
{`Tempo (payment)              Polygon (execution)
─────────────────            ──────────────────
User pays USDC  ──────────>  Solver buys CTF tokens
via MPP                      on Polymarket CLOB
                <──────────  Solver transfers CTF
                             to user's address

Trust: solver is our server (hackathon)
Future: enshrined escrow precompile on Tempo`}
        </pre>
      </section>
    </main>
  );
}

function Endpoint({ method, path, cost, description }: {
  method: string; path: string; cost: string; description: string;
}) {
  return (
    <div style={{ background: "#111", padding: 12, borderRadius: 8, fontSize: 13 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <code>
          <span style={{ color: "#4ade80" }}>{method}</span> {path}
        </code>
        <span style={{ color: "#888" }}>{cost} USDC</span>
      </div>
      <div style={{ color: "#666", fontSize: 12 }}>{description}</div>
    </div>
  );
}
