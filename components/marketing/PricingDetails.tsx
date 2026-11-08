"use client";

import { useId, useRef, useState } from "react";
import posthog from "posthog-js";
import { toast } from "sonner";
import { MailyToaster } from "@/components/shared/MailyToaster";
import { useTranslation } from "@/lib/i18n/client";
import { Button } from "@/components/ui/button";

export function ModelGallery({ models }: { models: { id: string; label: string; tier: string; html: string }[] }) {
  const t = useTranslation();
  const dialog = useRef<HTMLDialogElement>(null);
  const [selected, setSelected] = useState(models[0]);
  return <section aria-labelledby="models-title" className="space-y-5">
    <h2 id="models-title" className="text-2xl font-bold">{t("Veja os modelos")}</h2><p className="text-sm text-slate-600">{t("Exemplos fictícios e enxutos. Adicione só o que faz sentido para você.")}</p>
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">{models.map(model => <button key={model.id} type="button" className="panel min-w-0 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-600" onClick={() => { setSelected(model); dialog.current?.showModal(); }} aria-label={`${t("Ampliar modelo")}: ${model.label}`}>
      <div className="pointer-events-none h-40 overflow-hidden" aria-hidden="true"><iframe tabIndex={-1} title={model.label} sandbox="" srcDoc={model.html} loading="lazy" className="h-[280px] w-[480px] origin-top-left scale-[0.55] border-0" /></div>
      <span className="flex items-center justify-between gap-2"><strong>{model.label}</strong><span className="rounded-full bg-violet-50 px-2 py-1 text-xs text-violet-800">{model.tier}</span></span>
    </button>)}</div>
    <dialog ref={dialog} aria-labelledby="model-dialog-title" className="w-[calc(100%-2rem)] max-w-4xl rounded-2xl p-5 backdrop:bg-slate-950/60">
      <div className="mb-4 flex items-center justify-between gap-4"><h3 id="model-dialog-title" className="text-xl font-bold">{selected.label} · {selected.tier}</h3><Button variant="outline" onClick={() => dialog.current?.close()}>{t("Fechar")}</Button></div>
      <div className="overflow-auto"><iframe title={`${t("Prévia")}: ${selected.label}`} sandbox="" srcDoc={selected.html} className="h-[320px] w-full border-0" /></div>
    </dialog>
  </section>;
}

export function BusinessContact({ enabled, contactEmail }: { enabled: boolean; contactEmail?: string }) {
  const t = useTranslation();
  const dialog = useRef<HTMLDialogElement>(null);
  const toasterId = useId();
  const [busy, setBusy] = useState(false);
  const sending = useRef(false);
  return <>
    <Button variant="outline" onClick={() => { dialog.current?.showModal(); }}>{t("Falar com a equipe")}</Button>
    <dialog ref={dialog} aria-labelledby="business-title" className="w-[calc(100%-2rem)] max-w-lg rounded-2xl p-6 backdrop:bg-slate-950/60">
      <div className="mb-5 flex items-center justify-between gap-3"><h2 id="business-title" className="text-xl font-bold text-slate-900">{t("Falar com a equipe")}</h2><button type="button" className="underline text-brand" onClick={() => dialog.current?.close()}>{t("Fechar")}</button></div>
      {contactEmail && <div className="mb-4 space-y-3 p-4 rounded-xl bg-white border border-slate-200 text-sm leading-relaxed text-slate-800">
        <p><strong className="text-slate-900">Business (contratação com a equipe, sem cobrança automática por este site):</strong> assinatura padronizada para a sua equipe, entregue pronta.</p>
        <p><strong className="text-slate-900">Valores de referência (iniciais, sujeitos a confirmação):</strong> implantação/1º mês R$ 89,90 por empresa; meses seguintes R$ 19,90/mês por empresa, equipe sem limite de pessoas. Enquanto a recorrência automática não estiver ativa, os meses seguintes são cobrados/ajustados manualmente com a equipe. Este formulário <strong className="text-violet-700">não gera cobrança</strong>.</p>
        <p>Pagamento em dólar (USD): sob consulta e verificação do provedor — Pix e boleto não funcionam em USD. Sua solicitação vai para <a className="text-brand underline" href={`mailto:${contactEmail}`}>{contactEmail}</a>. Você também pode escrever diretamente.</p>
      </div>}
      <form className="space-y-4" onSubmit={async event => {
        event.preventDefault();
        if (!enabled || sending.current) return;
        const form = event.currentTarget;
        sending.current = true;
        setBusy(true);
        try {
          const data = Object.fromEntries(new FormData(form));
          const response = await fetch("/api/business", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data), signal: AbortSignal.timeout(30000) });
          const result = await response.json().catch(() => null);
          if (!response.ok) throw new Error(result?.error ?? "Não foi possível enviar. Tente novamente mais tarde.");
          posthog.capture("business_contact_requested");
          form.reset();
          dialog.current?.close();
          toast.success(t("Solicitação enviada para a equipe. Responderemos pelo e-mail informado."));
        } catch (error) {
          toast.error(t(error instanceof Error && error.name !== "TimeoutError" ? error.message : "Não foi possível confirmar o envio. Aguarde antes de tentar novamente."), { toasterId });
        } finally { sending.current = false; setBusy(false); }

      }}>
        {[["Nome", "name", "text"], ["E-mail", "email", "email"], ["Empresa", "company", "text"], ["Nº de colaboradores", "employees", "number"]].map(([label, name, type]) => <label key={name} className="block text-sm font-medium">{t(label)}<input name={name} type={type} required min={type === "number" ? 1 : undefined} step={type === "number" ? 1 : undefined} maxLength={type === "number" ? undefined : 254} pattern={type === "text" ? ".*\\S.*" : undefined} className="mt-1 block w-full rounded-lg border border-slate-300 p-2" /></label>)}
        <label className="block text-sm font-medium">{t("Mensagem (opcional)")}<textarea name="message" maxLength={1500} rows={3} className="mt-1 block w-full rounded-lg border border-slate-300 p-2" /></label>
        <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
        {!enabled && <p className="text-sm text-slate-600">{t("Contato comercial a confirmar. Nenhuma mensagem foi enviada.")}</p>}
        <p className="text-xs text-slate-500">Usamos esses dados para responder à sua solicitação. <a href="/privacidade" className="underline">Política de Privacidade</a></p>
        <Button type="submit" disabled={!enabled || busy}>{busy ? t("Enviando…") : t("Enviar solicitação")}</Button>
      </form>
      {/* Keep errors in the modal top layer, where they remain visible and dismissible. */}
      <MailyToaster id={toasterId} />
    </dialog>
  </>;
}
