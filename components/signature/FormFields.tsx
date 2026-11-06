"use client";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import type { UseFormReturn } from "react-hook-form";
import type { SignatureData } from "@/types/signature";
import { socialNetworks } from "@/types/social";

const basic = [
  ["name", "Nome completo", "text"], ["role", "Cargo", "text"], ["company", "Empresa", "text"],
  ["phone", "Telefone", "tel"], ["email", "E-mail", "email"],
] as const;
export function FormFields({ form, premium }: { form: UseFormReturn<SignatureData>; premium: boolean }) {
  const fields = [...basic, ...(premium ? [["website", "Website", "url"]] as const : [])];
  return <div className="space-y-5"><div className="grid gap-4 sm:grid-cols-2">{fields.map(([key, label, type]) => {
    const error = form.formState.errors[key];
    return <label key={key} className="grid gap-1.5 text-sm font-medium">{label}
      <Input type={type} {...form.register(key)} placeholder={type === "url" ? "https://" : undefined} aria-invalid={!!error} aria-describedby={error ? `error-${key}` : undefined} />
      {error && <span id={`error-${key}`} className="text-xs text-red-700">{error.message}</span>}
    </label>;
  })}</div>
  {premium ? <fieldset><legend className="mb-3 font-semibold">Redes sociais com ícones</legend>
    <p className="mb-3 text-xs text-slate-600">Cole o link completo. Apenas as redes preenchidas aparecem. Os ícones ficam clicáveis na versão HTML.</p>
    <div className="grid gap-4 sm:grid-cols-2">{socialNetworks.map(network => {
      const error = form.formState.errors[network.key];
      return <label key={network.key} className="grid gap-1.5 text-sm font-medium">
        <span className="flex items-center gap-2"><img src={`/social/${network.key}.png`} alt="" width={18} height={18} />{network.label}</span>
        <Input type="url" {...form.register(network.key)} placeholder={`https://${network.domains[0]}/`} aria-invalid={!!error} aria-describedby={error ? `error-${network.key}` : undefined} />
        {error && <span id={`error-${network.key}`} className="text-xs text-red-700">{error.message}</span>}
      </label>;
    })}</div>
  </fieldset> : <p className="rounded-xl bg-indigo-50 p-3 text-sm text-slate-700">Adicione foto, logo, cores e redes sociais com ícones no premium. <Link href="/precos" className="font-semibold text-brand underline">Ver recursos</Link></p>}
  </div>;
}
