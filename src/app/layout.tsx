import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kalshi on MPP",
  description: "Prediction market data for AI agents. Pay per request with USDC on Tempo.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "monospace", background: "#0a0a0a", color: "#e5e5e5", margin: 0 }}>
        {children}
      </body>
    </html>
  );
}
