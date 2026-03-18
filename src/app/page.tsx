"use client";

export default function Home() {
  return (
    <main style={{ maxWidth: 640, margin: "80px auto", padding: "0 24px" }}>
      <h1 style={{ fontSize: 24, marginBottom: 8 }}>Kalshi on MPP</h1>
      <p style={{ color: "#888", marginBottom: 40, fontSize: 14 }}>
        Prediction market data for AI agents. Pay per request with USDC on Tempo.
      </p>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 14, color: "#aaa", marginBottom: 12 }}>Endpoints</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Endpoint
            method="GET"
            path="/api/markets?q=bitcoin"
            cost="0.10"
            description="Search markets by keyword"
          />
          <Endpoint
            method="GET"
            path="/api/market?ticker=KXBTC..."
            cost="0.05"
            description="Get a single market's odds, volume, close time"
          />
          <Endpoint
            method="GET"
            path="/api/kalshi-markets"
            cost="0.05"
            description="List trending markets"
          />
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 14, color: "#aaa", marginBottom: 12 }}>Usage</h2>
        <pre style={{ background: "#111", padding: 16, borderRadius: 8, fontSize: 12, overflow: "auto" }}>
{`# With tempo CLI
tempo request -t -X GET \\
  "https://your-host.com/api/markets?q=bitcoin"

# With mppx (TypeScript)
import { Mppx, tempo } from 'mppx/client'
Mppx.create({ methods: [tempo({ account })] })
const res = await fetch('/api/markets?q=bitcoin')

# With mpp (Rust)
let client = ClientBuilder::new(reqwest::Client::new())
    .with(PaymentMiddleware::new(provider))
    .build();
let res = client.get("/api/markets?q=bitcoin").send().await?;`}
        </pre>
      </section>

      <section>
        <h2 style={{ fontSize: 14, color: "#aaa", marginBottom: 12 }}>Protocol</h2>
        <p style={{ color: "#666", fontSize: 13 }}>
          All endpoints return HTTP 402 with an MPP challenge when called without payment.
          Compatible with any MPP client (tempo CLI, mppx, pympp, mpp-rs).
          Payments settle on Tempo mainnet in USDC.
        </p>
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
