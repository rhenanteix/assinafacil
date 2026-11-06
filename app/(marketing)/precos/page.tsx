import { getTranslator, getLocale } from "@/lib/i18n/server";
import { verifiedUserId } from "@/lib/auth";
import { Offers, OfferButton } from "@/components/marketing/Offers";
import { plans, price } from "@/lib/payments/plans";
import { ModelGallery } from "@/components/marketing/PricingDetails";
import { demo, templates } from "@/types/signature";
import { renderSignature } from "@/lib/utils/signature";

export async function generateMetadata() {
  const t = await getTranslator();
  return { title: t("Preços e modelos exclusivos") };
}

export default async function Pricing() {
  const locale = await getLocale();
  const t = await getTranslator();
  const models = templates.map(model => ({
    id: model.id, label: t(model.label),
    tier: "exclusive" in model ? t("Exclusivo") : model.pro ? "Pro" : "Free",
    html: renderSignature({ ...demo, role: t(demo.role), company: t(demo.company), template: model.id }, model.pro, locale),
  }));
  const signedIn = Boolean(await verifiedUserId());
  return <div className="shell space-y-10 py-14">
    <div><p className="eyebrow">{t("Planos")}</p><h1 className="mt-3 text-4xl font-bold">{t("Escolha como você quer assinar")}</h1>
      <p className="mt-3 text-slate-600">{t("Comece grátis, desbloqueie o Pro com pagamento único ou personalize a assinatura da empresa inteira.")}</p></div>
    <Offers signedIn={signedIn} />
    {/* TODO [CONFIRMAR]: formas de pagamento aceitas, garantia/reembolso e emissão de nota fiscal. */}
    <aside aria-label={t("Informações de compra")} className="panel grid gap-4 text-sm sm:grid-cols-3">
      <p>{t("Formas de pagamento: a confirmar")}</p>
      <p>{t("Garantia e reembolso: a confirmar")}</p>
      <p>{t("Emissão de nota fiscal: a confirmar")}</p>
    </aside>
    <ModelGallery models={models} />
    <section id="exclusivos"><h2 className="text-2xl font-bold">{t("Modelos exclusivos")}</h2>
      <p className="mb-5 mt-2 text-slate-600">{t("Comprou um modelo exclusivo no plano Free? Você exporta esse modelo sem marca, mas continua com 1 assinatura salva. Com o Pro, as assinaturas salvas são ilimitadas.")}</p>
      <div className="grid gap-4 sm:grid-cols-2">{(["signature-luxe", "brand-desk"] as const).map(plan =>
        <article className="panel space-y-3" key={plan}><h3 className="font-bold">{plans[plan].label}</h3><p>{price(plans[plan].cents, locale)} {" "}{t("· pagamento único")}</p><OfferButton plan={plan} signedIn={signedIn} /></article>
      )}</div>
    </section>
    <section aria-labelledby="comparison-title" className="space-y-4">
      <h2 id="comparison-title" className="text-2xl font-bold">{t("Free ou Pro: compare")}</h2>
      <div className="overflow-x-auto rounded-2xl border border-slate-200"><table className="w-full text-left text-sm">
        <caption className="sr-only">{t("Comparação dos planos Free e Pro")}</caption>
        <thead className="bg-violet-50"><tr>{["Recurso", "Free", "Pro"].map(label => <th key={label} scope="col" className="p-4">{t(label)}</th>)}</tr></thead>
        <tbody>{[
          ["Formato de entrega", "PNG", "HTML e PNG"],
          ["Links clicáveis", "Não", "Sim, no HTML"],
          ["Marca d’água", "Sim, no Essencial Free", "Sem marca"],
          ["Assinaturas salvas", "1", "Ilimitadas"],
          ["Quantidade de modelos", "1 (Essencial)", "13 (Essencial + 12 Pro)"],
        ].map(([label, free, pro]) => <tr key={label} className="border-t border-slate-200"><th scope="row" className="p-4 font-medium">{t(label)}</th><td className="p-4">{t(free)}</td><td className="p-4">{t(pro)}</td></tr>)}</tbody>
      </table></div>
      <p className="text-sm text-slate-600">{t("Modelos exclusivos vendidos à parte")}</p>
    </section>
    <section aria-labelledby="faq-title" className="space-y-4">
      <h2 id="faq-title" className="text-2xl font-bold">{t("Perguntas frequentes")}</h2>
      <details className="panel"><summary className="cursor-pointer font-semibold">{t("Como usar o PNG no Gmail e no Outlook?")}</summary>
        <div className="mt-4 grid gap-5 text-sm text-slate-700 sm:grid-cols-2">
          {[
            { title: "Gmail (web)", steps: ["Baixe o PNG da sua assinatura.", "Abra Configurações → Ver todas as configurações → Geral → Assinatura.", "Crie uma assinatura e use Inserir imagem para carregar o PNG.", "Defina quando usá-la e salve as alterações."], url: "https://support.google.com/mail/answer/8395?hl=pt-BR" },
            { title: "Outlook (web / novo Outlook)", steps: ["Baixe o PNG da sua assinatura.", "Abra Configurações → Contas → Assinaturas (o caminho varia por versão).", "Crie uma assinatura e insira o PNG pelo botão de imagem.", "Escolha os padrões para novas mensagens e respostas e salve."], url: "https://support.microsoft.com/en-us/outlook/mail/how-to-add-and-change-an-email-signature-in-outlook" },
          ].map(group => <div key={group.title}><h3 className="font-bold">{t(group.title)}</h3><ol className="ml-5 mt-2 list-decimal space-y-2">{group.steps.map(step => <li key={step}>{t(step)}</li>)}</ol><a href={group.url} className="mt-3 inline-block text-brand underline">{t("Instruções oficiais")}</a></div>)}
        </div>
      </details>
      <details className="panel"><summary className="cursor-pointer font-semibold">{t("Funciona no Gmail, Outlook e Apple Mail?")}</summary><p className="mt-3 text-sm text-slate-700">{t("Os formatos PNG e HTML podem ser usados nesses clientes. A instalação e a aparência variam por versão; aplicativos móveis podem limitar imagens e HTML. Faça um envio de teste antes de usar e lembre que o destinatário pode bloquear imagens externas.")}</p></details>
      <details className="panel"><summary className="cursor-pointer font-semibold">{t("Qual a diferença entre PNG e HTML?")}</summary><p className="mt-3 text-sm text-slate-700">{t("PNG é uma imagem: mantém o visual, mas seus contatos e ícones não têm links individuais clicáveis. HTML organiza texto, foto e ícones com links; a aparência pode variar conforme o cliente de e-mail. No Pro, você pode exportar nos dois formatos.")}</p></details>
    </section>
  </div>;
}
