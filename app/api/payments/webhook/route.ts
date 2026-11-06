import { mercadoPago, verifyWebhook } from "@/lib/mercado-pago";
import { isPlan, plans } from "@/lib/payments/plans";
import { db } from "@/lib/prisma";
import { lockUser } from "@/lib/prisma/signatures";
import { failure } from "@/lib/utils/http";

type Payment = {
  id: number; external_reference?: string; transaction_amount: number;
  currency_id: string; status: string; date_approved?: string;
};
export async function POST(request: Request) {
  const query = new URL(request.url).searchParams;
  const id = query.get("data.id") ?? "";
  if (!/^\d{1,30}$/.test(id) || !verifyWebhook(request, id)) return failure("Assinatura inválida.", 401);
  const event = await request.json().catch(() => null);
  if ((query.get("type") ?? event?.type) !== "payment") return Response.json({ ok: true });
  try {
    const payment = await mercadoPago<Payment>(`/v1/payments/${id}`);
    if (!payment.external_reference || String(payment.id) !== id) return Response.json({ ok: true });
    const order = await db.order.findUnique({ where: { id: payment.external_reference } });
    if (!order || order.provider !== "mercado_pago" || !isPlan(order.plan) || payment.currency_id !== "BRL" || Math.round(payment.transaction_amount * 100) !== order.cents) return Response.json({ ok: true });
    const plan = plans[order.plan];
    const status = payment.status;
    if (!["approved", "refunded", "charged_back", "cancelled", "in_mediation"].includes(status)) return Response.json({ ok: true });
    const approved = payment.date_approved ? new Date(payment.date_approved).getTime() : NaN;
    if (status === "approved" && !Number.isFinite(approved)) return failure("Data de aprovação indisponível.", 503);
    await db.$transaction(async tx => {
      await lockUser(tx, order.userId);
      const current = await tx.order.findUniqueOrThrow({ where: { id: order.id } });
      if (current.paymentId && current.paymentId !== id) return;
      if (status !== "approved") {
        if (current.paymentId === id || ["refunded", "charged_back"].includes(status)) {
          await tx.order.update({ where: { id: order.id }, data: { status, paymentId: id } });
        }
        return;
      }
      if (["refunded", "charged_back", "cancelled"].includes(current.status)) return;
      const active = await tx.order.findFirst({
        where: { userId: order.userId, id: { not: order.id }, status: "approved", expiresAt: { not: null } },
        orderBy: { expiresAt: "desc" }, select: { expiresAt: true },
      });
      const expiresAt = plan.days === null ? null : current.expiresAt ?? new Date(Math.max(approved, active?.expiresAt?.getTime() ?? 0) + plan.days * 86400000);
      await tx.order.update({ where: { id: order.id }, data: { status, paymentId: id, expiresAt } });
    });
    return Response.json({ ok: true });
  } catch { return failure("Não foi possível processar a notificação.", 503); }
}
