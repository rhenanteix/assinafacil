"use client";

import { useRef, useState } from "react";
import { useTranslation } from "@/lib/i18n/client";
import { Button } from "@/components/ui/button";

export function ModelGallery({ models }: { models: { id: string; label: string; tier: string; html: string }[] }) {
  const t = useTranslation();
  const dialog = useRef<HTMLDialogElement>(null);
  const [selected, setSelected] = useState(models[0]);
  return <section aria-labelledby="models-title" className="space-y-5">
    <h2 id="models-title" className="text-2xl font-bold">{t("Veja os modelos")}</h2>
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">{models.map(model => <button key={model.id} type="button" className="panel min-w-0 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-600" onClick={() => { setSelected(model); dialog.current?.showModal(); }} aria-label={`${t("Ampliar modelo")}: ${model.label}`}>
      <div className="pointer-events-none h-36 overflow-hidden" aria-hidden="true"><iframe tabIndex={-1} title={model.label} sandbox="" srcDoc={model.html} loading="lazy" className="h-[400px] w-[800px] origin-top-left scale-[0.35] border-0" /></div>
      <span className="flex items-center justify-between gap-2"><strong>{model.label}</strong><span className="rounded-full bg-violet-50 px-2 py-1 text-xs text-violet-800">{model.tier}</span></span>
    </button>)}</div>
    <dialog ref={dialog} aria-labelledby="model-dialog-title" className="w-[calc(100%-2rem)] max-w-4xl rounded-2xl p-5 backdrop:bg-slate-950/60">
      <div className="mb-4 flex items-center justify-between gap-4"><h3 id="model-dialog-title" className="text-xl font-bold">{selected.label} · {selected.tier}</h3><Button variant="outline" onClick={() => dialog.current?.close()}>{t("Fechar")}</Button></div>
      <div className="overflow-auto"><iframe title={`${t("Prévia")}: ${selected.label}`} sandbox="" srcDoc={selected.html} className="h-[420px] w-full min-w-[700px] border-0" /></div>
    </dialog>
  </section>;
}

export function BusinessContact({ email }: { email?: string }) {
  const t = useTranslation();
  const dialog = useRef<HTMLDialogElement>(null);
  const [status, setStatus] = useState("");
  // TODO [CONFIRMAR]: destino comercial (e-mail, WhatsApp ou endpoint).
  const destination = email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : undefined;
  return <>
    <Button variant="outline" onClick={() => { setStatus(""); dialog.current?.showModal(); }}>{t("Falar com a equipe")}</Button>
    <dialog ref={dialog} aria-labelledby="business-title" className="w-[calc(100%-2rem)] max-w-lg rounded-2xl p-6 backdrop:bg-slate-950/60">
      <div className="mb-5 flex items-center justify-between gap-3"><h2 id="business-title" className="text-xl font-bold">{t("Falar com a equipe")}</h2><button type="button" className="underline" onClick={() => dialog.current?.close()}>{t("Fechar")}</button></div>
      <form className="space-y-4" onSubmit={event => {
        event.preventDefault();
        if (!destination) { setStatus(t("Contato comercial a confirmar. Nenhuma mensagem foi enviada.")); return; }
        const data = new FormData(event.currentTarget);
        const fields = [["Nome", "name"], ["E-mail", "email"], ["Empresa", "company"], ["Nº de colaboradores", "employees"], ["Mensagem", "message"]];
        const body = fields.map(([label, key]) => `${t(label)}: ${data.get(key) ?? ""}`).join("\n");
        window.location.href = `mailto:${destination}?subject=${encodeURIComponent(t("Orçamento Business"))}&body=${encodeURIComponent(body)}`;
        setStatus(t("Solicitação preparada. Conclua o envio no seu aplicativo de e-mail; o site não confirma a entrega."));
      }}>
        {[["Nome", "name", "text"], ["E-mail", "email", "email"], ["Empresa", "company", "text"], ["Nº de colaboradores", "employees", "number"]].map(([label, name, type]) => <label key={name} className="block text-sm font-medium">{t(label)}<input name={name} type={type} required min={type === "number" ? 1 : undefined} step={type === "number" ? 1 : undefined} maxLength={type === "number" ? undefined : 254} pattern={type === "text" ? ".*\\S.*" : undefined} className="mt-1 block w-full rounded-lg border border-slate-300 p-2" /></label>)}
        <label className="block text-sm font-medium">{t("Mensagem (opcional)")}<textarea name="message" maxLength={1500} rows={3} className="mt-1 block w-full rounded-lg border border-slate-300 p-2" /></label>
        {!destination && <p className="text-sm text-slate-600">{t("Contato comercial a confirmar. Nenhuma mensagem foi enviada.")}</p>}
        <Button type="submit" disabled={!destination}>{t("Preparar e-mail")}</Button>
        <p role="status" className="text-sm text-slate-700">{status}</p>
      </form>
    </dialog>
  </>;
}
