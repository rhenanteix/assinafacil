"use client";
import { useState } from "react";
import Link from "next/link";
import { Copy, Download, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { jsonRequest, useSignatureActions } from "@/hooks/use-signature-actions";
import type { SignatureData } from "@/types/signature";

const guides = [
  { id: "gmail", name: "Gmail (web)", steps: ["Copie o HTML da assinatura.", "No Gmail (computador), abra Configurações > Ver todas as configurações > Geral > Assinatura.", "Crie uma assinatura e cole o conteúdo (use colar sem formatação se necessário; o HTML copiado preserva links).", "Defina como padrão para novos e-mails/respostas e salve."] },
  { id: "outlook-web", name: "Outlook (web)", steps: ["Copie o HTML.", "Abra Configurações > Contas > Assinaturas.", "Cole no editor de assinatura e salve.", "Envie um e-mail de teste para conferir."] },
  { id: "outlook-desktop", name: "Outlook (desktop)", steps: ["No Outlook, vá em Arquivo > Opções > Email > Assinaturas.", "Crie uma assinatura. Se colar HTML direto não funcionar, salve o HTML como arquivo e use a opção de inserir/colar conforme sua versão.", "Defina para novas mensagens/respostas."] },
  { id: "apple-mail", name: "Apple Mail", steps: ["Copie o HTML.", "Mail > Ajustes > Assinaturas > selecione a conta e crie uma assinatura.", "Cole o conteúdo. Em algumas versões é preciso colar com formatação preservada.", "Envie um teste para confirmar links e imagens."] },
  { id: "mobile", name: "Celular", steps: ["No app do e-mail, abra configurações de assinatura.", "Cole a versão em texto ou imagem conforme o app suportar (muitos apps móveis têm suporte limitado a HTML rico).", "Faça um envio de teste do próprio celular."] },
];

export function PostSignupSuccess({ data, premium, signatureId }: { data: SignatureData; premium: boolean; signatureId: string }) {
  const { busy, run } = useSignatureActions();
  const [testEmail, setTestEmail] = useState("");
  const [open, setOpen] = useState<string | null>("gmail");
  return <section className="panel mb-6 border-emerald-200 bg-emerald-50/60" aria-label="Próximos passos">
    <div className="flex items-start gap-3"><CheckCircle2 className="mt-0.5 text-emerald-700" /><div className="min-w-0 flex-1">
      <h2 className="text-xl font-bold text-emerald-950">Assinatura pronta</h2>
      <p className="mt-1 text-sm text-emerald-900">Copie, baixe ou instale no seu e-mail. Você pode editar quando quiser.</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button type="button" variant="outline" disabled={!!busy} onClick={() => void run("copy", async () => {
          const { html } = await jsonRequest<{ html: string }>("/api/signatures/export", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ data, format: "html" }) });
          if (typeof ClipboardItem !== "undefined" && navigator.clipboard?.write) { try { await navigator.clipboard.write([new ClipboardItem({ "text/html": new Blob([html], { type: "text/html" }) })]); } catch { await navigator.clipboard.writeText(html); } } else await navigator.clipboard.writeText(html);
          toast.success("HTML copiado.");
        })}><Copy size={16}/>Copiar HTML</Button>
        <Button type="button" variant="outline" disabled={!!busy} onClick={() => void run("png", async () => {
          const res = await fetch("/api/signatures/export", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ data, format: "png", id: signatureId }) });
          if (!res.ok) { const r = await res.json().catch(()=>null); throw new Error(r?.error ?? "Não foi possível baixar."); }
          const url = URL.createObjectURL(await res.blob()); const a = document.createElement("a"); a.href=url; a.download="assinatura.png"; a.click(); setTimeout(()=>URL.revokeObjectURL(url),1500);
          toast.success("PNG baixado.");
        })}><Download size={16}/>Baixar PNG</Button>
        <Button asChild><Link href="/precos">Conheça o Pro</Link></Button>
      </div>
      <div className="mt-5 space-y-2">
        <h3 className="font-semibold text-emerald-950">Instalar no e-mail</h3>
        {guides.map(g => <details key={g.id} open={open===g.id} onToggle={e => (e.currentTarget as HTMLDetailsElement).open && setOpen(g.id)} className="rounded-xl border border-emerald-200 bg-white p-3"><summary className="cursor-pointer text-sm font-semibold">{g.name}</summary><ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-slate-700">{g.steps.map(s => <li key={s}>{s}</li>)}</ol></details>)}
      </div>
      <div className="mt-4 rounded-xl border border-emerald-200 bg-white p-3">
        <h3 className="text-sm font-semibold">Enviar teste para meu e-mail</h3>
        <p className="mt-1 text-xs text-slate-600">Envia uma cópia da assinatura para conferência. {/* TODO: requer provedor de e-mail transacional configurado (RESEND_API_KEY/VERIFICATION_FROM_EMAIL) e endpoint de teste; hoje retorna orientação se indisponível. */}</p>
        <div className="mt-2 flex flex-wrap gap-2"><input className="min-w-[220px] flex-1 rounded-lg border border-slate-300 px-2 py-2 text-sm" type="email" placeholder="seu@email.com" value={testEmail} onChange={e=>setTestEmail(e.target.value)} /><Button type="button" variant="outline" disabled={!!busy || !testEmail} onClick={() => void run("testmail", async () => { const r = await jsonRequest<{ ok?: boolean; message?: string }>("/api/signatures/test-email", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: testEmail, signatureId }) }); toast.success(r.message || "Solicitação processada."); })}>Enviar teste</Button></div>
      </div>
    </div></div>
  </section>;
}
