"use client";

export default function Home() {
  return (
    <main style={{ maxWidth: 640, margin: "80px auto", padding: "0 24px" }}>
      <h1 style={{ fontSize: 24, marginBottom: 8 }}>Polymarket on MPP</h1>
      <p style={{ color: "#888", marginBottom: 40, fontSize: 14 }}>
        Search prediction markets and buy positions cross-chain.
        Pay USDC on Tempo, receive CTF tokens on Polygon.
      </p>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 14, color: "#aaa", marginBottom: 12 }}>Data</h2>
        <Endpoint
          method="GET"
          path="/api/polymarket?q=bitcoin"
          cost="0.10"
          description="Search Polymarket markets by keyword"
        />
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 14, color: "#aaa", marginBottom: 12 }}>
          Solver
          <span style={{ color: "#f59e0b", fontSize: 11, marginLeft: 8 }}>Tempo &rarr; Polygon</span>
        </h2>
        <Endpoint
          method="POST"
          path="/api/buy-position"
          cost="0.50 + position"
          description="Pay on Tempo, solver buys CTF on Polymarket, transfers to your Polygon address"
        />
        <p style={{ color: "#555", fontSize: 12, marginTop: 12 }}>
          Every fill and transfer is verifiable on-chain (Polygon).
          Trust model: centralized solver today.
          Trustless when Tempo ships the enshrined escrow precompile.
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 14, color: "#aaa", marginBottom: 12 }}>Try it</h2>
        <pre style={{ background: "#111", padding: 16, borderRadius: 8, fontSize: 12, overflow: "auto" }}>
{`# Search markets
tempo request -t -X GET "https://HOST/api/polymarket?q=bitcoin"

# Buy a position (pay on Tempo, receive CTF on Polygon)
tempo request -t -X POST --json '{
  "token_id": "71321...",
  "side": "YES",
  "amount_usd": 10,
  "recipient_polygon": "0xYOUR_ADDRESS"
}' "https://HOST/api/buy-position"`}
        </pre>
      </section>

      <section>
        <h2 style={{ fontSize: 14, color: "#aaa", marginBottom: 12 }}>Architecture</h2>
        <pre style={{ background: "#111", padding: 16, borderRadius: 8, fontSize: 12, overflow: "auto", color: "#888" }}>
{`Tempo                        Polygon
─────                        ───────
User pays USDC ──────────>   Solver buys CTF on CLOB
via MPP                      ↓
               <──────────   Transfers CTF to user
                             (verifiable on-chain)`}
        </pre>
      </section>
    </main>
  );
}

function Endpoint({ method, path, cost, description }: {
  method: string; path: string; cost: string; description: string;
}) {
  return (
    <div style={{ background: "#111", padding: 12, borderRadius: 8, fontSize: 13, marginBottom: 8 }}>
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
