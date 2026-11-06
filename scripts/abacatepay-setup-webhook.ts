import { loadEnvConfig } from "@next/env";
import { abacatePay } from "../lib/abacatepay/client";
loadEnvConfig(process.cwd());

async function main() {
  const origin = process.env.NEXTAUTH_URL;
  const secret = process.env.ABACATEPAY_WEBHOOK_SECRET;
  if (!origin || !secret || !["test", "production"].includes(process.env.ABACATEPAY_ENVIRONMENT ?? "")) throw new Error("Configure NEXTAUTH_URL, ABACATEPAY_WEBHOOK_SECRET and ABACATEPAY_ENVIRONMENT first.");
  const endpoint = new URL("/api/payments/abacatepay/webhook", origin);
  if (endpoint.protocol !== "https:" || endpoint.hostname === "localhost") throw new Error("Webhook requires the final public HTTPS origin.");
  const events = ["transparent.completed", "transparent.refunded", "transparent.disputed", "transparent.lost"];
  const result = await abacatePay("/webhooks/list");
  if (!Array.isArray(result)) throw new Error("Unexpected webhook list response; inspect in AbacatePay dashboard.");
  const existing = result.find((item: { endpoint?: string }) => item.endpoint === endpoint.href);
  if (existing) {
    console.log("Webhook already exists for this endpoint. Verify its secret and four event subscriptions in the dashboard.");
    return;
  }
  await abacatePay("/webhooks/create", { name: `AssinaFacil ${process.env.ABACATEPAY_ENVIRONMENT}`, endpoint: endpoint.href, secret, events });
  console.log(`Webhook registered: ${endpoint.origin}${endpoint.pathname}`);
}
main().catch(error => { console.error(error instanceof Error ? error.message : "Webhook setup failed"); process.exitCode = 1; });
