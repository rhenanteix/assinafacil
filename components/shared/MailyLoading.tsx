"use client";

import Image from "next/image";
import { Mail, Sparkles } from "lucide-react";
import { useTranslation } from "@/lib/i18n/client";

export function MailyLoading() {
  const t = useTranslation();
  return <section className="maily-loading grid min-h-[65vh] place-items-center px-4 py-16" role="status" aria-live="polite">
    <div className="text-center">
      <div className="relative mx-auto mb-7 h-52 w-52" aria-hidden="true">
        <div className="absolute inset-3 rounded-full bg-violet-100/80 ring-1 ring-violet-200/60" />
        <div className="maily-loading-orbit absolute inset-0 rounded-full border border-dashed border-violet-300"><span className="absolute left-7 top-4 h-3 w-3 rounded-full bg-emerald-300" /></div>
        <Image src="/mascote/boas-vindas.png" alt="" width={208} height={208} sizes="208px" priority className="maily-loading-cat relative h-full w-full object-contain drop-shadow-lg" />
        <span className="maily-loading-mail absolute bottom-4 right-0 rounded-2xl border border-violet-100 bg-white p-3 text-brand shadow-lg"><Mail size={25} /></span>
        <Sparkles className="absolute left-0 top-6 text-violet-400" size={25} />
      </div>
      <p className="eyebrow">Maily</p>
      <h2 className="mt-3 text-2xl font-bold tracking-tight">{t("Preparando tudo para você")}</h2>
      <p className="mt-2 text-sm text-slate-500">{t("Só um instante, o gatinho já está cuidando disso.")}</p>
      <div className="maily-loading-dots mt-6 flex justify-center gap-2" aria-hidden="true"><span /><span /><span /></div>
    </div>
  </section>;
}
