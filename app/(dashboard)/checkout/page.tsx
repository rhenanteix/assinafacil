import { PaymentTrust } from "@/components/payments/PaymentTrust";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { currentAccount } from "@/lib/auth";
import { cardPublicKey, checkoutEnabled, paymentDevMode } from "@/lib/abacatepay/config";
import { isPlan, offers, plans, price } from "@/lib/payments/plans";
import { orderView } from "@/lib/payments/orders";
import { db } from "@/lib/prisma";
import { signatureAccess } from "@/lib/prisma/signatures";
import { getLocale, getTranslator } from "@/lib/i18n/server";
import { TransparentCheckout } from "@/components/payments/TransparentCheckout";

export const metadata = { title: "Checkout", robots: { index: false, follow: false } };
export default async function Checkout({ searchParams }: { searchParams: Promise<{ plan?: string; order?: string }> }) {
  const { plan, order: id } = await searchParams;
  if (!isPlan(plan) || !offers.some(offer => offer === plan)) notFound();
  const account = await currentAccount();
  if (!account) redirect("/login?destino=precos");
  if (!account.emailVerified) redirect("/verificar-email?destino=precos");
  const t = await getTranslator();
  const locale = await getLocale();
  const access = await signatureAccess(account.id);
  const owned = (plan === "lifetime" && access.pro) || access.owned.some(item => item === plan);
  const devMode = paymentDevMode();
  const initial = id
    ? await db.order.findFirst({ where: { id, userId: account.id, plan, provider: "abacatepay", devMode } })
    : await db.order.findFirst({ where: { userId: account.id, plan, provider: "abacatepay", devMode, status: { in: ["creating", "pending", "uncertain"] } }, orderBy: { createdAt: "desc" } });
  if (id && !initial) notFound();
  return <div className="shell max-w-3xl py-12">
    <Link href="/precos" className="text-sm text-brand underline">{t("Voltar aos planos")}</Link>
    <h1 className="mt-5 text-3xl font-bold">{t("Finalizar compra")}</h1>
    <p className="mb-6 mt-3 text-lg">{plans[plan].label} · {price(plans[plan].cents, locale)} {t("· pagamento único")}</p>
    {owned && !initial ? <section className="panel"><p>{t("Você já tem acesso a este produto.")}</p><Link className="mt-3 block text-brand underline" href="/dashboard">{t("Abrir minhas assinaturas")}</Link></section> :
      !checkoutEnabled() ? <p role="status" className="panel">{t("O checkout ainda não está configurado.")}</p> :
        <TransparentCheckout plan={plan} cents={plans[plan].cents} email={account.email} publicKey={cardPublicKey()} devMode={devMode} initial={initial ? orderView(initial) : null} />}
    <PaymentTrust />
  </div>;
}
