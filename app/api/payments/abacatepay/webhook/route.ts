import { z } from "zod";
import { verifyAbacateWebhook } from "@/lib/abacatepay/security";
import { chargeSchema, getCharge } from "@/lib/abacatepay/client";
import { paymentDevMode } from "@/lib/abacatepay/config";
import { applyCharge } from "@/lib/payments/orders";
import { plans, isPlan } from "@/lib/payments/plans";
import { db } from "@/lib/prisma";
import { captureServerEvent } from "@/lib/posthog-server";
import { failure } from "@/lib/utils/http";

export const runtime = "nodejs";
const envelope = z.object({ id: z.string().min(1).max(200), event: z.string(), apiVersion: z.literal(2), devMode: z.boolean(), data: z.unknown() });
export async function POST(request: Request) {
  const raw = await request.text();
  if (raw.length > 1000000) return failure("Payload too large", 413);
  if (!verifyAbacateWebhook(request, raw)) return failure("Invalid webhook authentication", 401);
  let body: unknown;
  try { body = JSON.parse(raw); } catch { return failure("Invalid JSON", 400); }
  const event = envelope.safeParse(body);
  if (!event.success) return failure("Invalid event", 400);
  if (!["transparent.completed", "transparent.refunded", "transparent.disputed", "transparent.lost"].includes(event.data.event)) return Response.json({ ok: true });
  if (event.data.devMode !== paymentDevMode()) return failure("Environment mismatch", 400);
  const eventId = `abacatepay:${event.data.id}`;
  try {
    if (await db.paymentEvent.findUnique({ where: { id: eventId } })) return Response.json({ ok: true });
    const data = event.data.data as { transparent?: unknown } | null;
    const charge = chargeSchema.parse(data?.transparent);
    if (charge.devMode !== event.data.devMode) return failure("Environment mismatch", 400);
    const order = await db.order.findFirst({ where: { provider: "abacatepay", OR: [
      { paymentId: charge.id }, ...(charge.metadata?.orderId ? [{ id: charge.metadata.orderId }] : []),
    ] } });
    if (!order) return Response.json({ ok: true }); // Another application in the same store.
    // Re-read current state so delayed completion notifications cannot undo a refund/dispute.
    const current = await getCharge(charge.id);
    if (current.id !== charge.id) throw new Error("Payment ID mismatch");
    const updated = await applyCharge(order.id, current, eventId);
    const planLabel = isPlan(updated.plan) ? plans[updated.plan].label : updated.plan;
    const baseProperties = {
      plan: updated.plan,
      plan_label: planLabel,
      amount_cents: updated.cents,
      payment_method: updated.method,
      order_id: updated.id,
      dev_mode: updated.devMode,
    };
    if (event.data.event === "transparent.completed" && updated.status === "approved") {
      await captureServerEvent({
        distinctId: updated.userId,
        event: "payment_completed",
        properties: baseProperties,
      });
    } else if (event.data.event === "transparent.refunded") {
      await captureServerEvent({
        distinctId: updated.userId,
        event: "payment_refunded",
        properties: baseProperties,
      });
    } else if (event.data.event === "transparent.disputed") {
      await captureServerEvent({
        distinctId: updated.userId,
        event: "payment_disputed",
        properties: baseProperties,
      });
    } else if (event.data.event === "transparent.lost") {
      await captureServerEvent({
        distinctId: updated.userId,
        event: "payment_failed",
        properties: { ...baseProperties, reason: "lost_or_failed" },
      });
    }
    return Response.json({ ok: true });
  } catch {
    console.error("abacatepay.webhook", { eventId });
    return failure("Unable to process payment event", 503);
  }
}
