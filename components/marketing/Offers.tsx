import { getTranslator, getLocale } from "@/lib/i18n/server";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CheckoutButton } from "@/components/shared/CheckoutButton";
import { plans, price, type Plan } from "@/lib/payments/plans";
import { checkoutEnabled } from "@/lib/abacatepay/config";

export async function BusinessLink() {
  const t = await getTranslator();
  const email = process.env.BUSINESS_CONTACT_EMAIL;
  return email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ? <Button asChild variant="outline"><a href={`mailto:${email}?subject=AssinaF%C3%A1cil%20Business&body=${encodeURIComponent(t("Empresa: \nTamanho da equipe: \nNecessidade: "))}`}>{t("Solicitar orçamento")}{" "}<ArrowRight size={15} /></a></Button>
    : <p className="text-sm font-medium text-slate-600">{t("Canal comercial em breve.")}</p>;
}

export async function OfferButton({ plan, signedIn }: { plan: Plan; signedIn: boolean }) {
  const t = await getTranslator();
  return checkoutEnabled()
    ? <CheckoutButton plan={plan} signedIn={signedIn} label={plan === "lifetime" ? t("Desbloquear Pro") : t("Comprar modelo")} />
    : <p className="text-sm font-medium text-slate-600">{t("Compra online em breve.")}</p>;
}

export async function Offers({ signedIn = false }: { signedIn?: boolean }) {
  const locale = await getLocale();
  const t = await getTranslator();
  return <div className="grid gap-4 lg:grid-cols-3">
    {[
      { title: "Free", value: price(0, locale), note: t("Para criar sua primeira assinatura"), items: [t("Modelo Essencial com cor e layout fixos"), t("Uma assinatura salva · cadastro confirmado"), t("PNG com marca AssinaFácil")] },
      { title: "Pro", value: price(plans.lifetime.cents, locale), note: t("Pagamento único · acesso sem expiração"), items: [t("12 modelos Pro e o Essencial"), t("Assinaturas salvas ilimitadas"), t("HTML e PNG sem marca"), t("Foto, logo e ícones sociais clicáveis no HTML"), t("Modelos exclusivos vendidos à parte")] },
      { title: "Business", value: t("Sob consulta"), note: t("Para padronizar a assinatura da equipe"), items: [t("Design com a identidade da empresa"), t("Assinaturas personalizadas em lote"), t("Entrega com instruções de instalação")] },
    ].map(plan => <article key={plan.title} className={`panel flex flex-col gap-5 ${plan.title === "Pro" ? "border-2 border-violet-400 shadow-lg shadow-violet-100" : ""}`}>
      <div><p className="eyebrow">{plan.title}</p><h3 className="mt-3 text-4xl font-bold tracking-tight">{plan.value}</h3><p className="mt-2 text-sm text-slate-600">{plan.note}</p></div>
      <ul className="flex-1 space-y-3 text-sm">{plan.items.map(item => <li className="flex items-start gap-2" key={item}><Check size={16} className="mt-0.5 shrink-0 text-brand" />{item}</li>)}</ul>
      {plan.title === "Free" ? <Button asChild variant="outline"><Link href="/gerador">{t("Criar grátis")}</Link></Button> : plan.title === "Pro" ? <OfferButton plan="lifetime" signedIn={signedIn} /> : <BusinessLink />}
    </article>)}
  </div>;
}
