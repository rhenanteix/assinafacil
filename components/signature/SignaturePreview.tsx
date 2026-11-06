"use client";
import { useEffect, useState, type RefObject } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { basicSignatureSchema, signatureSchema, type SignatureData } from "@/types/signature";

export function SignaturePreview({ data, premium, capture }: {
  data: SignatureData; premium: boolean; capture: RefObject<HTMLDivElement | null>;
}) {
  const reduced = useReducedMotion();
  const [preview, setPreview] = useState<{ url?: string; html?: string; request: string } | null>(null);
  const [error, setError] = useState("");
  // Preview can show partially filled contacts while the complete form remains validated on export.
  const basic = { name: data.name || "Seu nome", role: data.role, company: data.company, phone: data.phone, email: data.email };
  if (!basicSignatureSchema.shape.email.safeParse(basic.email).success) basic.email = "";
  if (!basicSignatureSchema.shape.phone.safeParse(basic.phone).success) basic.phone = "";
  const parsed = signatureSchema.safeParse({ ...data, ...basic });
  const body = JSON.stringify(premium ? parsed.success ? parsed.data : { ...data, ...basic } : basic);
  useEffect(() => {
    const controller = new AbortController();
    let objectUrl: string | undefined;
    const timer = setTimeout(async () => {
      try {
        setError("");
        const response = await fetch(premium ? "/api/signatures/preview" : "/api/preview", {
          method: "POST", headers: { "Content-Type": "application/json" }, body, signal: controller.signal,
        });
        if (!response.ok) {
          const result = await response.json().catch(() => null);
          throw new Error(result?.error ?? "Não foi possível carregar a prévia.");
        }
        if (premium) {
          const result = await response.json() as { html: string };
          if (!controller.signal.aborted) setPreview({ html: result.html, request: body });
        } else {
          const blob = await response.blob();
          if (controller.signal.aborted) return;
          objectUrl = URL.createObjectURL(blob);
          setPreview({ url: objectUrl, request: body });
        }
      } catch (failure) {
        if (!controller.signal.aborted) setError(failure instanceof Error ? failure.message : "Prévia indisponível.");
      }
    }, 220);
    return () => { clearTimeout(timer); controller.abort(); if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [body, premium]);

  const current = preview?.request === body;
  return <div className="max-w-full" aria-busy={!current && !error}>
    {error ? <p role="alert" className="p-4 text-sm text-red-700">{error}</p> :
      <motion.div key={data.template} initial={reduced ? false : { opacity: .5, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .15 }}>
        <div ref={capture} data-preview-key={current ? body : ""} className="inline-block max-w-full bg-white p-3 text-left align-top">
          {current && preview?.html ? <div dangerouslySetInnerHTML={{ __html: preview.html }} /> :
            current && preview?.url ? <img src={preview.url} alt="Prévia da assinatura Essencial" className="h-auto max-w-full" width={460} /> :
              <p role="status" className="p-4 text-sm text-slate-600">Atualizando prévia…</p>}
        </div>
      </motion.div>}
  </div>;
}
