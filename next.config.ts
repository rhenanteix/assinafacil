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
};
export default config;
