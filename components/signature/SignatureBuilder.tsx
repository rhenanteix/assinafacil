"use client";
import posthog from "posthog-js";
import { useTranslation } from "@/lib/i18n/client";

import { useEffect, useRef } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Clipboard, Download, Save } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { FormFields } from "./FormFields";
import { SignaturePreview } from "./SignaturePreview";
import { TemplateSelector } from "./TemplateSelector";
import { emptySignature, signatureSchema, canUseTemplate, type SignatureData } from "@/types/signature";
import { jsonRequest, useSignatureActions } from "@/hooks/use-signature-actions";
import { clearDraft, storeAuthDraft, useSignatureDraft } from "@/hooks/use-signature-draft";

export function SignatureBuilder({ initial = emptySignature, pro = false, signedIn = false, needsVerification = false, owned = [], id, restoreDraft = true }: {
  initial?: SignatureData; pro?: boolean; signedIn?: boolean; needsVerification?: boolean; owned?: string[]; id?: string; restoreDraft?: boolean;
}) {
  const t = useTranslation();
  const router = useRouter();
  const capture = useRef<HTMLDivElement>(null);
  const savedId = useRef(id);
  const generatorTracked = useRef(false);
  useEffect(() => {
    if (generatorTracked.current) return;
    generatorTracked.current = true;
    posthog.capture("generator_visited", { signed_in: signedIn });
  }, [signedIn]);
  const form = useForm<SignatureData>({ defaultValues: initial, resolver: zodResolver(signatureSchema) });
  useSignatureDraft(form, !id && restoreDraft, { pro, owned });
  const data = { ...initial, ...useWatch({ control: form.control }) };
  const lockedTemplate = !canUseTemplate(data.template, pro, owned);
  const premium = !lockedTemplate && (pro || owned.includes(data.template));
  const { busy, run } = useSignatureActions();
  function signIn(value: SignatureData) {
    if (!storeAuthDraft(value)) {
      toast.error(t("Seu navegador bloqueou o armazenamento do rascunho. Habilite-o antes de entrar para manter os dados."));
      return;
    }
    router.push(needsVerification ? "/verificar-email?destino=gerador" : "/cadastro?destino=gerador");
  }
  const submit = (action: string, operation: (value: SignatureData) => Promise<void>) =>
    form.handleSubmit(value => run(action, async () => {
      if (lockedTemplate) throw new Error(t("Escolha um template disponível na sua conta."));
      if (!signedIn) { signIn(value); return; }
      await operation(value);
      posthog.capture(action === "copy" ? "signature_copied" : action === "png" ? "signature_downloaded" : "signature_saved", { template: value.template, premium });
    }), () => toast.error(t("Confira os campos indicados.")));
  async function upload(kind: "photo" | "logo", file?: File) {
    if (!file) return;
    await run(kind, async () => {
      const body = new FormData();
      body.append("kind", kind);
      body.set("file", file);
      const { url } = await jsonRequest<{ url: string }>("/api/upload", { method: "POST", body });
      form.setValue(kind, url, { shouldValidate: true, shouldDirty: true });
      toast.success(t("Imagem adicionada."));
    });
  }
  async function exportHtml(value: SignatureData) {
    return (await jsonRequest<{ html: string }>("/api/signatures/export", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ data: value, format: "html" }),
    })).html;
  }
  function download(blob: Blob) {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url; anchor.download = "assinatura.png"; anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
    toast.success(t("PNG baixado."));
  }
  return <form noValidate onSubmit={event => event.preventDefault()} className="grid items-start gap-6 lg:grid-cols-2">
    <section className="panel space-y-6" aria-label={t("Dados da assinatura")}>
      <div><span className="eyebrow">{t("01 / Seus dados")}</span><h2 className="mt-2 text-2xl font-bold">{t("Personalize sua assinatura")}</h2></div>
      <FormFields form={form} premium={premium} />
      {premium && <>
        <div className="grid gap-4 sm:grid-cols-2">
          <p className="text-xs text-slate-600">{t("Foto: recorte central circular em PNG de 256 × 256 px. Logo: proporção preservada em fundo transparente. Até 3 MB; imagens podem ser bloqueadas pelo destinatário.")}</p>
          {(["photo", "logo"] as const).map(kind => <div key={kind} className="space-y-2">
            <label className="block text-sm font-medium">{kind === "photo" ? t("Foto de perfil") : "Logo"}
              <input className="mt-2 block w-full text-xs" type="file" accept="image/jpeg,image/png,image/webp" disabled={!!busy} onChange={event => { const file = event.target.files?.[0]; event.target.value = ""; void upload(kind, file); }} />
            </label>
            {data[kind] && <Button type="button" variant="ghost" disabled={!!busy} onClick={() => form.setValue(kind, "", { shouldDirty: true })}>{t("Remover imagem")}</Button>}
          </div>)}
        </div>
        <label className="flex items-center gap-3 text-sm font-semibold"><input type="color" className="h-10 w-12 cursor-pointer" {...form.register("color")} /> {" "}{t("Cor principal")}{" "}<span className="font-mono text-slate-600">{data.color}</span></label>
      </>}
      <TemplateSelector value={data.template} pro={pro} owned={owned} onChange={template => form.setValue("template", template)} />
    </section>
    <section className="panel space-y-5 lg:sticky lg:top-5" aria-label={t("Prévia e exportação")}>
      <div><span className="eyebrow">{t("02 / Prévia ao vivo")}</span><h2 className="mt-2 text-2xl font-bold">{t("Veja como ficou")}</h2></div>
      <div className="grid min-h-56 place-items-center rounded-2xl border border-dashed border-indigo-200 bg-indigo-50/70 p-3 sm:p-6">
        {lockedTemplate ? <p className="text-sm text-slate-700">{t("Veja os exemplos deste modelo na")}{" "}<Link className="text-brand underline" href="/#modelos">{t("galeria")}</Link>{t(". Para usar seus dados nele,")}{" "}<Link className="text-brand underline" href="/precos">{t("desbloqueie o modelo")}</Link>.</p> :
          <SignaturePreview data={data} premium={premium} capture={capture} />}
      </div>
      {!premium && <p className="rounded-xl border border-violet-200 bg-violet-50 p-3 text-sm text-violet-900">Sua assinatura Free leva um pequeno link Maily. <Link href="/precos" className="font-semibold underline">Com o Pro, só a sua marca aparece</Link>: cores, foto, logo e 12 modelos por pagamento único.</p>}
      {!signedIn && <p className="text-sm text-slate-700">{needsVerification ? t("Confirme seu e-mail") : t("Crie sua conta gratuita")} {" "}{t("para salvar e baixar. Seus dados preenchidos acompanham o cadastro.")}</p>}
      <div className="flex flex-wrap gap-2" aria-busy={!!busy}>
        <Button type="button" disabled={!!busy || lockedTemplate} onClick={submit("copy", async value => {
          const html = exportHtml(value);
          if (typeof ClipboardItem !== "undefined" && navigator.clipboard?.write) {
            const item = new ClipboardItem({ "text/html": html.then(content => new Blob([content], { type: "text/html" })), "text/plain": html.then(content => new Blob([content], { type: "text/plain" })) });
            try { await navigator.clipboard.write([item]); }
            catch { await navigator.clipboard.writeText(await html); toast.success(t("Código HTML copiado.")); return; }
          } else { await navigator.clipboard.writeText(await html); }
          toast.success(t("HTML copiado."));
        })}><Clipboard size={16} />{busy === "copy" ? t("Copiando…") : t("Copiar HTML")}</Button>
        <Button type="button" variant="outline" disabled={!!busy || lockedTemplate} onClick={submit("png", async value => {
          if (!premium) {
            const response = await fetch("/api/signatures/export", {
              method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ data: value, format: "png", id: savedId.current }),
            });
            if (!response.ok) {
              const result = await response.json().catch(() => null);
              throw new Error(result?.error ?? t("Não foi possível baixar."));
            }
            savedId.current = response.headers.get("X-Signature-Id") ?? savedId.current;
            download(await response.blob());
            clearDraft();
            router.replace(`/dashboard?editar=${savedId.current}`);
            router.refresh();
            return;
          }
          // Revalidate access at export time and wait for matching preview content.
          await exportHtml(value);
          const node = capture.current;
          if (!node || node.dataset.previewKey !== JSON.stringify(value)) throw new Error(t("Aguarde a atualização da prévia e tente novamente."));
          await Promise.all(Array.from(node.querySelectorAll("img")).map(image => image.decode()));
          const { default: html2canvas } = await import("html2canvas");
          const canvas = await html2canvas(node, { scale: 2, useCORS: true, backgroundColor: "#ffffff" });
          const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, "image/png"));
          if (!blob) throw new Error(t("Não foi possível gerar o PNG."));
          download(blob);
        })}><Download size={16} />{busy === "png" ? t("Exportando…") : t("Baixar PNG")}</Button>
        <Button type="button" variant="ghost" disabled={!!busy || lockedTemplate} onClick={submit("save", async value => {
          const current = savedId.current;
          const result = await jsonRequest<{ id: string }>(current ? `/api/signatures/${current}` : "/api/signatures", {
            method: current ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(value),
          });
          savedId.current = result.id;
          clearDraft();
          router.replace(`/dashboard?editar=${result.id}`);
          router.refresh();
          toast.success(t("Assinatura salva."));
        })}><Save size={16} />{busy === "save" ? t("Salvando…") : t("Salvar assinatura")}</Button>
      </div>
      <p className="text-xs leading-relaxed text-slate-600">{premium ? t("Cole o HTML nas configurações do e-mail para manter os links clicáveis. O PNG é uma imagem.") : t("O Essencial inclui HTML com links clicáveis e PNG, com layout fixo e marca Maily.")}</p>
      {signedIn && <Link href="/dashboard" className="block text-sm text-brand underline">{t("Abrir minhas assinaturas")}</Link>}
    </section>
  </form>;
}
