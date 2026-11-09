"use client";
import posthog from "posthog-js";
import { useTranslation } from "@/lib/i18n/client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { LinkWithOnClick } from "@/components/shared/LinkWithOnClick";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Lock, Clipboard, Save, FileText } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MaskedInput } from "@/components/ui/masked-input";
import { EmailMockup } from "./EmailMockup";
import { SignaturePreview } from "./SignaturePreview";
import { TemplateSelector } from "./TemplateSelector";
import { emptySignature, signatureSchema, canUseTemplate, templates, type SignatureData } from "@/types/signature";
import { socialNetworks } from "@/types/social";
import { jsonRequest, useSignatureActions } from "@/hooks/use-signature-actions";
import { clearDraft, storeAuthDraft, storeDraftMeta, useSignatureDraft } from "@/hooks/use-signature-draft";
import { professionPacks, type ProfessionPack } from "@/lib/professions";
import { conselhosProfissionais } from "@/lib/professions/registries";
import { avisosModelo } from "@/lib/professions/notices";
import { avaliarRegras, textoGuia } from "@/lib/professions/checklist";
import { maskPhoneBR, maskCEP, maskCNPJ, validCEP, validCNPJ } from "@/lib/masks";
import { captureUtm } from "@/lib/utm";

const tabs = ["Dados", "Imagens", "Redes", "Extras", "Empresa"] as const;
type Tab = typeof tabs[number];

