import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { professionPacksEnabled } from "@/lib/feature-flags";
import { getProfessionBySlug, professionPacks } from "@/lib/professions";
import { renderSignature } from "@/lib/utils/signature";
import { templates } from "@/types/signature";
import { getLocale, getTranslator } from "@/lib/i18n/server";
import { ProfessionPageView } from "@/components/shared/ProfessionPageView";

export function generateStaticParams() {
  if (!professionPacksEnabled()) return [];
  return professionPacks.map(p => ({ profissao: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ profissao: string }> }): Promise<Metadata> {
  const t = await getTranslator();
  const pack = getProfessionBySlug((await params).profissao);
  if (!pack || !professionPacksEnabled()) return { title: t("Modelos") };
  const desc = `${pack.seo.forWho} ${pack.seo.whyItWorks}`.slice(0, 160);
  return {
    title: `Assinatura de e-mail para ${pack.name}`,
    description: desc,
    openGraph: { title: `Assinatura de e-mail para ${pack.name} | Maily`, description: desc, type: "website" },
    alternates: { canonical: `/modelos/${pack.slug}` },
  };
}

export default async function ProfessionModelPage({ params }: { params: Promise<{ profissao: string }> }) {
  if (!professionPacksEnabled()) notFound();
  const locale = await getLocale();
  const t = await getTranslator();
  const pack = getProfessionBySlug((await params).profissao);
  if (!pack) notFound();
  const preview = { ...pack.example, professionId: pack.id, ctaLabel: pack.cta.label, ctaType: pack.cta.type, ctaUrl: "", signoff: "", legalNotice: pack.notice.text ? pack.notice.text.slice(0, 120) : "" } as any;
  return <article className="shell max-w-5xl py-14"><ProfessionPageView slug={pack.slug} />
    <Link href="/gerador" className="text-sm text-brand">← {t("Gerador")}</Link>
    <p className="eyebrow mt-8">{t("Pacote por profissão")}</p>
    <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">{t("Assinatura de e-mail para")} {pack.name}</h1>
    <p className="mt-5 max-w-2xl text-lg leading-relaxed text-slate-600">{pack.seo.forWho}</p>
    <div className="mt-8 grid gap-8 lg:grid-cols-[1.1fr_.9fr]">
      <div className="panel"><h2 className="text-xl font-bold">{t("Exemplo")}</h2><div className="mt-4 overflow-x-auto rounded-xl border border-slate-100 bg-white p-3" dangerouslySetInnerHTML={{ __html: renderSignature(preview, true, locale) }} /><p className="mt-3 text-xs text-slate-500">{t("Exemplo fictício, apenas para demonstração.")}</p></div>
      <div className="space-y-5">
        <section className="panel"><h2 className="text-xl font-bold">{t("Para quem é")}</h2><p className="mt-3 leading-7 text-slate-600">{pack.seo.forWho}</p></section>
        <section className="panel"><h2 className="text-xl font-bold">{t("Por que funciona")}</h2><p className="mt-3 leading-7 text-slate-600">{pack.seo.whyItWorks}</p></section>
        <section className="panel"><h2 className="text-xl font-bold">{t("Modelos recomendados")}</h2><ul className="mt-3 space-y-2 text-sm text-slate-700">{pack.recommendedModels.map(id => <li key={id}>• {templates.find(t => t.id === id)?.label ?? id}</li>)}</ul></section>
      </div>
    </div>
    <div className="mt-8"><Button asChild><Link href={`/gerador?profissao=${pack.slug}`}>{t("Criar minha assinatura")}</Link></Button></div>
  </article>;
}
