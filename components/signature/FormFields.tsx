"use client";
import { useTranslation } from "@/lib/i18n/client";
import { useState } from "react";

import Link from "next/link";
import { Input } from "@/components/ui/input";
import { MaskedInput } from "@/components/ui/masked-input";
import type { UseFormReturn } from "react-hook-form";
import type { SignatureData } from "@/types/signature";
import { socialNetworks } from "@/types/social";
import { validPhoneBR, validCEP, validCNPJ } from "@/lib/masks";
import { conselhosProfissionais, formatarRegistro } from "@/lib/professions/registries";

const basic = [
  ["name", "Nome completo", "text"], ["role", "Cargo", "text"], ["company", "Empresa", "text"],
  ["phone", "Telefone", "tel"], ["email", "E-mail", "email"],
  ["whatsapp", "WhatsApp", "tel"], ["address", "Endereço", "text"],
  ["cnpj", "CNPJ", "text"],
] as const;

export function FormFields({ form, premium }: { form: UseFormReturn<SignatureData>; premium: boolean }) {
  const t = useTranslation();
  const [cepBusy, setCepBusy] = useState(false);
  const fields = [...basic, ...(premium ? [["website", "Website", "url"]] as const : [])];
  return <div className="space-y-5"><div className="grid gap-4 sm:grid-cols-2">{fields.map(([key, label, type]) => {
    const error = form.formState.errors[key];
    const isMasked = key === "phone" || key === "whatsapp" || key === "cnpj";
    const maskKind = key === "cnpj" ? "cnpj" : "phone-br";
    const placeholder = key === "whatsapp" ? "+55 (11) 99999-0000" : key === "cnpj" ? "00.000.000/0000-00" : type === "url" ? "https://" : undefined;
    return <label key={key} className="grid gap-1.5 text-sm font-medium">{t(label)}
      {isMasked ? (
        <MaskedInput mask={maskKind} {...(()=>{const {onChange:_o,...rest}=form.register(key);return rest;})()} onChange={(v)=>form.setValue(key as keyof SignatureData,v,{shouldValidate:true,shouldDirty:true})} placeholder={placeholder} aria-invalid={!!error} aria-describedby={error ? `error-${key}` : undefined} />
      ) : (
        <Input type={type} {...form.register(key)} placeholder={placeholder} aria-invalid={!!error} aria-describedby={error ? `error-${key}` : undefined} />
      )}
      {error && <span id={`error-${key}`} className="text-xs text-red-700">{t(error.message ?? "Confira os campos indicados.")}</span>}
      {!error && key !== "name" && key !== "email" && (() => {
        const raw = form.getValues(key as keyof SignatureData) as string;
        if (key === "phone" || key === "whatsapp") {
          if (raw && !validPhoneBR(raw)) return <span id={`warn-${key}`} className="text-xs text-amber-700">{t("Formato de telefone fora do padrão brasileiro.")}</span>;
        }
        if (key === "cnpj") {
          if (raw && !validCNPJ(raw)) return <span id={`warn-${key}`} className="text-xs text-amber-700">{t("CNPJ fora do padrão brasileiro.")}</span>;
        }
        return null;
      })()}
    </label>;
  })}
    <label key="cep" className="grid gap-1.5 text-sm font-medium">{t("CEP")}
      <div className="flex gap-2">
        <MaskedInput mask="cep" {...(()=>{const {onChange:_o,...rest}=form.register("cep");return rest;})()} onChange={(v)=>form.setValue("cep",v,{shouldValidate:true,shouldDirty:true})} placeholder="01310-100" aria-invalid={!!form.formState.errors.cep} aria-describedby={form.formState.errors.cep ? "error-cep" : undefined} />
        <button type="button" disabled={cepBusy} className="px-3 py-1.5 text-xs font-medium rounded-md border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-50" onClick={async () => {
          const raw = form.getValues("cep") as string;
          if (!validCEP(raw)) return;
          setCepBusy(true);
          try {
            const response = await fetch("/api/lookup", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ tipo: "cep", valor: raw }) });
            if (!response.ok) throw new Error("falha");
            const { data } = await response.json();
            const partes = [data.logradouro, data.bairro, `${data.cidade}/${data.estado}`].filter(Boolean).join(", ");
            if (partes && !form.getValues("address")) {
              form.setValue("address", partes, { shouldValidate: true, shouldDirty: true });
            }
            form.setValue("cep", raw, { shouldValidate: true, shouldDirty: true });
          } catch {
            // Sem toast disruptivo: formulário continua funcionando.
          } finally {
            setCepBusy(false);
          }
        }}>{cepBusy ? "…" : t("Consultar CEP")}</button>
      </div>
      {form.formState.errors.cep && <span id="error-cep" className="text-xs text-red-700">{t(form.formState.errors.cep.message ?? "CEP inválido.")}</span>}
      {!form.formState.errors.cep && (() => {
        const raw = form.getValues("cep") as string;
        if (raw && !validCEP(raw)) return <span id="warn-cep" className="text-xs text-amber-700">{t("CEP fora do padrão brasileiro.")}</span>;
        return null;
      })()}
    </label>
    <label key="whatsappSameAsPhone" className="flex items-center gap-2 text-sm">
      <input type="checkbox" {...form.register("whatsappSameAsPhone")} />
      {t("Usar o mesmo número do telefone para o WhatsApp")}
    </label>
    <label key="whatsappMessage" className="grid gap-1.5 text-sm font-medium">{t("Mensagem pré-preenchida no WhatsApp")}
      <Input type="text" {...form.register("whatsappMessage")} placeholder="Olá, vim pelo seu e-mail" aria-invalid={!!form.formState.errors.whatsappMessage} aria-describedby={form.formState.errors.whatsappMessage ? "error-whatsappMessage" : undefined} />
      {form.formState.errors.whatsappMessage && <span id="error-whatsappMessage" className="text-xs text-red-700">{t(form.formState.errors.whatsappMessage.message ?? "Confira a mensagem.")}</span>}
      <p className="text-xs text-slate-600">{t("Exemplo: Olá, vim pelo seu e-mail. Será codificada no link do WhatsApp.")}</p>
    </label>
    <label key="professionalRegistrationType" className="grid gap-1.5 text-sm font-medium">{t("Tipo do registro profissional")}
      <select aria-label={t("Tipo do registro profissional")} {...form.register("professionalRegistrationType")} className="mt-1 block w-full rounded-md border-slate-300 bg-white py-1.5 pl-2 pr-8 text-sm shadow-sm" aria-invalid={!!form.formState.errors.professionalRegistrationType}>
        <option value="">{t("Selecione")}</option>
        {conselhosProfissionais.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
      </select>
      {form.formState.errors.professionalRegistrationType && <span id="error-professionalRegistrationType" className="text-xs text-red-700">{t("Confira o tipo do registro profissional.")}</span>}
    </label>
    <label key="professionalRegistration" className="grid gap-1.5 text-sm font-medium">{t("Registro profissional")}
      <Input type="text" {...form.register("professionalRegistration")} placeholder={t("Ex.: 123.456/SP")} aria-invalid={!!form.formState.errors.professionalRegistration} aria-describedby={form.formState.errors.professionalRegistration ? "error-professionalRegistration" : undefined} />
      {form.formState.errors.professionalRegistration && <span id="error-professionalRegistration" className="text-xs text-red-700">{t(form.formState.errors.professionalRegistration.message ?? "Confira o registro profissional.")}</span>}
    </label>
    {(form.watch("professionalRegistrationType") && form.watch("professionalRegistrationType") !== "") && <>
      <label key="professionalRegistrationUf" className="grid gap-1.5 text-sm font-medium">{t("UF")}
        <Input type="text" {...form.register("professionalRegistrationUf")} placeholder={t("SP")} maxLength={2} aria-invalid={!!form.formState.errors.professionalRegistrationUf} aria-describedby={form.formState.errors.professionalRegistrationUf ? "error-professionalRegistrationUf" : undefined} />
        {form.formState.errors.professionalRegistrationUf && <span id="error-professionalRegistrationUf" className="text-xs text-red-700">{t(form.formState.errors.professionalRegistrationUf.message ?? "Confira a UF.")}</span>}
      </label>
      {conselhosProfissionais.find(c => c.id === form.watch("professionalRegistrationType"))?.rqe && (
        <label key="professionalRegistrationRqe" className="grid gap-1.5 text-sm font-medium">{t("RQE (opcional)")}
          <Input type="text" {...form.register("professionalRegistrationRqe")} placeholder={t("Ex.: 12345")} aria-invalid={!!form.formState.errors.professionalRegistrationRqe} aria-describedby={form.formState.errors.professionalRegistrationRqe ? "error-professionalRegistrationRqe" : undefined} />
          {form.formState.errors.professionalRegistrationRqe && <span id="error-professionalRegistrationRqe" className="text-xs text-red-700">{t(form.formState.errors.professionalRegistrationRqe.message ?? "Confira o RQE.")}</span>}
        </label>
      )}
    </>}
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
