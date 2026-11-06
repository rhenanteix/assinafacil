import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CheckoutButton } from "@/components/shared/CheckoutButton";
import { plans, price, type Plan } from "@/lib/mercado-pago/plans";
import { checkoutEnabled } from "@/lib/mercado-pago/config";

export function BusinessLink() {
  const email = process.env.BUSINESS_CONTACT_EMAIL;
  return email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ? <Button asChild variant="outline"><a href={`mailto:${email}?subject=AssinaF%C3%A1cil%20Business&body=Empresa%3A%20%0ATamanho%20da%20equipe%3A%20%0ANecessidade%3A%20`}>Solicitar orçamento <ArrowRight size={15} /></a></Button>
    : <p className="text-sm font-medium text-slate-600">Canal comercial em breve.</p>;
}

export function OfferButton({ plan, signedIn }: { plan: Plan; signedIn: boolean }) {
  return checkoutEnabled()
    ? <CheckoutButton plan={plan} signedIn={signedIn} label={plan === "lifetime" ? "Desbloquear Pro" : "Comprar modelo"} />
    : <p className="text-sm font-medium text-slate-600">Compra online em breve.</p>;
}

export function Offers({ signedIn = false }: { signedIn?: boolean }) {
  return <div className="grid gap-4 lg:grid-cols-3">
    {[
      { title: "Free", value: "R$ 0", note: "Para criar sua primeira assinatura", items: ["Modelo Essencial com cor e layout fixos", "Uma assinatura salva · cadastro confirmado", "PNG com marca AssinaFácil"] },
      { title: "Pro", value: price(plans.lifetime.cents), note: "Pagamento único · acesso sem expiração", items: ["12 modelos Pro e o Essencial", "Assinaturas salvas ilimitadas", "HTML e PNG sem marca", "Foto, logo e ícones sociais clicáveis no HTML", "Modelos exclusivos vendidos à parte"] },
      { title: "Business", value: "Sob consulta", note: "Para padronizar a assinatura da equipe", items: ["Design com a identidade da empresa", "Assinaturas personalizadas em lote", "Entrega com instruções de instalação"] },
    ].map(plan => <article key={plan.title} className={`panel flex flex-col gap-5 ${plan.title === "Pro" ? "border-2 border-violet-400 shadow-lg shadow-violet-100" : ""}`}>
      <div><p className="eyebrow">{plan.title}</p><h3 className="mt-3 text-4xl font-bold tracking-tight">{plan.value}</h3><p className="mt-2 text-sm text-slate-600">{plan.note}</p></div>
      <ul className="flex-1 space-y-3 text-sm">{plan.items.map(item => <li className="flex items-start gap-2" key={item}><Check size={16} className="mt-0.5 shrink-0 text-brand" />{item}</li>)}</ul>
      {plan.title === "Free" ? <Button asChild variant="outline"><Link href="/gerador">Criar grátis</Link></Button> : plan.title === "Pro" ? <OfferButton plan="lifetime" signedIn={signedIn} /> : <BusinessLink />}
    </article>)}
  </div>;
}
