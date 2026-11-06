import { currentAccount } from "@/lib/auth";
import { abacatePay, chargeSchema, PaymentApiError } from "@/lib/abacatepay/client";
import { cardPublicKey, checkoutEnabled, paymentDevMode } from "@/lib/abacatepay/config";
import { plans } from "@/lib/payments/plans";
import { checkoutInput } from "@/lib/payments/validation";
import { applyCharge, orderView } from "@/lib/payments/orders";
import { db } from "@/lib/prisma";
import { emitPostHogLog, SeverityNumber } from "@/lib/posthog-logs";
import { captureServerEvent } from "@/lib/posthog-server";
import { lockUser, signatureAccess } from "@/lib/prisma/signatures";
import { failure, sameOrigin } from "@/lib/utils/http";

export const runtime = "nodejs";
export async function POST(request: Request) {
  if (!sameOrigin(request)) return failure("Origem inválida.", 403);
  const account = await currentAccount();
  if (!account?.emailVerified) return failure("Entre com um e-mail confirmado para continuar.", 401);
  if (!checkoutEnabled()) return failure("O checkout ainda não está configurado.", 503);
  const raw = await request.text();
  if (raw.length > 8000) return failure("Dados inválidos.", 400);
  let body: unknown;
  try { body = JSON.parse(raw); } catch { return failure("Dados inválidos.", 400); }
  const parsed = checkoutInput.safeParse(body);
  if (!parsed.success) return failure("Confira os dados do pagamento.", 400);
  const { plan, method, requestId, customer, token } = parsed.data;
  if (method === "CARD" && !cardPublicKey()) return failure("Cartão indisponível no momento.", 503);
  const devMode = paymentDevMode();
  const reservation = await db.$transaction(async tx => {
    await lockUser(tx, account.id);
    const access = await signatureAccess(account.id, tx);
    if ((plan === "lifetime" && access.pro) || access.owned.some(owned => owned === plan)) return { owned: true } as const;
    const checkoutKey = `${account.id}:${requestId}`;
    const previous = await tx.order.findUnique({ where: { checkoutKey } });
    if (previous) return { order: previous, created: false };
    // Reuse pending charges even across tabs or retries with different request IDs.
    const pending = await tx.order.findFirst({ where: { userId: account.id, plan, provider: "abacatepay", devMode,
      status: { in: ["creating", "pending", "uncertain"] } }, orderBy: { createdAt: "desc" } });
    if (pending) return { order: pending, created: false };
    const recent = await tx.order.count({ where: { userId: account.id, provider: "abacatepay", createdAt: { gt: new Date(Date.now() - 60000) } } });
    if (recent >= 5) return { limited: true } as const;
    const order = await tx.order.create({ data: { userId: account.id, plan, cents: plans[plan].cents,
      provider: "abacatepay", method, devMode, checkoutKey, status: "creating" } });
    return { order, created: true };
  });
  if ("owned" in reservation) return failure("Você já tem acesso a este produto.", 409);
  if ("limited" in reservation) return failure("Aguarde um minuto antes de tentar novamente.", 429);
  const { order, created } = reservation;
  if (!created) return Response.json({ order: orderView(order) }, { headers: { "Cache-Control": "no-store" } });
  try {
    const charge = chargeSchema.parse(await abacatePay("/transparents/create", {
      method, data: {
        // AbacatePay rejects the middle-dot separator (U+00B7).
        amount: order.cents, description: `Maily - ${plans[plan].label}`,
        metadata: { orderId: order.id },
        ...(method === "PIX" ? { expiresIn: 1800 } : {}),
        ...(customer ? { customer: { ...customer, email: account.email } } : {}),
        ...(method === "CARD" ? { token, installmentCount: 1 } : {}),
      },
    }));
    if (charge.metadata?.orderId && charge.metadata.orderId !== order.id) throw new Error("Invalid reference");
    // The create response belongs to this reserved order, even if metadata is omitted.
    const updated = await applyCharge(order.id, { ...charge, metadata: { orderId: order.id } });
    emitPostHogLog("checkout_provider_charge_created", SeverityNumber.INFO, {
      plan,
      payment_method: method,
      dev_mode: devMode,
    });
    await captureServerEvent({
      distinctId: account.id,
      event: "checkout_started",
      properties: { plan, payment_method: method, amount_cents: order.cents, dev_mode: devMode },
    });
    return Response.json({ order: orderView(updated) }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    emitPostHogLog("checkout_provider_charge_failed", SeverityNumber.ERROR, {
      payment_method: method,
      failure_type: error instanceof PaymentApiError ? "provider_rejection" : "provider_or_network",
    });
    const rejected = error instanceof PaymentApiError && error.definiteRejection;
    await db.order.updateMany({ where: { id: order.id, status: "creating", paymentId: null }, data: { status: rejected ? "failed" : "uncertain" } });
    // Preserve the order for status checks; a webhook can recover an ambiguous response.
    const current = await db.order.findUniqueOrThrow({ where: { id: order.id } });
    console.error("abacatepay.checkout", { orderId: order.id, method,
      status: error instanceof PaymentApiError ? error.status : "uncertain",
      reason: error instanceof PaymentApiError ? error.reason : "response_validation_or_network",
    });
    return Response.json({ order: orderView(current) }, { headers: { "Cache-Control": "no-store" } });
  }
}
