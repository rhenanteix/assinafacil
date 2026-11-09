"use client";
import Link from "next/link";
import { useState } from "react";
import { templates } from "@/types/signature";
import { renderSignature } from "@/lib/utils/signature";
import { professionPacks } from "@/lib/professions";
import { useLocale, useTranslation } from "@/lib/i18n/client";
import { Reveal } from "./Reveal";

const examples = ["modern", "consulting", "sales", "editorial", "signature-luxe", "brand-desk"] as const;

export function ProfessionGallery() {
  const t = useTranslation();
  const locale = useLocale();
  const [filter, setFilter] = useState("");
  const packs = professionPacks;
  const active = packs.find(p => p.id === filter);
  const ids = active ? (active.recommendedModels as readonly string[]) : examples;
  return <div>
    <div className="mb-6 flex flex-wrap gap-2">
      <button type="button" onClick={() => setFilter("")} className={`rounded-full px-3 py-1.5 text-sm font-semibold ${!filter?"bg-brand text-white":"bg-white text-slate-700 border border-slate-200"}`}>{t("Todos")}</button>
      {packs.map(p => <button key={p.id} type="button" onClick={() => setFilter(p.id)} className={`rounded-full px-3 py-1.5 text-sm font-semibold ${filter===p.id?"bg-brand text-white":"bg-white text-slate-700 border border-slate-200"}`}>{p.name}</button>)}
    </div>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{ids.map(id => {
      const template = templates.find(item => item.id === id);
      if (!template) return null;
      const demo = (active?.example.template === id ? active.example : undefined) as any;
      const base = { name: demo?.name ?? "Seu nome", role: demo?.role ?? "", company: demo?.company ?? "", email: demo?.email ?? "nome@exemplo.com.br", phone: "", website: "", address: "", cnpj: "", professionalRegistrationType: "", professionalRegistration: "", legalNotice: "", instagram: "", facebook: "", linkedin: "", whatsapp: "", youtube: "", tiktok: "", x: "", github: "", photo: "", logo: "", color: demo?.color ?? "#5b45db", template: id, professionId: active?.id ?? "", ctaLabel: "", ctaType: "link", ctaUrl: "", signoff: "" } as any;
      const tier = "exclusive" in template ? t("Exclusivo") : template.pro ? "Pro" : "Free";
      return <Reveal key={id + filter} className="panel transition-shadow hover:shadow-lg"><div className="mb-4 flex items-center justify-between gap-2"><h3 className="font-bold">{t(template.label)}</h3><span className="rounded-full bg-violet-100 px-2.5 py-1 text-xs font-bold text-brand">{tier}</span></div>
        <div className="min-h-36 rounded-xl border border-slate-100 p-2" dangerouslySetInnerHTML={{ __html: renderSignature(base, template.pro, locale) }} />
        {active && <Link href={`/modelos/${active.slug}`} className="mt-3 block text-sm font-semibold text-brand underline">{t("Ver pacote")} {active.name}</Link>}
      </Reveal>;
    })}</div>
  </div>;
}
