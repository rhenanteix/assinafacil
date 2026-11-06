import { verifiedUserId } from "@/lib/auth";
import { Offers, OfferButton } from "@/components/marketing/Offers";
import { plans, price } from "@/lib/mercado-pago/plans";
export const metadata = { title: "Preços e modelos exclusivos" };

export default async function Pricing() {
  const signedIn = Boolean(await verifiedUserId());
  return <div className="shell space-y-10 py-14">
    <div><p className="eyebrow">Planos</p><h1 className="mt-3 text-4xl font-bold">Escolha como você quer assinar</h1>
      <p className="mt-3 text-slate-600">Comece grátis, desbloqueie o Pro com pagamento único ou personalize a assinatura da empresa inteira.</p></div>
    <Offers signedIn={signedIn} />
    <section id="exclusivos"><h2 className="text-2xl font-bold">Modelos exclusivos</h2>
      <p className="mb-5 mt-2 text-slate-600">Comprados individualmente. Podem ser usados sem Pro. O modelo comprado exporta sem marca. O limite de assinaturas salvas acompanha seu plano.</p>
      <div className="grid gap-4 sm:grid-cols-2">{(["signature-luxe", "brand-desk"] as const).map(plan =>
        <article className="panel space-y-3" key={plan}><h3 className="font-bold">{plans[plan].label}</h3><p>{price(plans[plan].cents)} · pagamento único</p><OfferButton plan={plan} signedIn={signedIn} /></article>
      )}</div>
    </section>
  </div>;
}
