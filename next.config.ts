import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["viem"],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Link",
            value: '</openapi.json>; rel="service-desc"',
          },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/.well-known/openapi.json",
        destination: "/openapi.json",
      },
      {
        source: "/.well-known/x402",
        destination: "/openapi.json",
      },
    ];
  },
};

export default nextConfig;
