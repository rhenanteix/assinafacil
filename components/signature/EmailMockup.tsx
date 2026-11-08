"use client";
import { useTranslation } from "@/lib/i18n/client";
import type { RefObject } from "react";
import type { SignatureData } from "@/types/signature";
import { SignaturePreview } from "./SignaturePreview";

export function EmailMockup({ data, premium, capture, publicPreview }: {
  data: SignatureData; premium: boolean; capture: RefObject<HTMLDivElement | null>; publicPreview?: boolean;
}) {
  const t = useTranslation();
  return <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
    <div className="border-b border-slate-100 bg-slate-50 px-4 py-3 text-sm">
      <div className="flex gap-2 text-slate-600"><span className="w-16 shrink-0 text-slate-500">{t("Para")}</span><span>cliente@exemplo.com.br</span></div>
      <div className="mt-1 flex gap-2 text-slate-700"><span className="w-16 shrink-0 text-slate-500">{t("Assunto")}</span><span>{t("Retorno sobre sua mensagem")}</span></div>
    </div>
    <div className="p-4 text-sm text-slate-500">
      <p>{t("Olá! Tudo bem?")}</p>
      <p className="mt-2">{t("Segue minha assinatura abaixo.")}</p>
      <div className="mt-5 overflow-x-auto border-t border-slate-100 pt-4">
        <SignaturePreview data={data} premium={premium} capture={capture} publicPreview={publicPreview} />
      </div>
    </div>
  </div>;
}
