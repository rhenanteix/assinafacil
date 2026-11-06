import { getTranslator, getLocale } from "@/lib/i18n/server";
import Image from "next/image";
import Link from "next/link";
import { publicSiteUrl } from "@/lib/utils/site-url";
import type { Metadata } from "next";
import { ArrowRight, Building2, Check, LayoutTemplate, Mail, Palette, PenLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductShowcase } from "@/components/marketing/ProductShowcase";
import { Reveal } from "@/components/marketing/Reveal";
import { Offers, BusinessLink } from "@/components/marketing/Offers";
import { renderSignature } from "@/lib/utils/signature";
import { demo, templates } from "@/types/signature";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslator();
  return {
    title: { absolute: t("Gerador de assinatura de e-mail profissional | Maily") },
    description: t("Crie uma assinatura de e-mail profissional com logo, foto e contatos. Teste grátis, exporte em HTML ou PNG e padronize as assinaturas da sua empresa."),
    alternates: { canonical: publicSiteUrl()?.href },
  };
}
const highlights = [
  { icon: PenLine, title: "Preencha seus dados", text: "Adicione nome, cargo, empresa e contatos para experimentar o Essencial grátis." },
  { icon: Palette, title: "Coloque sua marca", text: "No premium, escolha um modelo e personalize cores, foto, logo e redes sociais com ícones." },
  { icon: Mail, title: "Leve para o seu e-mail", text: "Confirme seu cadastro para baixar o PNG grátis. Desbloqueie o HTML premium para ter links clicáveis." },
];
const examples = ["modern", "consulting", "sales", "editorial", "signature-luxe", "brand-desk"] as const;

