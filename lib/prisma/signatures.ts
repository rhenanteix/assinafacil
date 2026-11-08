import type { Prisma } from "@prisma/client";
import { db } from ".";

// Test payments must never grant production access. This guard is independent
// of ABACATEPAY_ENVIRONMENT so a typo cannot silently turn test charges into
// real access.
const isTestEnvironment = process.env.ABACATEPAY_ENVIRONMENT === "test";
const allowedDevMode = process.env.VERCEL_ENV === "production" ? false : isTestEnvironment;
export async function signatureAccess(userId: string, client: Prisma.TransactionClient = db) {
  const orders = await client.order.findMany({
    where: { userId, status: "approved", devMode: allowedDevMode, OR: [{ plan: { in: ["lifetime", "signature-luxe", "brand-desk"] } }, { expiresAt: { gt: new Date() } }] },
    select: { plan: true },
  });
  const owned = orders.map(order => order.plan).filter(plan => plan === "signature-luxe" || plan === "brand-desk");
  return { business: orders.some(order => order.plan === "business"), pro: orders.some(order => ["monthly", "annual", "lifetime", "business"].includes(order.plan)), owned };
}
// Serialize changes affecting limits and paid access for the same account.
export async function lockUser(client: Prisma.TransactionClient, userId: string) {
  await client.$queryRaw`SELECT id FROM "User" WHERE id = ${userId} FOR UPDATE`;
}
