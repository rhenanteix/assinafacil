import { loadEnvConfig } from "@next/env";
loadEnvConfig(process.cwd());

async function main() {
  const [orderId, paymentId] = process.argv.slice(2);
  if (!orderId || !/^(pix_char_|card_|bole_)[A-Za-z0-9_-]+$/.test(paymentId ?? "")) throw new Error("Usage: npm run payments:reconcile -- <orderId> <paymentId>");
  const { getCharge } = await import("../lib/abacatepay/client");
  const { applyCharge } = await import("../lib/payments/orders");
  const charge = await getCharge(paymentId);
  if (charge.id !== paymentId || charge.metadata?.orderId !== orderId) throw new Error("Charge does not belong to this order.");
  const order = await applyCharge(orderId, charge);
  console.log(JSON.stringify({ orderId: order.id, status: order.status }));
}
main().catch(error => { console.error(error instanceof Error ? error.message : "Reconciliation failed"); process.exitCode = 1; }).finally(async () => {
  const { db } = await import("../lib/prisma");
  await db.$disconnect();
});