export function ProfessionSignatureBuilder({ initial = emptySignature, pro = false, signedIn = false, needsVerification = false, owned = [], id, restoreDraft = true, initialProfession }: {
  initial?: SignatureData; pro?: boolean; signedIn?: boolean; needsVerification?: boolean; owned?: string[]; id?: string; restoreDraft?: boolean; initialProfession?: string;
}) {
  const t = useTranslation();
  const router = useRouter();
  const capture = useRef<HTMLDivElement>(null);
  const savedId = useRef(id);
  const tracked = useRef(false);
  const utm = useMemo(() => captureUtm(), []);
  const [tab, setTab] = useState<Tab>("Dados");
  const [stage, setStage] = useState<"pick" | "edit">(initialProfession ? "edit" : "pick");
  const [professionId, setProfessionId] = useState(initialProfession ?? "");
  const [companySize, setCompanySize] = useState<NonNullable<SignatureData["companySize"]> | "">("");
  const [to, setTo] = useState("cliente@exemplo.com.br");
  const [subject, setSubject] = useState(t("Retorno sobre sua mensagem"));
  const [viewTemplate, setViewTemplate] = useState<SignatureData["template"] | null>(null);
  const [cnpjBusy, setCnpjBusy] = useState(false);
  const [cnpjSugestao, setCnpjSugestao] = useState<{ razao_social?: string; nome_fantasia?: string; logradouro?: string; bairro?: string; municipio?: string; uf?: string; telefone?: string; cep?: string } | null>(null);
  const pack = professionPacks.find(p => p.id === professionId);
  const form = useForm<SignatureData>({ defaultValues: { ...initial, professionId: initialProfession ?? initial.professionId ?? "" }, resolver: zodResolver(signatureSchema) });
  useSignatureDraft(form, !id && restoreDraft, { pro, owned });
  const formData = { ...emptySignature, ...useWatch({ control: form.control }) };
  const data = viewTemplate ? { ...formData, template: viewTemplate } : formData;
  const { busy, run } = useSignatureActions();
  useEffect(() => { if (viewTemplate && canUseTemplate(viewTemplate, pro, owned)) setViewTemplate(null); }, [viewTemplate, pro, owned]);

  useEffect(() => { if (tracked.current) return; tracked.current = true; posthog.capture("generator_visited", { signed_in: signedIn, profession_id: professionId || undefined, ...utm }); }, [signedIn, professionId, utm]);
  useEffect(() => { posthog.capture("preview_viewed", { template: data.template, profession_id: professionId || undefined, ...utm }); }, []); // eslint-disable-line
  useEffect(() => { storeDraftMeta({ professionId: professionId || undefined, companySize: companySize || undefined, utm }); }, [professionId, companySize, utm]);
  useEffect(() => { if (initialProfession) applyPack(initialProfession, true); }, []); // eslint-disable-line

  function applyPack(id: string, keepName = false) {
    const p = professionPacks.find(x => x.id === id);
    if (!p) { setProfessionId(""); form.setValue("professionId", "", { shouldDirty: true }); setStage("edit"); return; }
    setProfessionId(id);
    posthog.capture("profession_selected", { profession_id: id, source: initialProfession === id ? "page" : "picker", ...utm });
    const template = p.recommendedModels.find(m => canUseTemplate(m, pro, owned)) ?? p.recommendedModels[0] ?? "essential";
    form.setValue("professionId", id, { shouldDirty: true });
    form.setValue("template", template, { shouldDirty: true });
    form.setValue("color", p.example.color, { shouldDirty: true });
    form.setValue("ctaLabel", p.cta.label, { shouldDirty: true });
    form.setValue("ctaType", p.cta.type, { shouldDirty: true });
    if (pro && p.notice.text) form.setValue("legalNotice", p.notice.text.slice(0, 300), { shouldDirty: true });
    if (!keepName && !form.getValues("name")) {
      form.setValue("role", p.example.role ?? "", { shouldDirty: true });
      form.setValue("company", p.example.company ?? "", { shouldDirty: true });
    }
    // Mapeia campos do pacote para o schema existente (retrocompatível).
    if (p.id === "freelancer-designer") {
      if (p.example.website) form.setValue("website", p.example.website as string, { shouldDirty: true });
      if ((p.example as any).instagram) form.setValue("instagram", (p.example as any).instagram, { shouldDirty: true });
    }
    const reg = p.fields.find(f => f.key === "professionalRegistration")?.registrationTypes?.[0];
    if (reg) form.setValue("professionalRegistrationType", reg as any, { shouldDirty: true });
    setStage("edit");
  }

  const lockedTemplate = !canUseTemplate(formData.template, pro, owned);
  const previewingLocked = !!viewTemplate && !canUseTemplate(viewTemplate, pro, owned);
  const premium = !lockedTemplate && (pro || owned.includes(formData.template));
  const publicPreview = !signedIn; // fluxo sem conta: prévia visual pública (sem persistir); exportação continua protegida

  function field(key: keyof SignatureData, label: string, type = "text", placeholder?: string, onChange?: (v: string) => string) {
    const err = (form.formState.errors as any)[key];
    return <label key={String(key)} className="grid gap-1.5 text-sm font-medium">{t(label)}
      <Input type={type} value={(data as any)[key] ?? ""} placeholder={placeholder} onChange={e => form.setValue(key, (onChange ? onChange(e.target.value) : e.target.value) as any, { shouldValidate: true, shouldDirty: true })} aria-invalid={!!err} />
      {err && <span className="text-xs text-red-700">{t(err.message ?? "Confira os campos indicados.")}</span>}
    </label>;
  }

  function ProLock({ note, source = "pro_lock" }: { note: string; source?: string }) {
    useEffect(() => { posthog.capture("resource_pro_locked_seen", { source, tab, profession_id: professionId || undefined, ...utm }); }, [source]); // eslint-disable-line
    return <div className="flex items-start gap-2 rounded-xl border border-violet-200 bg-violet-50 p-3 text-sm text-violet-900"><Lock size={16} className="mt-0.5 shrink-0" /><span>{t(note)}{" "}<LinkWithOnClick href="/precos" className="font-semibold underline" onClick={() => posthog.capture("upgrade_started", { source, tab, ...utm })}>{t("Conheça o Pro")}</LinkWithOnClick></span></div>;
  }

  async function saveToAccount(value: SignatureData) {
    const current = savedId.current;
    const result = await jsonRequest<{ id: string }>(current ? `/api/signatures/${current}` : "/api/signatures", {
      method: current ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(value),
    });
    savedId.current = result.id;
    if (companySize) {
      try { await jsonRequest("/api/lead", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ companySize }) }); posthog.capture("company_size_informed", { company_size: companySize, ...utm }); } catch {}
    }
    clearDraft();
    posthog.capture("signature_saved", { template: value.template, premium, profession_id: professionId || undefined, ...utm });
    router.replace(`/dashboard?editar=${result.id}&salva=1`); router.refresh();
    toast.success(t("Assinatura salva."));
  }

  function goSignup() {
    posthog.capture("use_signature_clicked", { source: "button", profession_id: professionId || undefined, ...utm });
    if (!storeAuthDraft(form.getValues())) toast.error(t("Seu navegador bloqueou o armazenamento do rascunho. Habilite-o antes de entrar para manter os dados."));
    posthog.capture("signup_started", { source: "use_signature", profession_id: professionId || undefined, ...utm });
    router.push(needsVerification ? "/verificar-email?destino=gerador" : "/cadastro?destino=gerador");
  }

  if (stage === "pick") {
    return <div className="panel space-y-5"><h2 className="text-2xl font-bold">{t("Qual é a sua profissão?")}</h2>
      <p className="text-slate-600">{t("Abrimos o gerador com campos e sugestões para o seu contexto. Você pode ajustar tudo.")}</p>
      <div className="grid gap-3 sm:grid-cols-2">{professionPacks.map(p => <button key={p.id} type="button" onClick={() => applyPack(p.id)} className="rounded-2xl border border-slate-200 p-4 text-left hover:border-violet-400"><span className="font-semibold">{p.name}</span><span className="mt-1 block text-sm text-slate-600">{p.cta.label}</span></button>)}</div>
      <Button variant="outline" onClick={() => { setProfessionId(""); setStage("edit"); }}>{t("Outra / sem profissão")}</Button>
    </div>;
  }

  return <div className="grid items-start gap-6 lg:grid-cols-2">
    <section className="panel space-y-5" aria-label={t("Dados da assinatura")}>
      <div className="flex flex-wrap items-center gap-2 text-sm"><span className="font-semibold">{pack ? pack.name : t("Sem profissão")}</span><button type="button" className="text-brand underline" onClick={() => setStage("pick")}>{t("Trocar")}</button></div>
      <div className="flex flex-wrap gap-2">{tabs.map(x => <button key={x} type="button" onClick={() => { setTab(x); posthog.capture("tab_opened", { tab: x, profession_id: professionId || undefined, ...utm }); }} className={`rounded-full px-3 py-1.5 text-sm font-semibold ${tab===x?"bg-violet-100 text-brand":"bg-slate-100 text-slate-700"}`}>{t(x)}</button>)}</div>
      {tab === "Dados" && <div className="grid gap-4 sm:grid-cols-2">
        {field("name","Nome completo","text","Seu nome")}
        {field("role","Cargo")}
        {field("company","Empresa")}
        {field("phone","Telefone","tel","+55 (11) 99999-0000", maskPhoneBR)}
        {field("whatsapp","WhatsApp","tel","+55 (11) 99999-0000", maskPhoneBR)}
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" value={(data as any).whatsappSameAsPhone ? "1" : ""} onChange={e=>form.setValue("whatsappSameAsPhone", e.target.checked,{shouldDirty:true})} />
          {t("Usar o mesmo número do telefone para o WhatsApp")}
        </label>
        <label className="grid gap-1.5 text-sm font-medium">{t("Mensagem pré-preenchida no WhatsApp")}
          <Input type="text" value={(data as any).whatsappMessage ?? ""} placeholder="Olá, vim pelo seu e-mail" onChange={e=>form.setValue("whatsappMessage", e.target.value,{shouldDirty:true})} />
          <p className="text-xs text-slate-600">{t("Será codificada no link do WhatsApp.")}</p>
        </label>
        {field("email","E-mail","email","nome@exemplo.com.br")}
        {field("address","Endereço")}
        {field("website", pack?.id === "freelancer-designer" ? "Portfólio / site" : "Site","url","https://")}
        {pack?.id !== "freelancer-designer" && (
          <div className="flex flex-col gap-2">
            <label className="grid gap-1.5 text-sm font-medium">CNPJ
              <div className="flex gap-2">
                <MaskedInput mask="cnpj" {...(()=>{const {onChange:_o,...rest}=form.register("cnpj");return rest;})()} onChange={(v)=>form.setValue("cnpj",v,{shouldValidate:true,shouldDirty:true})} placeholder="00.000.000/0000-00" aria-invalid={!!form.formState.errors.cnpj} aria-describedby={form.formState.errors.cnpj ? "error-cnpj" : undefined} />
                <button type="button" disabled={cnpjBusy || !validCNPJ(form.getValues("cnpj") as string)} className="px-3 py-1.5 text-xs font-medium rounded-md border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-50" onClick={async () => {
                  const raw = form.getValues("cnpj") as string;
                  setCnpjBusy(true);
                  try {
                    const response = await fetch("/api/lookup", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ tipo: "cnpj", valor: raw }) });
                    if (!response.ok) throw new Error("falha");
                    const { data } = await response.json();
                    setCnpjSugestao(data ?? null);
                  } catch {
                    setCnpjSugestao(null);
                  } finally {
                    setCnpjBusy(false);
                  }
                }}>{cnpjBusy ? "…" : "Consultar CNPJ"}</button>
              </div>
              {form.formState.errors.cnpj && <span id="error-cnpj" className="text-xs text-red-700">{t(form.formState.errors.cnpj.message ?? "CNPJ inválido.")}</span>}
            </label>
            {cnpjSugestao && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950 space-y-2">
                <p className="font-semibold">{t("Preencher com dados da empresa?")}</p>
                <p className="text-xs">{cnpjSugestao.nome_fantasia || cnpjSugestao.razao_social || ""}</p>
                <p className="text-xs">{[cnpjSugestao.logradouro, cnpjSugestao.bairro, `${cnpjSugestao.municipio}/${cnpjSugestao.uf}`].filter(Boolean).join(", ")}</p>
                <div className="flex gap-2">
                  <button type="button" className="px-3 py-1.5 text-xs font-medium rounded-md bg-brand text-white hover:bg-brand/90" onClick={() => {
                    const valores = form.getValues();
                    if (!valores.company && (cnpjSugestao?.nome_fantasia || cnpjSugestao?.razao_social)) form.setValue("company", cnpjSugestao.nome_fantasia ?? cnpjSugestao?.razao_social ?? "", { shouldDirty: true });
                    if (!valores.address && cnpjSugestao?.logradouro) {
                      const endereco = [cnpjSugestao.logradouro, cnpjSugestao.bairro, `${cnpjSugestao.municipio}/${cnpjSugestao.uf}`].filter(Boolean).join(", ");
                      form.setValue("address", endereco, { shouldDirty: true });
                    }
                    if (!valores.phone && cnpjSugestao?.telefone) form.setValue("phone", cnpjSugestao.telefone, { shouldDirty: true });
                    if (!valores.whatsapp && cnpjSugestao?.telefone) form.setValue("whatsapp", cnpjSugestao.telefone, { shouldDirty: true });
                    setCnpjSugestao(null);
                    posthog.capture("cnpj_autofill_accepted", { profession_id: professionId || undefined, ...utm });
                  }}>{t("Aplicar dados")}</button>
                  <button type="button" className="px-3 py-1.5 text-xs font-medium rounded-md border border-slate-300 bg-white hover:bg-slate-50" onClick={() => {
                    setCnpjSugestao(null);
                    posthog.capture("cnpj_autofill_declined", { profession_id: professionId || undefined, ...utm });
                  }}>{t("Ignorar")}</button>
                </div>
              </div>
            )}
          </div>
        )}
        {pack?.fields.find(f=>f.key==="professionalRegistration") && field("professionalRegistration", pack.fields.find(f=>f.key==="professionalRegistration")?.label ?? "Registro profissional")}
        {(form.getValues("professionalRegistrationType") && form.getValues("professionalRegistrationType") !== "") && (
          <div className="flex flex-col gap-2">
            <label className="grid gap-1.5 text-sm font-medium">UF
              <Input type="text" value={(data as any).professionalRegistrationUf ?? ""} placeholder="SP" maxLength={2} onChange={e=>form.setValue("professionalRegistrationUf", e.target.value.toUpperCase(),{shouldDirty:true})} />
            </label>
            {conselhosProfissionais.find(c=>c.id===form.getValues("professionalRegistrationType"))?.rqe && (
              <label className="grid gap-1.5 text-sm font-medium">RQE (opcional)
                <Input type="text" value={(data as any).professionalRegistrationRqe ?? ""} placeholder="Ex.: 12345" onChange={e=>form.setValue("professionalRegistrationRqe", e.target.value,{shouldDirty:true})} />
              </label>
            )}
          </div>
        )}
        {pack?.id === "freelancer-designer" && field("behance", "Behance", "url", "https://behance.net/")}
        {pack?.id === "freelancer-designer" && field("dribbble", "Dribbble", "url", "https://dribbble.com/")}
        {pack?.id === "freelancer-designer" && field("instagram", "Instagram", "url", "https://instagram.com/")}
      </div>}
      {tab === "Imagens" && <div className="space-y-4">
        {pro ? <div className="grid gap-4 sm:grid-cols-2">{(["photo","logo"] as const).map(kind => <div key={kind} className="space-y-2"><label className="block text-sm font-medium">{kind==="photo"?t("Foto de perfil"):t("Logo")}<input className="mt-2 block w-full text-xs" type="file" accept="image/jpeg,image/png,image/webp" disabled={!!busy} onChange={e=>{const file=e.target.files?.[0]; e.target.value=""; if(!file)return; void run(kind, async()=>{const body=new FormData(); body.append("kind",kind); body.set("file",file); const {url}=await jsonRequest<{url:string}>("/api/upload",{method:"POST",body}); form.setValue(kind,url,{shouldDirty:true}); toast.success(t("Imagem adicionada."));});}} /></label>{(data as any)[kind] && <Button type="button" variant="ghost" disabled={!!busy} onClick={()=>form.setValue(kind,"" as any,{shouldDirty:true})}>{t("Remover imagem")}</Button>}</div>)}<p className="text-xs text-slate-600">{t("Foto/logo: imagens em URL pública; podem ser bloqueadas pelo destinatário.")}</p></div> : <ProLock note="Foto, logo e cores da marca estão disponíveis no Pro. A prévia continua funcionando." source="images" />}
      </div>}
      {tab === "Redes" && <div className="space-y-3">
        {pro ? <div className="grid gap-4 sm:grid-cols-2">{socialNetworks.filter(n=>n.key!=="whatsapp").map(n => field(n.key as any, n.label, "url", `https://${n.domains[0]}/`))}</div> : <ProLock note="Ícones e links sociais estão disponíveis no Pro." source="social" />}
      </div>}
      {tab === "Extras" && <div className="space-y-4">
        <div className="space-y-2"><h3 className="font-semibold">{t("CTA")}</h3>{pro ? <div className="grid gap-3 sm:grid-cols-2">{field("ctaLabel","Texto do botão")}<label className="grid gap-1.5 text-sm font-medium">{t("Tipo")}<select className="rounded-lg border border-slate-300 p-2" value={data.ctaType} onChange={e=>form.setValue("ctaType", e.target.value as any,{shouldDirty:true})}><option value="link">{t("Link")}</option><option value="whatsapp">WhatsApp</option></select></label>{data.ctaType==="link" && field("ctaUrl","URL do botão","url","https://")}</div> : <ProLock note="CTA do pacote está disponível no Pro." source="cta" />}</div>
        <div className="space-y-2"><h3 className="font-semibold">{t("Aviso")}</h3>{pro ? <div className="space-y-2">
          <label className="grid gap-1.5 text-sm font-medium">{t("Aviso-modelo (opcional)")}
            <select className="rounded-lg border border-slate-300 p-2 text-sm" value={data.legalNotice ? "custom" : ""} onChange={e=>{
              const id = e.target.value;
              if (id && id !== "custom" && !data.legalNotice) {
                const aviso = avisosModelo.find(a => a.id === id);
                if (aviso) form.setValue("legalNotice", aviso.texto, { shouldDirty: true });
              }
            }}>
              <option value="">{t("Nenhum")}</option>
              {avisosModelo.filter((a: (typeof avisosModelo)[number]) => !a.profissoes || a.profissoes.length === 0 || a.profissoes.includes(professionId || "")).map((a: (typeof avisosModelo)[number]) => <option key={a.id} value={a.id}>{a.label}</option>)}
              <option value="custom">{t("Texto personalizado")}</option>
            </select>
          </label>
          <textarea className="w-full rounded-lg border border-slate-300 p-2 text-sm" rows={3} value={data.legalNotice} onChange={e=>form.setValue("legalNotice", e.target.value,{shouldDirty:true})} />
          <p className="text-xs text-slate-600">{t("Texto-modelo. Revise com o conselho ou profissional da área antes de usar. Não garante conformidade legal ou regulatória.")}</p>
        </div> : <ProLock note="Bloco de aviso está disponível no Pro." source="notice" />}</div>
        <div className="space-y-2"><h3 className="font-semibold">{t("Despedida")}</h3>{field("signoff","Despedida","text","Atenciosamente,")}</div>
      </div>}
      {tab === "Empresa" && <div className="space-y-3">
        <p className="text-sm text-slate-700">{t("Opcional. Ajuda a entender se o Maily Business pode fazer sentido para sua equipe. Essa informação só é associada à sua conta após o cadastro.")}</p>
        <label className="grid gap-1.5 text-sm font-medium">{t("Quantas pessoas trabalham na sua empresa?")}
          <select className="rounded-lg border border-slate-300 p-2" value={companySize} onChange={e=>setCompanySize(e.target.value as any)}>
            <option value="">{t("Selecione")}</option><option value="solo">{t("Só eu")}</option><option value="2-10">2–10</option><option value="11-50">11–50</option><option value="51+">51+</option>
          </select></label>
      </div>}
      <div className="flex flex-wrap gap-2"><Button type="button" variant={tab===tabs[0]?"outline":"ghost"} onClick={()=>{const i=tabs.indexOf(tab); if(i>0) setTab(tabs[i-1]);}} disabled={tab===tabs[0]}>{t("Voltar")}</Button><Button type="button" variant="outline" onClick={()=>{const i=tabs.indexOf(tab); if(i<tabs.length-1) setTab(tabs[i+1]);}} disabled={tab===tabs[tabs.length-1]}>{t("Avançar")}</Button></div>
      <TemplateSelector value={data.template} pro={pro} owned={owned} onChange={template=>{ setViewTemplate(null); form.setValue("template", template,{shouldDirty:true}); }} onLocked={template=>{ setViewTemplate(template); posthog.capture("resource_pro_locked_seen", { source: "template_preview", tab, template, profession_id: professionId || undefined, ...utm }); }} />
      {previewingLocked && <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950"><span><strong>{templates.find(x=>x.id===viewTemplate)?.label}</strong> é um modelo Pro. Você pode visualizar, mas não salvar/exportar neste plano.</span><span className="flex gap-2"><Button type="button" variant="outline" onClick={()=>setViewTemplate(null)}>{t("Voltar ao meu modelo")}</Button><Button asChild type="button"><LinkWithOnClick href="/precos" onClick={()=>posthog.capture("upgrade_started",{source:"template_preview",template:viewTemplate,...utm})}>{t("Conheça o Pro")}</LinkWithOnClick></Button></span></div>}
      {pack && !pro && <p className="text-xs text-slate-600">{t("Modelos recomendados do pacote disponíveis no Pro:")} {pack.recommendedModels.join(", ")}</p>}
      {professionId && <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-600">{t("Pontos de atenção")}</h3>
        <p className="text-xs text-slate-500">{textoGuia}</p>
        <ul className="text-xs space-y-1">
          {avaliarRegras(professionId, form.getValues()).map(({ id, label, resultado }) => (
            <li key={id} className={`flex items-center gap-1.5 ${resultado.ok ? "text-green-700" : "text-amber-700"}`}>
              <span className={resultado.ok ? "text-green-500" : "text-amber-500"}>{resultado.ok ? "✓" : "!"}</span>
              <span>{label}</span>
              {resultado.ok ? "" : <span className="ml-1 text-[10px] opacity-70">{resultado.motivo}</span>}
            </li>
          ))}
        </ul>
      </div>}
    </section>

    <section className="panel space-y-4 lg:sticky lg:top-5" aria-label={t("Prévia e ações")}>
      <div><span className="eyebrow">{t("Prévia ao vivo")}</span><h2 className="mt-2 text-2xl font-bold">{t("Veja como ficou")}</h2></div>
      <div className="overflow-hidden rounded-2xl border border-slate-200">
        <div className="border-b border-slate-100 bg-slate-50 px-4 py-3 text-sm"><div className="flex gap-2"><span className="w-16 text-slate-500">{t("Para")}</span><input className="min-w-0 flex-1 bg-transparent" value={to} onChange={e=>setTo(e.target.value)} /></div><div className="mt-1 flex gap-2"><span className="w-16 text-slate-500">{t("Assunto")}</span><input className="min-w-0 flex-1 bg-transparent" value={subject} onChange={e=>setSubject(e.target.value)} /></div></div>
        <div className="bg-white p-4 text-sm text-slate-500"><p>{t("Olá! Tudo bem?")}</p><p className="mt-2">{t("Segue minha assinatura abaixo.")}</p><div className="mt-5 overflow-x-auto border-t border-slate-100 pt-4"><SignaturePreview data={data} premium={premium} capture={capture} publicPreview={publicPreview} /></div></div>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button type="button" disabled={!!busy || previewingLocked} onClick={() => { if (previewingLocked) { toast.info(t("Escolha um modelo disponível para usar, ou conheça o Pro.")); return; } if (!signedIn) { goSignup(); return; } const vals = form.getValues(); if (vals.cnpj && !validCNPJ(vals.cnpj)) { toast.error(t("CNPJ inválido.")); return; } void run("save", async()=>saveToAccount(vals)); }}><Save size={16}/>{t("Usar minha assinatura")}</Button>
        {signedIn && <Button type="button" variant="outline" disabled={!!busy || lockedTemplate} onClick={() => void run("copy", async()=>{ const v=form.getValues(); if(lockedTemplate) throw new Error(t("Escolha um template disponível.")); const html=(await jsonRequest<{html:string}>("/api/signatures/export",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({data:v,format:"html"})})).html; if(typeof ClipboardItem!=="undefined" && navigator.clipboard?.write){try{await navigator.clipboard.write([new ClipboardItem({"text/html":new Blob([html],{type:"text/html"})})]);}catch{await navigator.clipboard.writeText(html);}} else await navigator.clipboard.writeText(html); posthog.capture("signature_copied",{template:v.template,premium,profession_id:professionId||undefined,...utm}); toast.success(t("HTML copiado.")); })}><Clipboard size={16}/>{t("Copiar HTML")}</Button>}
        {signedIn && pro && <Button type="button" variant="ghost" disabled={!!busy} onClick={() => void run("text", async()=>{ const {text}=await jsonRequest<{text:string}>("/api/signatures/text",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(form.getValues())}); await navigator.clipboard.writeText(text); toast.success(t("Texto copiado.")); })}><FileText size={16}/>{t("Texto puro")}</Button>}
      </div>
      {!signedIn && <p className="text-sm text-slate-700">{t("Você pode montar e ver a assinatura inteira antes de criar conta. O cadastro acontece só para copiar, salvar ou exportar.")}</p>}
    </section>
  </div>;
}
