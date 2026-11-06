"use client";
import { Lock } from "lucide-react";
import { templates, canUseTemplate, type SignatureData } from "@/types/signature";
export function TemplateSelector({ value, onChange, pro, owned }: { value: SignatureData["template"]; onChange: (id: SignatureData["template"]) => void; pro: boolean; owned: string[] }) {
  return <fieldset><legend className="mb-3 text-sm font-bold">Escolha um template</legend>
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{templates.map(template =>
      <button key={template.id} type="button" aria-pressed={value === template.id} onClick={() => onChange(template.id)} className={`flex min-h-12 items-center justify-center gap-1 rounded-xl border px-2 py-2 text-xs font-semibold ${value === template.id ? "border-brand bg-indigo-50 text-brand" : "border-slate-200 bg-white hover:border-indigo-300"}`}>
        {template.label}{!canUseTemplate(template.id, pro, owned) && <Lock size={12} aria-label="Bloqueado" />}
      </button>)}</div>
  </fieldset>;
}
