"use client";
import { useTranslation } from "@/lib/i18n/client";

import Link from "next/link";
import { Input } from "@/components/ui/input";
import type { UseFormReturn } from "react-hook-form";
import type { SignatureData } from "@/types/signature";
import { socialNetworks } from "@/types/social";

const basic = [
  ["name", "Nome completo", "text"], ["role", "Cargo", "text"], ["company", "Empresa", "text"],
  ["phone", "Telefone", "tel"], ["email", "E-mail", "email"],
  ["whatsapp", "WhatsApp", "tel"], ["address", "Endereço", "text"],
  ["cnpj", "CNPJ", "text"],
] as const;

const professionalTypes = ["CRECI", "OAB", "CRM", "CRC"] as const;

export function FormFields({ form, premium }: { form: UseFormReturn<SignatureData>; premium: boolean }) {
  const t = useTranslation();
  const fields = [...basic, ...(premium ? [["website", "Website", "url"]] as const : [])];
  return <div className="space-y-5"><div className="grid gap-4 sm:grid-cols-2">{fields.map(([key, label, type]) => {
    const error = form.formState.errors[key];
    return <label key={key} className="grid gap-1.5 text-sm font-medium">{t(label)}
      <Input type={type} {...form.register(key)} placeholder={key === "whatsapp" ? "+55 11 99999-0000" : type === "url" ? "https://" : undefined} aria-invalid={!!error} aria-describedby={error ? `error-${key}` : undefined} />
      {error && <span id={`error-${key}`} className="text-xs text-red-700">{t(error.message ?? "Confira os campos indicados.")}</span>}
    </label>;
  })}
    <label key="professionalRegistrationType" className="grid gap-1.5 text-sm font-medium">{t("Tipo do registro profissional")}
      <select aria-label={t("Tipo do registro profissional")} {...form.register("professionalRegistrationType")} className="mt-1 block w-full rounded-md border-slate-300 bg-white py-1.5 pl-2 pr-8 text-sm shadow-sm" aria-invalid={!!form.formState.errors.professionalRegistrationType}>
        <option value="">{t("Selecione")}</option>
        {form.watch("professionalRegistrationType") === "CNPJ" && <option value="CNPJ">CNPJ</option>}
        {professionalTypes.map(type => <option key={type} value={type}>{type}</option>)}
      </select>
      {form.formState.errors.professionalRegistrationType && <span id="error-professionalRegistrationType" className="text-xs text-red-700">{t("Confira o tipo do registro profissional.")}</span>}
    </label>
    <label key="professionalRegistration" className="grid gap-1.5 text-sm font-medium">{t("Registro profissional")}
      <Input type="text" {...form.register("professionalRegistration")} placeholder={t("Ex.: 123.456/SP")} aria-invalid={!!form.formState.errors.professionalRegistration} aria-describedby={form.formState.errors.professionalRegistration ? "error-professionalRegistration" : undefined} />
      {form.formState.errors.professionalRegistration && <span id="error-professionalRegistration" className="text-xs text-red-700">{t(form.formState.errors.professionalRegistration.message ?? "Confira o registro profissional.")}</span>}
    </label>
    <label key="legalNotice" className="grid gap-1.5 text-sm font-medium">{t("Aviso legal (opcional)")}
      <textarea {...form.register("legalNotice")} className="mt-1 block w-full rounded-md border-slate-300 bg-white py-1.5 pl-2 pr-2 text-sm shadow-sm" rows={2} placeholder={t("Aviso opcional definido por você ou sua empresa.")} aria-invalid={!!form.formState.errors.legalNotice} aria-describedby={form.formState.errors.legalNotice ? "error-legalNotice" : undefined} />
      {form.formState.errors.legalNotice && <span id="error-legalNotice" className="text-xs text-red-700">{t(form.formState.errors.legalNotice.message ?? "Confira o aviso legal.")}</span>}
    </label>
  </div>
  <p className="text-xs text-slate-600">{t("WhatsApp: inclua o código do país. No PNG, o contato aparece como texto; no HTML, como link.")}</p>
  {premium ? <fieldset><legend className="mb-3 font-semibold">{t("Redes sociais com links")}</legend>
    <p className="mb-3 text-xs text-slate-600">{t("Cole o link completo. Apenas as redes preenchidas aparecem, como links de texto que funcionam mesmo com imagens bloqueadas.")}</p>
    <div className="grid gap-4 sm:grid-cols-2">{socialNetworks.filter(network => network.key !== "whatsapp").map(network => {
      const error = form.formState.errors[network.key];
      return <label key={network.key} className="grid gap-1.5 text-sm font-medium">
        <span className="flex items-center gap-2">{network.label}</span>
        <Input type="url" {...form.register(network.key)} placeholder={`https://${network.domains[0]}/`} aria-invalid={!!error} aria-describedby={error ? `error-${network.key}` : undefined} />
        {error && <span id={`error-${network.key}`} className="text-xs text-red-700">{t(error.message ?? "Confira os campos indicados.")}</span>}
      </label>;
    })}</div>
  </fieldset> : <p className="rounded-xl bg-indigo-50 p-3 text-sm text-slate-700">{t("Adicione foto, logo, cores e links sociais no premium.")}{" "}<Link href="/precos" className="font-semibold text-brand underline">{t("Ver recursos")}</Link></p>}
  </div>;
}
