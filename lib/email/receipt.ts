import { db } from "@/lib/prisma";
import { lockUser } from "@/lib/prisma/signatures";
import { sendTransactionalEmail } from "./send";
import { isPlan, plans, price } from "@/lib/payments/plans";
export async function sendPaymentReceipt(orderId: string) {
  if (!process.env.RESEND_API_KEY || !process.env.VERIFICATION_FROM_EMAIL) return;
  try {
    const order = await db.order.findUnique({ where: { id: orderId } });
    if (!order || order.status !== "approved" || order.receiptSentAt || order.devMode) return;
    const claimed = await db.$transaction(async tx => {
      await lockUser(tx, order.userId);
      const current = await tx.order.findUniqueOrThrow({ where: { id: orderId } });
      const now = Date.now();
      if (current.status !== "approved" || current.receiptSentAt || (current.receiptClaimedAt && now - current.receiptClaimedAt.getTime() < 120000)) return null;
      // Never automatically resend outside the provider's 24-hour deduplication window.
      if (current.receiptAttemptedAt && now - current.receiptAttemptedAt.getTime() >= 23 * 3600000) return null;
      const account = await tx.user.findUniqueOrThrow({ where: { id: current.userId }, select: { email: true } });
      await tx.order.update({ where: { id: orderId }, data: { receiptAttemptedAt: current.receiptAttemptedAt ?? new Date(), receiptClaimedAt: new Date() } });
      return { order: current, email: account.email };
    });
    if (!claimed) return;
    const label = isPlan(claimed.order.plan) ? plans[claimed.order.plan].label : claimed.order.plan;
    await sendTransactionalEmail({
      to: claimed.email, key: `receipt-${orderId}`, subject: "Pagamento confirmado — Maily",
      text: `Seu pagamento foi confirmado.\n\nPedido: ${orderId}\nProduto: ${label}\nValor: ${price(claimed.order.cents)}\n\nEste é um recibo de pagamento, não uma nota fiscal. Acesse sua conta Maily para usar o produto. Para suporte ou arrependimento em até 7 dias, utilize o canal informado em Ajuda no site.`,
    });
    await db.order.update({ where: { id: orderId }, data: { receiptSentAt: new Date() } });
  } catch { console.error("receipt.send_unconfirmed", { orderId }); }
}
