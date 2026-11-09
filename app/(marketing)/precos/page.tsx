import Link from "next/link";
import { getTranslator, getLocale } from "@/lib/i18n/server";
import { verifiedUserId } from "@/lib/auth";
import { Offers, OfferButton } from "@/components/marketing/Offers";
import { plans, price } from "@/lib/payments/plans";
import { ModelGallery } from "@/components/marketing/PricingDetails";
import { demoDemos, templates, toEssential } from "@/types/signature";
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
    html: renderSignature({ ...(model.pro ? demoDemos[model.id] : toEssential(demoDemos[model.id])), role: t(demoDemos[model.id].role), company: t(demoDemos[model.id].company), template: model.id }, model.pro, locale),
  }));
  const signedIn = Boolean(await verifiedUserId());
  return <div className="shell space-y-10 py-14">
    <div><p className="eyebrow">{t("Planos")}</p><h1 className="mt-3 text-4xl font-bold">{t("Escolha como você quer assinar")}</h1>
      <p className="mt-3 text-slate-600">{t("Comece grátis, desbloqueie o Pro com pagamento único ou personalize a assinatura da empresa inteira.")}</p></div>
    <Offers signedIn={signedIn} />
    <section className="panel border-violet-200 bg-violet-50/50"><p className="eyebrow">Feito para quem trabalha no Brasil</p><h2 className="mt-3 text-2xl font-bold">Seu WhatsApp. Seu registro. Sua profissão.</h2><p className="mt-3 leading-7 text-slate-600">CRECI, OAB, CRM, CRC, CNPJ, endereço e aviso legal: campos opcionais que você escolhe mostrar, inclusive no Free. No Pro, acrescente a identidade visual da sua marca.</p><p className="mt-3 text-sm text-slate-600"><strong>Pagamento:</strong> valores em reais (BRL), via Pix, boleto ou cartão (AbacatePay). O preço em dólar, quando exibido, é fixo (não convertido diariamente) e a contratação em USD é <strong>sob consulta/verificação do provedor</strong> — Pix e boleto não funcionam em USD.</p><div className="mt-4 flex flex-wrap gap-3"><Link href="/assinatura-de-email-para-corretor" className="text-sm font-semibold text-brand underline">Assinaturas para corretores</Link><Link href="/gerador" className="text-sm font-semibold text-brand underline">Montar a minha assinatura</Link></div></section>

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
          ["Formato de entrega", "HTML e PNG", "HTML e PNG"],
          ["Links clicáveis", "Sim, no HTML", "Sim, no HTML"],
          ["Marca d’água", "Sim, no Essencial Free", "Sem marca"],
          ["Assinaturas salvas", "1", "Ilimitadas"],
          ["Quantidade de modelos", "1 (Essencial)", "25 (Essencial + 24 Pro incluídos)"],
          ["Cores da sua marca", "Cor fixa", "Personalizáveis"],
          ["Foto e logo", "Não", "Sim"],
          ["Ícones e links de redes sociais", "Não", "Sim"],
          ["Modelo com banner", "Não", "Sim"],
          ["WhatsApp e campos profissionais", "Sim", "Sim"],
          ["Renovação de pagamento", "Grátis", "Sem mensalidade"],
        ].map(([label, free, pro]) => <tr key={label} className="border-t border-slate-200"><th scope="row" className="p-4 font-medium">{t(label)}</th><td className="p-4">{t(free)}</td><td className="p-4">{t(pro)}</td></tr>)}</tbody>
      </table></div>
      <p className="text-sm text-slate-600">{t("Modelos exclusivos vendidos à parte")}</p>
    </section>
    <section aria-labelledby="faq-title" className="space-y-4">
      <h2 id="faq-title" className="text-2xl font-bold">{t("Perguntas frequentes")}</h2>
      <details className="panel"><summary className="cursor-pointer font-semibold">O que está incluído no Pro sem expiração?</summary><p className="mt-3 text-sm leading-6 text-slate-700">Uma compra, sem renovação periódica: o Essencial, os 24 modelos Pro incluídos (atuais) e suas atualizações, além da hospedagem das imagens usadas nas assinaturas enquanto o serviço estiver em operação. Novos modelos exclusivos e serviços personalizados não estão incluídos. <strong>“Sem expiração”</strong> significa acesso sem prazo de expiração enquanto o Maily estiver no ar; não é garantia de operação perpétua. Se o serviço for encerrado, avisaremos com antecedência e você poderá exportar suas assinaturas. <Link href="/termos" className="text-brand underline">Leia o escopo completo.</Link></p></details>
      <details className="panel"><summary className="cursor-pointer font-semibold">Outlook desktop, Apple Mail e celular: como instalar?</summary><p className="mt-3 text-sm leading-6 text-slate-700">No Outlook clássico, crie uma mensagem e abra Assinatura → Assinaturas. No Mail do Mac, abra Ajustes → Assinaturas. No celular, configure a assinatura em cada app e conta; alguns editores aceitam apenas texto. Cole o conteúdo formatado, salve e faça um envio real, inclusive em modo escuro.</p><div className="mt-3 flex flex-wrap gap-4 text-sm"><Link href="/assinatura-no-outlook" className="text-brand underline">Passos para Outlook</Link><Link href="/ajuda" className="text-brand underline">Apple Mail e celular</Link><Link href="/compatibilidade" className="text-brand underline">Testes por modelo</Link></div></details>
      <details className="panel"><summary className="cursor-pointer font-semibold">Como comparar com ferramentas por assinatura?</summary><p className="mt-3 text-sm leading-6 text-slate-700">Compare o custo total no período em que pretende usar: mensalidade × meses, além de eventuais cobranças por pessoa. Na Maily, o Pro é uma compra única com o escopo descrito nestes termos. Confira o preço e as condições atuais de qualquer outra ferramenta antes de decidir.</p></details>
      <details className="panel"><summary className="cursor-pointer font-semibold">{t("Como instalar o HTML?")}</summary><p className="mt-3 text-sm text-slate-700">{t("Clique em Copiar HTML e cole no campo de assinatura do seu e-mail. Se o navegador copiar apenas o código, salve-o como arquivo .html, abra no navegador e copie a assinatura exibida.")}</p></details>
      <details className="panel"><summary className="cursor-pointer font-semibold">{t("Como usar o PNG no Gmail e no Outlook?")}</summary>
        <div className="mt-4 grid gap-5 text-sm text-slate-700 sm:grid-cols-2">
          {[
            { title: "Gmail (web)", steps: ["Baixe o PNG da sua assinatura.", "Abra Configurações → Ver todas as configurações → Geral → Assinatura.", "Crie uma assinatura e use Inserir imagem para carregar o PNG.", "Defina quando usá-la e salve as alterações."], url: "https://support.google.com/mail/answer/8395?hl=pt-BR" },
            { title: "Outlook (web / novo Outlook)", steps: ["Baixe o PNG da sua assinatura.", "Abra Configurações → Contas → Assinaturas (o caminho varia por versão).", "Crie uma assinatura e insira o PNG pelo botão de imagem.", "Escolha os padrões para novas mensagens e respostas e salve."], url: "https://support.microsoft.com/pt-br/outlook/officeweb/create-a-signature-and-automatic-reply" },
          ].map(group => <div key={group.title}><h3 className="font-bold">{t(group.title)}</h3><ol className="ml-5 mt-2 list-decimal space-y-2">{group.steps.map(step => <li key={step}>{t(step)}</li>)}</ol><a href={group.url} className="mt-3 inline-block text-brand underline">{t("Instruções oficiais")}</a></div>)}
        </div>
      </details>
      <details className="panel"><summary className="cursor-pointer font-semibold">{t("Funciona no Gmail, Outlook e Apple Mail?")}</summary><p className="mt-3 text-sm text-slate-700">{t("Os formatos PNG e HTML podem ser usados nesses clientes. A instalação e a aparência variam por versão; aplicativos móveis podem limitar imagens e HTML. Faça um envio de teste antes de usar e lembre que o destinatário pode bloquear imagens externas.")}</p></details>
      <details className="panel"><summary className="cursor-pointer font-semibold">{t("Qual a diferença entre PNG e HTML?")}</summary><p className="mt-3 text-sm text-slate-700">{t("HTML mantém os contatos clicáveis. PNG é uma imagem sem links individuais. Os dois formatos estão disponíveis no Free e no Pro.")}</p></details>
    </section>
  </div>;
}
