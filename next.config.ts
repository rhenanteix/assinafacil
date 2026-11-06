import type { NextConfig } from "next";

const config: NextConfig = {
  poweredByHeader: false,
  outputFileTracingIncludes: {
    "/api/preview": ["./assets/fonts/**/*"],
    "/api/signatures/export": ["./assets/fonts/**/*"],
  },
  async headers() {
    return [{
      source: "/social/:path*",
      headers: [{ key: "Access-Control-Allow-Origin", value: "*" }],
    }];
  },
  async rewrites() {
    return [
      {
        source: "/ingest/static/:path*",
        destination: "https://us-assets.i.posthog.com/static/:path*",
      },
      {
        source: "/ingest/:path*",
        destination: "https://us.i.posthog.com/:path*",
      },
    ];
  },
  skipTrailingSlashRedirect: true,
};

export default config;
