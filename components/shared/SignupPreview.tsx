"use client";
import { useEffect, useRef, useState } from "react";
import { readDraft } from "@/hooks/use-signature-draft";
import { SignaturePreview } from "@/components/signature/SignaturePreview";
import { canUseTemplate, emptySignature, toEssential, type SignatureData } from "@/types/signature";

export function SignupPreview() {
  const [data, setData] = useState<SignatureData | null>(null);
  const capture = useRef<HTMLDivElement>(null);
  useEffect(() => {
    try {
      const raw = readDraft();
      if (raw && typeof raw === "object") setData({ ...emptySignature, ...raw } as SignatureData);
    } catch {}
  }, []);
  if (!data?.name && !data?.email && !data?.company) return null;
  return <aside className="panel hidden lg:block"><div className="mb-3 flex items-center justify-between gap-2"><p className="eyebrow">Sua assinatura</p><span className="inline-flex items-center gap-1 rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold text-violet-700">Visualização</span></div><div className="overflow-x-auto rounded-xl border border-slate-100 bg-white p-3"><SignaturePreview data={data} premium={false} capture={capture} publicPreview /></div>{!canUseTemplate(data.template, false, []) && <p className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-950">Modelo Pro selecionado para visualização. Finalize com o plano Pro para usar este modelo.</p>}</aside>;
}
