"use client";
import { Footer } from "@/components/layout/Footer";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SignaturePreview } from "@/components/signature/SignaturePreview";
import { canUseTemplate, signatureSchema, templates, type SignatureData } from "@/types/signature";
import { socialNetworks } from "@/types/social";
import { jsonRequest } from "@/hooks/use-signature-actions";
import { clearDraft, readDraft } from "@/hooks/use-signature-draft";
import { extractBrandColor } from "@/lib/brand-color";
import type { Workspace } from "@/lib/workspace";
const steps = ["Boas-vindas", "Sua identidade", "Seus contatos", "Seu estilo"];
const contacts = [["phone", "Telefone", "tel"], ["email", "E-mail", "email"], ["address", "Endereço", "text"], ["professionalRegistration", "Registro profissional", "text"], ["whatsapp", "WhatsApp", "tel"], ["website", "Site", "url"]] as const;
export function Onboarding({ initial, pro, business, owned, folders, onCancel, draftKey }: { initial: SignatureData; pro: boolean; business: boolean; owned: string[]; folders: Workspace["folders"]; onCancel?: () => void; draftKey: string }) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState(initial);
  const [enabled, setEnabled] = useState<string[]>(contacts.filter(([key]) => initial[key]).map(([key]) => key));
  const [restored, setRestored] = useState(false);
  const storageKey = `maily:onboarding:v1:${draftKey}`;
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(storageKey);
      const draft = saved ? JSON.parse(saved) : !onCancel ? { data: readDraft(), step: 0 } : null;
      if (draft?.data && typeof draft.data === "object") {
        const parsed = signatureSchema.safeParse({ ...draft.data, name: draft.data.name || "Seu nome" });
        if (parsed.success && canUseTemplate(parsed.data.template, pro, owned)) {
          const restoredData = { ...parsed.data, name: draft.data.name || "" };
          setData(restoredData);
          setEnabled(contacts.filter(([key]) => restoredData[key]).map(([key]) => key));
          if (Number.isInteger(draft.step) && draft.step >= 0 && draft.step <= 3) setStep(draft.step);
        }
      }
    } catch { /* Storage is optional; the wizard still works without it. */ }
    setRestored(true);
    // Restore once when this wizard mounts, not when parent props refresh.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);
  useEffect(() => {
    if (!restored) return;
    try { sessionStorage.setItem(storageKey, JSON.stringify({ data, step })); } catch { /* Optional recovery. */ }
  }, [data, step, restored, storageKey]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const capture = useRef<HTMLDivElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const router = useRouter();
  const premium = pro || owned.includes(data.template);
  function update(key: keyof SignatureData, value: string) { setData(old => ({ ...old, [key]: value })); setError(""); }
  function move(next: number) { setStep(next); setError(""); requestAnimationFrame(() => heading.current?.focus()); }
  async function upload(kind: "logo" | "photo", file?: File) {
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) { setError("Escolha uma imagem de até 3 MB."); return; }
    setBusy(true); setError("");
    try {
      const body = new FormData(); body.set("file", file); body.set("kind", kind);
      const { url } = await jsonRequest<{ url: string }>("/api/upload", { method: "POST", body });
      let color: string | null = null;
      if (kind === "logo") color = await extractBrandColor(file).catch(() => null);
      setData(old => ({ ...old, [kind]: url, ...(color ? { color } : {}) }));
      toast.success(color ? "Encontramos uma cor da sua marca. Você pode ajustá-la no próximo passo." : "Imagem adicionada. Escolha a cor da marca no próximo passo.");
    } catch (e) { setError(e instanceof Error ? e.message : "Não foi possível enviar a imagem."); }
    finally { setBusy(false); }
  }
  async function next() {
    if (step === 1 && (!data.name.trim() || (business && !data.company.trim()))) { setError("Preencha seu nome" + (business ? " e o nome da empresa." : ".")); return; }
    if (step === 2 || step === 3) {
      const parsed = signatureSchema.safeParse(data);
      if (!parsed.success) { setError(parsed.error.issues[0].message); return; }
    }
    if (step < 3) { move(step + 1); return; }
    setBusy(true);
    try {
      await jsonRequest("/api/workspace", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ completed: true, brand: data, folders: business ? folders : [] }) });
      try { sessionStorage.removeItem(storageKey); } catch { /* Optional recovery. */ }
      clearDraft();
      toast.success("Tudo pronto! Sua identidade está salva. Agora crie sua assinatura.");
      if (onCancel) onCancel();
      router.replace("/dashboard?nova=1"); router.refresh();
    } catch (e) { setError(e instanceof Error ? e.message : "Não foi possível salvar. Tente novamente."); }
    finally { setBusy(false); }
  }
  return <div className="shell py-8 sm:py-12">
    <div className="mb-9 flex items-center justify-between gap-4"><span className="eyebrow">Seu primeiro olá começa aqui</span><span className="rounded-full border border-violet-200 bg-white px-3 py-1 text-xs font-semibold">Maily {business ? "Business" : pro ? "Pro" : "Free"}</span></div>
    <ol className="mb-10 grid grid-cols-4 gap-2" aria-label="Etapas do onboarding">{steps.map((label, index) => <li key={label} aria-current={step === index ? "step" : undefined} className={`border-t-2 pt-3 text-xs sm:text-sm ${index <= step ? "border-brand text-brand" : "border-slate-200 text-slate-500"}`}><span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-white">{index < step ? <Check size={14} /> : index + 1}</span><span className="hidden sm:inline">{label}</span></li>)}</ol>
    <div className="grid items-start gap-8 lg:grid-cols-[1fr_.9fr]">
      <section className="panel min-h-[470px]">
        <p className="eyebrow">Passo {step + 1} de 4</p>
        <h1 ref={heading} tabIndex={-1} className="mb-3 mt-3 text-3xl font-bold tracking-tight sm:text-4xl">{["Vamos deixar sua marca?", business ? "A essência da sua empresa." : "Muito prazer, você.", "O que conecta você ao mundo?", "Uma assinatura com a sua cara."][step]}</h1>
        <p className="mb-7 text-sm leading-relaxed text-slate-500">{["Poucos passos, muitas possibilidades. Vamos criar uma identidade que faz cada e-mail parecer seu.", "Comece com o essencial. Você pode mudar tudo depois.", "Escolha o que aparece na assinatura. Só os campos preenchidos serão exibidos.", "Escolha um modelo e acompanhe o resultado ao lado."][step]}</p>
        {step === 0 && <div className="space-y-4">{["Conte um pouco sobre você", "Escolha os contatos que importam", "Encontre seu estilo e veja tudo ganhar vida"].map((text, i) => <div key={text} className="flex items-center gap-4 rounded-2xl bg-violet-50 p-4"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white font-bold text-brand">0{i + 1}</span><p className="text-sm font-medium">{text}</p></div>)}<p className="pt-2 text-xs text-slate-500">{business ? "Sua marca também será o ponto de partida para as áreas da empresa." : "Seu plano já está conectado. Vamos usar os recursos disponíveis na sua conta."}</p></div>}
        {step === 1 && <div className="space-y-5">{([["name", "Seu nome", "Como você se apresenta?"], ["role", "Cargo", "Ex.: Designer de produto"], ["company", "Empresa", "Nome da sua marca"]] as const).map(([key, label, placeholder]) => <label key={key} className="grid gap-2 text-sm font-medium">{label}<Input value={data[key]} placeholder={placeholder} maxLength={100} onChange={e => update(key, e.target.value)} /></label>)}{(pro || owned.length > 0) && <div className="grid gap-3 sm:grid-cols-2">{(["logo", "photo"] as const).map(kind => <label key={kind} className="rounded-2xl border border-dashed border-violet-300 bg-violet-50/50 p-4 text-sm font-medium">{kind === "logo" ? "Logo da empresa" : "Sua foto"}{data[kind] && <img src={data[kind]} alt={kind === "logo" ? "Logo enviada" : "Foto enviada"} className="my-2 h-14 w-14 object-contain" />}<input type="file" accept="image/png,image/jpeg,image/webp" className="mt-3 block w-full text-xs" disabled={busy} onChange={e => { void upload(kind, e.target.files?.[0]); e.target.value = ""; }} /><span className="mt-2 block text-xs text-slate-500">PNG, JPG ou WebP · até 3 MB</span></label>)}</div>}</div>}
        {step === 2 && <div className="space-y-3">{contacts.filter(([key]) => key !== "website" || premium).map(([key, label, type]) => <div key={key} className="rounded-xl border border-slate-200 p-3"><label className="flex items-center gap-3 text-sm font-medium"><input type="checkbox" className="accent-violet-600" checked={enabled.includes(key)} onChange={e => { setEnabled(old => e.target.checked ? [...old, key] : old.filter(k => k !== key)); if (!e.target.checked) update(key, ""); }} />{label}</label>{enabled.includes(key) && <div className="mt-3">{key === "professionalRegistration" && <select aria-label="Tipo de registro" value={data.professionalRegistrationType ?? ""} className="mb-2 w-full rounded-lg border p-2" onChange={e => update("professionalRegistrationType", e.target.value)}><option value="">Tipo de registro</option>{["OAB", "CRM", "CRECI", "CRC", "CNPJ"].map(v => <option key={v}>{v}</option>)}</select>}<Input aria-label={label} type={type} value={data[key]} placeholder={type === "url" ? "https://" : key === "whatsapp" ? "+55 11 99999-0000" : label} onChange={e => update(key, e.target.value)} /></div>}</div>)}{premium && <details className="rounded-xl border border-slate-200 p-4"><summary className="cursor-pointer text-sm font-semibold">Adicionar redes sociais</summary><div className="mt-4 space-y-3">{socialNetworks.filter(n => n.key !== "whatsapp").map(n => <label key={n.key} className="grid gap-1 text-sm">{n.label}<Input type="url" value={data[n.key]} placeholder={`https://${n.domains[0]}/`} onChange={e => update(n.key, e.target.value)} /></label>)}</div></details>}</div>}
        {step === 3 && <div className="space-y-6">{premium && <label className="flex items-center gap-3 rounded-xl bg-violet-50 p-4 text-sm font-semibold"><input aria-label="Cor da marca" type="color" value={data.color} onChange={e => update("color", e.target.value)} className="h-10 w-12" />Cor da marca <span className="font-mono text-xs">{data.color}</span></label>}<div className="grid grid-cols-2 gap-3">{templates.filter(template => canUseTemplate(template.id, pro, owned)).map(template => <button key={template.id} type="button" aria-pressed={data.template === template.id} onClick={() => update("template", template.id)} className={`rounded-2xl border p-4 text-left transition hover:border-violet-400 ${data.template === template.id ? "border-brand bg-violet-50 ring-1 ring-brand" : "border-slate-200"}`}><span className="mb-3 flex h-12 items-center gap-2 rounded-lg bg-white p-2" aria-hidden="true"><span className={`h-7 w-7 ${template.id === "classic" ? "rounded" : "rounded-full"}`} style={{ backgroundColor: data.color }} /><span className="space-y-1"><span className="block h-1.5 w-14 rounded bg-slate-300" /><span className="block h-1 w-10 rounded bg-slate-200" /></span></span><span className="text-sm font-semibold">{template.label}</span></button>)}</div>{!pro && <p className="text-xs text-slate-500">O Free inclui o Essencial com identidade Maily. Modelos, cores e imagens personalizados estão disponíveis nos planos premium.</p>}</div>}
        {error && <p role="alert" className="mt-5 rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
        <div className="mt-8 flex items-center justify-between gap-3 border-t border-slate-100 pt-5"><Button variant="ghost" disabled={busy || (step === 0 && !onCancel)} onClick={() => step === 0 ? onCancel?.() : move(step - 1)}><ArrowLeft size={16} />{step === 0 ? "Voltar" : "Anterior"}</Button><Button disabled={busy} onClick={() => void next()}>{busy ? "Salvando…" : step === 0 ? "Vamos começar" : step === 3 ? "Entrar no meu espaço" : "Continuar"}<ArrowRight size={16} /></Button></div>
      </section>
      <aside className="relative overflow-hidden rounded-[32px] border border-violet-100 bg-[#eee9fb] p-6 sm:p-8 lg:sticky lg:top-6"><div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-violet-700"><Sparkles size={15} />Sua próxima primeira impressão</div><div className="my-8 rounded-2xl bg-white shadow-xl shadow-violet-900/5"><div className="flex items-center gap-1.5 border-b border-slate-100 p-4">{["bg-rose-200", "bg-amber-200", "bg-emerald-200"].map(c => <span key={c} className={`h-2 w-2 rounded-full ${c}`} />)}<span className="ml-3 text-xs text-slate-400">Uma nova mensagem</span></div><div className="p-5 text-sm text-slate-400"><p>Olá! Tudo bem?</p><p className="mb-7 mt-2">Vamos criar algo incrível juntos.</p><div className="overflow-x-auto"><SignaturePreview data={data} premium={premium} capture={capture} /></div></div></div><div className="flex items-center gap-3"><img src="/mascote/boas-vindas.png" alt="Maily, seu companheiro de criação" width={110} height={110} className="h-28 w-28 object-contain" /><p className="text-sm leading-relaxed text-violet-900">{step === 0 ? "Eu cuido dos detalhes. Você deixa sua marca." : "Está ficando a sua cara! Cada detalhe aparece aqui em tempo real."}</p></div><p className="mt-5 text-center text-xs text-violet-700">Feito por você. Com uma patinha da Maily.</p></aside>
    </div>
    <Footer workspace />
  </div>;
}
