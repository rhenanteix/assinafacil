"use client";
import { useTranslation } from "@/lib/i18n/client";


import { useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { Mail } from "lucide-react";
import { SignaturePreview } from "@/components/signature/SignaturePreview";
import { emptySignature } from "@/types/signature";

export function ProductShowcase() {
  const t = useTranslation();
  const [name, setName] = useState("Marina Costa");
  const reduced = useReducedMotion();
  const capture = useRef<HTMLDivElement>(null);
  return <div className="relative min-w-0 pt-24 sm:pt-28">
    <div className="absolute -inset-5 rounded-[3rem] bg-violet-300/30 blur-3xl" aria-hidden="true" />
    <Image src="/mascote/studio.png" alt="" width={1536} height={1024} sizes="(max-width: 640px) 190px, 230px" priority className="pointer-events-none absolute -top-4 right-3 w-[190px] sm:-top-7 sm:right-6 sm:w-[230px]" />
    <div className="relative mb-4 max-w-[45%] text-xs font-semibold leading-relaxed text-violet-700 sm:text-sm">{t("Sua próxima assinatura")}<br />{t("começa aqui.")}</div>
    <motion.div initial={reduced ? false : { opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="relative overflow-hidden rounded-3xl border border-white bg-white shadow-2xl shadow-indigo-950/15">
      <div className="flex items-center justify-between gap-2 border-b border-slate-100 px-4 py-4 sm:px-6">
        <span className="flex items-center gap-1.5" aria-hidden="true">{["#c4b5fd", "#ddd6fe", "#ece9fe"].map(c => <i key={c} className="h-2 w-2 rounded-full" style={{ background: c }} />)}</span>
        <span className="flex items-center gap-2 text-xs font-semibold text-slate-600"><Mail size={14} /> {" "}{t("Studio de assinaturas")}</span>
        <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-800">{t("PRÉVIA AO VIVO")}</span>
      </div>
      <div className="grid gap-4 bg-[#f8f7ff] p-4 sm:p-6">
        <div className="grid min-h-48 place-items-center overflow-hidden rounded-2xl border border-dashed border-violet-200 bg-white p-3">
          <SignaturePreview data={{ ...emptySignature, name, role: t("Diretora de Design"), company: t("Estúdio Horizonte"), email: "marina@estudiohorizonte.com.br" }} premium={false} capture={capture} />
        </div>
        <label className="grid gap-2 rounded-xl bg-white p-3 text-xs font-semibold">{t("Experimente com seu nome")}{" "}<input value={name} onChange={e => setName(e.target.value)} maxLength={60} className="min-w-0 rounded-lg border border-slate-300 px-2 py-2 text-sm" />
        </label>
        <p className="flex items-start gap-2 text-sm text-slate-700"><span>{t("HTML clicável, também no Free.")}{" "}<Link href="/precos" className="font-semibold text-brand underline">{t("Conheça os modelos com logo e ícones sociais.")}</Link></span></p>
      </div>
    </motion.div>
  </div>;
}
