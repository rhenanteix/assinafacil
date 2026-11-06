import { checkoutEnabled } from "@/lib/mercado-pago/config";
import { verifiedUserId } from "@/lib/auth";
import { mercadoPago } from "@/lib/mercado-pago";
import { isPlan, offers, plans } from "@/lib/mercado-pago/plans";
import { db } from "@/lib/prisma";
import { failure, sameOrigin } from "@/lib/utils/http";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return failure("Origem inválida.", 403);
  const userId = await verifiedUserId();
  if (!userId) return failure("Entre com um e-mail confirmado para continuar.", 401);
  const plan = (await request.json().catch(() => null))?.plan;
  if (!isPlan(plan) || !offers.some(offer => offer === plan)) return failure("Plano inválido.", 400);
  const base = process.env.NEXTAUTH_URL;
  if (!base || !checkoutEnabled()) return failure("O checkout ainda não está configurado.", 503);
  const { cents, label } = plans[plan];
  try {
    const order = await db.order.create({ data: { userId, plan, cents } });
    const redirect = (status: string) => new URL(`/dashboard?pagamento=${status}`, base).href;
    const preference = await mercadoPago<{ init_point: string; sandbox_init_point?: string }>("/checkout/preferences", {
      items: [{ id: plan, title: `AssinaFácil · ${label}`, currency_id: "BRL", quantity: 1, unit_price: cents / 100 }],
      external_reference: order.id,
      auto_return: "approved",
      back_urls: { success: redirect("retorno"), pending: redirect("pendente"), failure: redirect("falhou") },
      payment_methods: { excluded_payment_types: [{ id: "ticket" }, { id: "atm" }], installments: 1 },
    });
    const url = new URL(process.env.MP_SANDBOX === "true" ? preference.sandbox_init_point ?? preference.init_point : preference.init_point);
    if (url.protocol !== "https:" || !/(^|\.)mercadopago\.com(\.br)?$/.test(url.hostname)) throw new Error("URL inválida");
    return Response.json({ url: url.href });
  } catch { return failure("Não foi possível iniciar o pagamento.", 502); }
}
