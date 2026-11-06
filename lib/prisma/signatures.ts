import type { Prisma } from "@prisma/client";
import { db } from ".";

export async function signatureAccess(userId: string, client: Prisma.TransactionClient = db) {
  const orders = await client.order.findMany({
    where: { userId, status: "approved", OR: [{ plan: { in: ["lifetime", "signature-luxe", "brand-desk"] } }, { expiresAt: { gt: new Date() } }] },
    select: { plan: true },
  });
  const owned = orders.map(order => order.plan).filter(plan => plan === "signature-luxe" || plan === "brand-desk");
  return { pro: orders.some(order => ["monthly", "annual", "lifetime"].includes(order.plan)), owned };
}
// Serialize changes affecting limits and paid access for the same account.
export async function lockUser(client: Prisma.TransactionClient, userId: string) {
  await client.$queryRaw`SELECT id FROM "User" WHERE id = ${userId} FOR UPDATE`;
}
