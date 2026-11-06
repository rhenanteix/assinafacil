import type { Order } from "@prisma/client";
import { db } from "@/lib/prisma";
import { lockUser } from "@/lib/prisma/signatures";
import { getCharge, type Charge } from "@/lib/abacatepay/client";
import { nextPaymentStatus, paymentStatus, publicPaymentData, type CheckoutOrder } from "./state";

export function orderView(order: Order): CheckoutOrder {
  return { id: order.id, plan: order.plan, cents: order.cents, status: order.status, method: order.method,
    devMode: order.devMode, paymentData: (order.paymentData ?? {}) as Record<string, string> };
}
export async function applyCharge(orderId: string, charge: Charge, eventId?: string) {
  const order = await db.order.findUniqueOrThrow({ where: { id: orderId } });
  if (order.provider !== "abacatepay" || order.cents !== charge.amount || order.devMode !== charge.devMode ||
    (charge.metadata?.orderId && charge.metadata.orderId !== order.id)) throw new Error("Charge mismatch");
  const method = charge.id.startsWith("card_") ? "CARD" : charge.id.startsWith("bole_") ? "BOLETO" : "PIX";
  if (order.method !== method) throw new Error("Payment method mismatch");
  const incoming = paymentStatus(charge.status);
  if (!incoming) throw new Error("Unknown payment status");
  const at = new Date(charge.updatedAt);
  return db.$transaction(async tx => {
    await lockUser(tx, order.userId);
    const current = await tx.order.findUniqueOrThrow({ where: { id: orderId } });
    if (current.paymentId && current.paymentId !== charge.id) throw new Error("Payment already bound");
    if (!current.paymentId && charge.metadata?.orderId !== orderId) throw new Error("Missing charge reference");
    if (eventId && await tx.paymentEvent.findUnique({ where: { id: eventId } })) return current;
    const status = nextPaymentStatus(current.status, incoming, current.paymentUpdatedAt, at);
    const stale = current.paymentUpdatedAt && at < current.paymentUpdatedAt;
    const updated = await tx.order.update({ where: { id: orderId }, data: {
      paymentId: charge.id, status,
      ...(!stale ? { paymentUpdatedAt: at, paymentData: { ...(current.paymentData as Record<string, string> ?? {}), ...publicPaymentData(charge) } } : {}),
    } });
    if (eventId) await tx.paymentEvent.create({ data: { id: eventId } });
    return updated;
  });
}
export async function refreshOrder(order: Order) {
  if (!order.paymentId || order.provider !== "abacatepay") return order;
  // Across instances, only one reader may query the provider every ten seconds.
  const claimed = await db.order.updateMany({ where: { id: order.id, OR: [
    { lastCheckedAt: null }, { lastCheckedAt: { lt: new Date(Date.now() - 10000) } },
  ] }, data: { lastCheckedAt: new Date() } });
  if (!claimed.count) return db.order.findUniqueOrThrow({ where: { id: order.id } });
  const charge = await getCharge(order.paymentId);
  if (charge.id !== order.paymentId) throw new Error("Payment ID mismatch");
  return applyCharge(order.id, charge);
}