export default async function Home() {
  const t = await getTranslator();
  const locale = await getLocale();
  return <>
    <section className="af-hero relative overflow-hidden">
      <div className="shell relative grid items-center gap-12 pb-20 pt-14 lg:grid-cols-[1.02fr_1fr] lg:gap-16 lg:pb-28 lg:pt-24">
        <div>
          <div className="inline-flex items-center gap-3 rounded-full border border-violet-200/80 bg-white/80 py-1.5 pl-1.5 pr-4 text-xs font-semibold text-violet-800 shadow-sm">
            <span className="grid h-10 w-10 place-items-center overflow-hidden rounded-full bg-violet-100"><Image src="/mascote/boas-vindas.png" alt="" width={1199} height={1312} sizes="40px" priority className="h-10 w-10 object-contain" /></span>
            {" "}{t("Pequenos detalhes. Uma grande impressão.")}{" "}</div>
          <h1 className="mt-5 max-w-2xl text-[clamp(2.8rem,7vw,5.6rem)] font-bold leading-[.98] tracking-[-.075em]">{t("Sua marca em")}{" "}<span className="text-brand">{t("cada e-mail.")}</span></h1>
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-slate-700">{t("Crie uma assinatura profissional em minutos. Para quem atende clientes, fecha negócios e quer levar a identidade da empresa a cada conversa.")}</p>
          <div className="mt-7 flex flex-wrap gap-3"><Button asChild className="min-h-12"><Link href="/gerador">{t("Criar minha assinatura")}{" "}<ArrowRight size={17} /></Link></Button><Button asChild variant="outline" className="min-h-12"><Link href="#modelos">{t("Explorar modelos")}</Link></Button></div>
          <p className="mt-4 flex items-center gap-2 text-sm text-slate-700"><Check size={16} className="text-brand" /> {" "}{t("Modelo grátis, sem cartão")}</p>
        </div>
        <ProductShowcase />
      </div>
    </section>
    <section id="sobre" className="shell scroll-mt-8 py-16 sm:py-20">
      <Reveal className="grid items-start gap-7 lg:grid-cols-2">
        <div><p className="eyebrow">{t("Conheça a Maily")}</p><h2 className="mt-3 max-w-xl text-4xl font-bold tracking-tight sm:text-5xl">{t("Uma ferramenta de marca para o trabalho de todos os dias.")}</h2></div>
        <p className="max-w-lg text-lg leading-relaxed text-slate-700 lg:pt-8">{t("Seu e-mail merece mais que “Att.”. Crie sua assinatura com o Maily.")}</p>
      </Reveal>
      <div className="mt-10 grid gap-4 md:grid-cols-3">{highlights.map(({ icon: Icon, title, text }, index) => <Reveal key={title} className="panel">
        <div className="flex justify-between"><Icon className="text-brand" size={24} /><span className="eyebrow">0{index + 1}</span></div><h3 className="mt-5 text-lg font-bold">{t(title)}</h3><p className="mt-2 text-sm leading-relaxed text-slate-700">{t(text)}</p>
      </Reveal>)}</div>
    </section>
    <section id="modelos" className="scroll-mt-8 border-y border-violet-100 bg-[#f1eeff] py-16 sm:py-20">
      <div className="shell"><p className="eyebrow flex items-center gap-2"><LayoutTemplate size={16} /> {" "}{t("Galeria")}</p><h2 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">{t("Um modelo para cada tipo de negócio")}</h2><p className="mb-8 mt-3 text-slate-700">{t("Os modelos abaixo são premium. Veja uma seleção de estilos para consultoria, vendas, equipes e marcas com identidade própria.")}</p>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{examples.map(id => {
          const template = templates.find(item => item.id === id)!;
          const tier = "exclusive" in template ? t("Exclusivo") : template.pro ? "Pro" : "Free";
          const color = id === "sales" ? "#087c66" : id === "signature-luxe" ? "#936d38" : "#593bec";
          return <Reveal key={id} className="panel transition-shadow hover:shadow-lg"><div className="mb-4 flex items-center justify-between gap-2"><h3 className="font-bold">{t(template.label)}</h3><span className="rounded-full bg-violet-100 px-2.5 py-1 text-xs font-bold text-brand">{tier}</span></div>
            <div className="min-h-36 rounded-xl border border-slate-100 p-2" dangerouslySetInnerHTML={{ __html: renderSignature({ ...demo, role: t(demo.role), company: t(demo.company), template: id, color, instagram: "https://instagram.com/example", linkedin: "https://linkedin.com/in/example" }, template.pro, locale) }} />
          </Reveal>;
        })}</div>
        <div className="mt-6 flex flex-wrap gap-3"><Button asChild><Link href="/gerador">{t("Experimentar no gerador")}{" "}<ArrowRight size={16} /></Link></Button><Button asChild variant="outline"><Link href="/precos#exclusivos">{t("Ver modelos exclusivos")}</Link></Button></div></div>
    </section>
    <section id="planos" className="shell scroll-mt-8 py-16 sm:py-20">
      <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="max-w-3xl"><p className="eyebrow">{t("Free, Pro e Business")}</p><h2 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">{t("Comece grátis. Escolha o que faz sentido para você.")}</h2></div>
        <div className="relative self-center rounded-full bg-emerald-50 p-2 sm:shrink-0"><Image src="/mascote/planos.png" alt={t("Mascote lançando um avião de papel feito de uma nota")} width={1312} height={1199} sizes="(max-width: 640px) 160px, 208px" className="h-auto w-40 sm:w-52" /></div>
      </div><Offers />
    </section>
    <section id="empresas" className="shell scroll-mt-8"><Reveal className="grid gap-8 rounded-[2rem] bg-[#201344] p-6 text-white sm:p-10 lg:grid-cols-[1.2fr_1fr]">
      <div><p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-lime-200"><Building2 size={16} /> Maily Business</p><h2 className="mt-4 text-4xl font-bold tracking-tight">{t("Uma identidade para a equipe inteira.")}</h2><p className="mt-4 max-w-xl leading-relaxed text-violet-100">{t("Definimos um modelo com sua marca e preparamos um lote com os dados de cada pessoa. Sua empresa recebe as assinaturas prontas para instalar.")}</p><div className="mt-6 [&_p]:text-violet-100"><BusinessLink /></div></div>
      <ol className="space-y-3 self-center text-sm">{[t("Alinhamento de identidade visual"), t("Validação de uma assinatura piloto"), t("Produção em lote e guia de instalação")].map((item, index) => <li key={item} className="flex items-center gap-3 rounded-xl border border-white/20 p-3"><span className="grid h-8 w-8 place-items-center rounded-full bg-lime-200 font-bold text-[#201344]">{index + 1}</span>{item}</li>)}</ol>
    </Reveal></section>
    <section className="shell py-16"><h2 className="text-3xl font-bold tracking-tight">{t("Perguntas frequentes")}</h2><div className="mt-5 grid gap-3">
      {[
        [t("Qual modelo é grátis?"), t("O Essencial é grátis. Tem layout e cor fixos, campos de nome, cargo, empresa, telefone e e-mail. Confirme seu cadastro para salvar uma assinatura e baixar o PNG com a marca Maily.")],
        [t("O Pro tem mensalidade?"), t("O Pro tem pagamento único e acesso sem expiração aos modelos incluídos no plano. Os modelos exclusivos são vendidos individualmente.")],
        [t("Qual é a diferença entre HTML e PNG?"), t("O HTML permite manter links clicáveis em clientes compatíveis. O PNG é uma imagem e pode ser inserido onde o cliente de e-mail aceitar imagens.")],
        [t("Como funciona o Business?"), t("O orçamento depende do tamanho do lote e da personalização. A empresa aprova um modelo piloto antes da produção das assinaturas.")],
      ].map(([question, answer]) => <details key={question} className="rounded-xl border border-violet-100 bg-white p-4"><summary className="cursor-pointer font-semibold">{question}</summary><p className="mt-2 text-sm leading-relaxed text-slate-700">{answer}</p></details>)}
    </div></section>
    <section className="shell">
      <Reveal className="relative grid items-center gap-4 overflow-hidden rounded-[2rem] border border-violet-200 bg-gradient-to-br from-violet-50 via-white to-violet-100 px-6 py-8 sm:px-10 md:grid-cols-[1fr_.75fr]">
        <div className="relative z-10"><p className="eyebrow">{t("Pronto para o próximo e-mail?")}</p><h2 className="mt-3 max-w-xl text-3xl font-bold tracking-tight sm:text-4xl">{t("Sua marca pronta para chegar mais longe.")}</h2><p className="mt-4 max-w-lg leading-relaxed text-slate-600">{t("Dê um toque de personalidade a cada conversa. Crie sua assinatura e leve uma boa primeira impressão com você.")}</p><Button asChild className="mt-6 min-h-12"><Link href="/gerador">{t("Criar minha assinatura")}{" "}<ArrowRight size={16} /></Link></Button></div>
        <Image src="/mascote/entrega.png" alt={t("Mascote levando um envelope de e-mail")} width={1536} height={1024} sizes="(max-width: 768px) 280px, 420px" className="mx-auto h-auto w-full max-w-[280px] md:max-w-[420px]" />
      </Reveal>
    </section>
  </>;
}
