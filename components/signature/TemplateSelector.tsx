"use client";
import { useTranslation } from "@/lib/i18n/client";

import Link from "next/link";
import { templates, canUseTemplate, type SignatureData } from "@/types/signature";

export function TemplateSelector({ value, onChange, pro, owned, onLocked }: { value: SignatureData["template"]; onChange: (id: SignatureData["template"]) => void; pro: boolean; owned: string[]; onLocked?: (id: SignatureData["template"]) => void }) {
  const t = useTranslation();
  return <fieldset className="space-y-3">
    <legend className="text-sm font-bold">{t("Escolha um template")}</legend>
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-4">{templates.map(template => {
      const locked = !canUseTemplate(template.id, pro, owned);
      const active = value === template.id;
      return <button key={template.id} type="button" aria-pressed={active} aria-disabled={locked}
        onClick={() => { if (locked) { onLocked?.(template.id); return; } onChange(template.id); }}
        className={`flex min-h-11 items-center justify-between gap-2 rounded-xl border px-3 py-2 text-left transition ${active ? "border-brand bg-violet-50 ring-1 ring-brand/20" : locked ? "border-slate-200 bg-slate-50/80 hover:border-amber-300 hover:bg-amber-50/40" : "border-slate-200 bg-white hover:border-violet-300"}`}>
        <span className={`min-w-0 truncate text-xs font-semibold ${active ? "text-brand" : "text-slate-800"}`}>{t(template.label)}</span>
        {locked && <span className="shrink-0 rounded-md bg-amber-400 px-1.5 py-0.5 text-[10px] font-bold leading-none text-amber-950">Pro</span>}
      </button>;
    })}</div>
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-violet-50 px-3 py-2 text-xs text-slate-700">
      <span>{t("Você pode visualizar os modelos Pro; para usar, salve/exporte com o plano Pro.")}</span>
      {!pro && <Link href="/precos" className="font-semibold text-brand underline">{t("Conheça o Pro")}</Link>}
    </div>
  </fieldset>;
}
