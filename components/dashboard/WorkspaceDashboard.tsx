"use client";
import { Footer } from "@/components/layout/Footer";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { readDraft } from "@/hooks/use-signature-draft";
import { professionPacksEnabled } from "@/lib/feature-flags";
import { Folder, Grid2X2, Plus, Search, Sparkles, ArrowUpRight, UserCircle2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DeleteSignature, SignOutButton } from "@/components/shared/DashboardActions";
import { SignatureBuilder } from "@/components/signature/SignatureBuilder";
import { Onboarding } from "./Onboarding";
import { emptySignature, canUseTemplate, templates, toEssential, type SignatureData } from "@/types/signature";
import type { Workspace } from "@/lib/workspace";
import { jsonRequest } from "@/hooks/use-signature-actions";
import { toast } from "sonner";
import { PostSignupSuccess } from "./PostSignupSuccess";
type Props = { name: string; email: string; pro: boolean; business: boolean; owned: string[]; workspace: Workspace | null; signatures: { id: string; data: SignatureData }[]; edit?: string; creating: boolean; payment?: string; saved?: boolean };
export function WorkspaceDashboard({ name, email, pro, business, owned, workspace, signatures, edit, creating, payment, saved }: Props) {
  const router = useRouter();
  useEffect(() => {
    // Retorno pós-cadastro: se há rascunho do gerador (flag), mantém o fluxo no gerador sem perder dados.
    if (professionPacksEnabled()) {
      try { if (readDraft() && !creating && !edit) router.replace("/gerador"); } catch { }
    }
  }, [router, creating, edit]);
  const [folderId, setFolderId] = useState("");
  const [query, setQuery] = useState("");
  const [accountOpen, setAccountOpen] = useState(false);
  const [folderForm, setFolderForm] = useState(false);
  const [folderName, setFolderName] = useState("");
  const [folderColor, setFolderColor] = useState(workspace?.brand.color ?? "#5b45db");
  const [folderTemplate, setFolderTemplate] = useState<SignatureData["template"]>("modern");
  const [saving, setSaving] = useState(false);
  const [folderError, setFolderError] = useState("");
  const savedBrand = workspace?.brand ?? { ...emptySignature, name, email, template: (owned[0] as SignatureData["template"]) ?? "essential" };
  const brand = canUseTemplate(savedBrand.template, pro, owned) ? savedBrand : toEssential(savedBrand);
  const folders = workspace?.folders ?? [];
  const folder = folders.find(f => f.id === folderId);
  const selected = signatures.find(s => s.id === edit);
  const firstVisit = !workspace?.completed && signatures.length === 0;
  // Onboarding apenas na primeira visita (uma vez). "Minha conta" não reabre onboarding.
  if (firstVisit) return <Onboarding draftKey={email} initial={brand} pro={pro} business={business} owned={owned} folders={folders} />;
  const filtered = signatures.filter(s => (!folderId || s.data.folderId === folderId) && `${s.data.name} ${s.data.company} ${s.data.role}`.toLocaleLowerCase().includes(query.toLocaleLowerCase()));
  async function saveFolder() {
    if (!folderName.trim()) { setFolderError("Dê um nome à área."); return; }
    setSaving(true); setFolderError("");
    try {
      await jsonRequest("/api/workspace", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ completed: true, brand, folders: [...folders, { id: crypto.randomUUID(), name: folderName.trim(), color: folderColor, template: folderTemplate }] }) });
      setFolderForm(false); setFolderName(""); router.refresh(); toast.success("Área criada. As novas assinaturas usarão esse estilo.");
    } catch (e) { setFolderError(e instanceof Error ? e.message : "Não foi possível criar a área."); }
    finally { setSaving(false); }
  }
  return <div className="mx-auto grid min-h-[80vh] w-full max-w-[1600px] flex-1 border-b border-violet-100 md:grid-cols-[248px_minmax(0,1fr)]">
    <aside className="flex flex-col bg-[#29203f] p-5 text-white">
      <div className="mb-7 flex items-center gap-3 border-b border-white/10 pb-6"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#c6b6f3] text-xl font-bold text-[#29203f]">{(name || email || "M").slice(0, 1).toUpperCase()}</span><div className="min-w-0"><p className="truncate font-semibold">{name || "Meu espaço"}</p><p className="mt-1 truncate text-xs text-violet-200">{email}</p></div></div>
      <nav aria-label="Espaço de trabalho" className="space-y-1.5"><button onClick={() => { setFolderId(""); setAccountOpen(false); router.push("/dashboard"); }} className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm ${!accountOpen && !folderId ? "bg-white/15" : "hover:bg-white/10"}`}><Grid2X2 size={17} />Assinaturas<span className="ml-auto text-xs text-violet-200">{signatures.length}</span></button><button onClick={() => { setAccountOpen(true); setFolderId(""); }} className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm ${accountOpen ? "bg-white/15" : "hover:bg-white/10"}`}><UserCircle2 size={17} />Minha conta</button></nav>
      <div className="mb-3 mt-8 flex items-center justify-between px-3"><span className="text-[10px] font-bold uppercase tracking-[.2em] text-violet-200">Áreas da empresa</span>{business && <button aria-label="Criar área" onClick={() => setFolderForm(true)} className="rounded p-1 hover:bg-white/10"><Plus size={16} /></button>}</div>
      {business ? <div className="space-y-1">{folders.map(f => <button key={f.id} onClick={() => { setFolderId(f.id); setAccountOpen(false); router.push("/dashboard"); }} className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm ${folderId === f.id ? "bg-white/15" : "hover:bg-white/10"}`}><Folder size={17} style={{ color: f.color }} /><span className="truncate">{f.name}</span><span className="ml-auto text-xs text-violet-200">{signatures.filter(s => s.data.folderId === f.id).length}</span></button>)}{!folders.length && <button onClick={() => setFolderForm(true)} className="mx-3 text-left text-sm text-violet-200">+ Criar sua primeira área</button>}</div> : <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><Folder size={22} className="mb-3 text-[#c6b6f3]" /><p className="text-sm font-medium">Plano {pro ? "Pro" : "Free"}</p><p className="mt-2 text-xs leading-relaxed text-violet-200">{pro ? "Você tem acesso aos recursos do seu plano." : "Crie sua assinatura grátis. Recursos avançados estão no Pro."}</p><Link href="/precos" className="mt-4 inline-flex items-center gap-2 text-xs font-semibold">Ver planos <ArrowUpRight size={14} /></Link></div>}
      <div className="mt-auto pt-10"><span className="rounded-xl bg-white inline-flex"><SignOutButton /></span></div>
    </aside>
    <div className="flex min-w-0 flex-col bg-[#faf9fd]">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-violet-100 bg-white px-6 py-4"><p className="text-sm text-slate-500">Meu espaço <span className="mx-2 text-slate-300">/</span><span className="font-medium text-ink">{accountOpen ? "Minha conta" : folder?.name || "Assinaturas"}</span></p>{!accountOpen && <label className="flex items-center gap-2 rounded-xl bg-slate-50 px-3"><Search size={16} className="text-slate-400" /><input aria-label="Buscar assinaturas" placeholder="Buscar uma assinatura…" value={query} onChange={e => setQuery(e.target.value)} className="w-48 bg-transparent py-2 text-sm outline-none" /></label>}</header>
      <div className="flex-1 p-5 sm:p-8">
        {saved && selected && <PostSignupSuccess data={canUseTemplate(selected.data.template, pro, owned) ? selected.data : toEssential(selected.data)} premium={pro || owned.includes(selected.data.template)} signatureId={selected.id} />}
        {payment && <p role="status" className="mb-5 rounded-xl bg-violet-100 p-4 text-sm">{payment === "falhou" ? "O checkout não foi concluído." : "A confirmação do pagamento é automática. Atualize a página para conferir os recursos liberados."}</p>}
        {folderForm && <section aria-label="Nova área" className="panel mb-6"><div className="mb-4 flex items-center justify-between"><h2 className="text-xl font-bold">Uma nova área, um estilo próprio.</h2><button aria-label="Fechar criação de área" disabled={saving} onClick={() => setFolderForm(false)}><X size={20} /></button></div><div className="grid gap-4 sm:grid-cols-3"><label className="grid gap-2 text-sm">Nome da área<Input value={folderName} maxLength={60} placeholder="Ex.: Marketing" onChange={e => setFolderName(e.target.value)} /></label><label className="grid gap-2 text-sm">Cor da área<input type="color" value={folderColor} onChange={e => setFolderColor(e.target.value)} className="h-10 w-full" /></label><label className="grid gap-2 text-sm">Template inicial<select value={folderTemplate} onChange={e => setFolderTemplate(e.target.value as SignatureData["template"])} className="rounded-lg border p-2">{templates.filter(t => canUseTemplate(t.id, pro, owned)).map(t => <option key={t.id} value={t.id}>{t.label}</option>)}</select></label></div>{folderError && <p role="alert" className="mt-3 text-sm text-rose-700">{folderError}</p>}<Button className="mt-4" disabled={saving} onClick={() => void saveFolder()}>{saving ? "Criando…" : "Criar área"}</Button></section>}
        {accountOpen ? <section className="panel max-w-2xl"><h1 className="text-2xl font-bold">Minha conta</h1><p className="mt-1 text-sm text-slate-600">Seus dados e informações do plano.</p><dl className="mt-6 grid gap-4 sm:grid-cols-2 text-sm"><div><dt className="text-slate-500">Nome</dt><dd className="font-medium">{name || "—"}</dd></div><div><dt className="text-slate-500">E-mail</dt><dd className="font-medium">{email}</dd></div><div><dt className="text-slate-500">Plano</dt><dd className="font-medium">{business ? "Business" : pro ? "Pro" : "Free"}</dd></div><div><dt className="text-slate-500">Assinaturas salvas</dt><dd className="font-medium">{signatures.length}</dd></div></dl><div className="mt-6 flex flex-wrap gap-2"><Button asChild variant="outline"><Link href="/precos">Ver planos</Link></Button><Button type="button" variant="ghost" onClick={()=>setAccountOpen(false)}>Voltar às assinaturas</Button></div></section>
        : selected || creating ? <><div className="mb-6 flex items-center justify-between"><h1 className="text-2xl font-bold">{selected ? "Editar assinatura" : `Nova assinatura${folder ? ` · ${folder.name}` : ""}`}</h1><Button asChild variant="ghost"><Link href="/dashboard">Voltar</Link></Button></div>{!selected && !pro && signatures.length > 0 ? <p className="panel">Seu plano permite uma assinatura. Edite a existente ou <Link href="/precos" className="text-brand underline">conheça o Pro</Link>.</p> : <SignatureBuilder key={selected?.id ?? folderId + "new"} signedIn pro={pro} owned={owned} id={selected?.id} initial={selected ? canUseTemplate(selected.data.template, pro, owned) ? selected.data : toEssential(selected.data) : { ...brand, ...(folder ? { folderId: folder.id, color: folder.color, template: folder.template } : {}) }} restoreDraft={false} />}</> : <>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-4"><div><h1 className="text-2xl font-bold">{folder?.name || "Suas assinaturas"}</h1><p className="mt-1 text-sm text-slate-500">{filtered.length} assinatura{filtered.length === 1 ? "" : "s"}. Crie, edite e exporte quando precisar.</p></div>{(pro || signatures.length === 0) && <Button asChild><Link href="/dashboard?nova=1"><Plus size={16} />Nova assinatura</Link></Button>}</div>
          {filtered.length ? <div className="grid gap-4 xl:grid-cols-2">{filtered.map(({ id, data }) => <article key={id} className="overflow-hidden rounded-2xl border border-violet-100 bg-white"><div className="m-4 flex min-h-28 items-center gap-4 rounded-xl bg-slate-50 p-5"><div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-xl font-bold text-white" style={{ backgroundColor: data.color }}>{data.name.slice(0, 1)}</div><div className="min-w-0 border-l-2 pl-4" style={{ borderColor: data.color }}><h3 className="truncate font-bold">{data.name}</h3><p className="truncate text-sm text-slate-500">{[data.role, data.company].filter(Boolean).join(" · ")}</p><p className="mt-2 truncate text-xs text-slate-400">{data.email || data.phone}</p></div></div><div className="flex items-center justify-between gap-2 border-t border-slate-100 px-4 py-3"><span className="text-xs text-slate-500">{templates.find(t => t.id === data.template)?.label}</span><div className="flex items-center gap-1"><DeleteSignature id={id} name={data.name} /><Button asChild variant="outline"><Link href={`/dashboard?editar=${id}`}>Abrir</Link></Button></div></div>{business && <label className="flex items-center gap-2 border-t border-slate-100 px-4 py-3 text-xs text-slate-500"><Folder size={14} />Área<select aria-label={`Área da assinatura de ${data.name}`} value={data.folderId ?? ""} className="min-w-0 flex-1 rounded border p-1" onChange={async e => { try { await jsonRequest(`/api/signatures/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...data, folderId: e.target.value || undefined }) }); router.refresh(); } catch (error) { toast.error(error instanceof Error ? error.message : "Não foi possível mover."); } }}><option value="">Sem área</option>{folders.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}</select></label>}</article>)}</div> : <div className="rounded-3xl border border-dashed border-violet-200 bg-white p-10 text-center"><h3 className="font-semibold">{query ? "Nenhuma assinatura encontrada." : "Seu próximo grande olá começa aqui."}</h3><p className="mt-2 text-sm text-slate-500">{query ? "Experimente outro nome, cargo ou empresa." : folder ? "Crie uma assinatura nesta área ou mova uma assinatura existente para cá." : "Sua identidade está pronta. Crie sua primeira assinatura."}</p></div>}
        </>}
      </div>
      <Footer workspace />
    </div>
  </div>;
}
