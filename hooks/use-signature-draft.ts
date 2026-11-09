"use client";
import { useEffect, useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import { signatureSchema, toEssential, canUseTemplate, type SignatureData } from "@/types/signature";

const key = "assinafacil:draft:v2";
const pendingKey = "assinafacil:pending-auth:v1";
const metaKey = "assinafacil:draft-meta:v1";

export type DraftMeta = { professionId?: string; companySize?: "solo" | "2-10" | "11-50" | "51+"; utm?: Record<string, string> };

export function storeDraftMeta(meta: DraftMeta) {
  try { sessionStorage.setItem(metaKey, JSON.stringify(meta)); localStorage.setItem(metaKey, JSON.stringify({ meta, expiresAt: Date.now() + 60 * 60 * 1000 })); } catch {}
}
export function readDraftMeta(): DraftMeta | null {
  try {
    const s = sessionStorage.getItem(metaKey); if (s) return JSON.parse(s);
    const raw = localStorage.getItem(metaKey); if (!raw) return null;
    const pending = JSON.parse(raw);
    if (!pending?.expiresAt || pending.expiresAt <= Date.now()) { localStorage.removeItem(metaKey); return null; }
    return pending.meta ?? null;
  } catch { return null; }
}

export function storeDraft(data: SignatureData) {
  try { sessionStorage.setItem(key, JSON.stringify(data)); return true; }
  catch { return false; }
}
export function storeAuthDraft(data: SignatureData) {
  const saved = storeDraft(data);
  try {
    localStorage.setItem(pendingKey, JSON.stringify({ data, expiresAt: Date.now() + 60 * 60 * 1000 }));
    return true;
  } catch { return saved; }
}
export function readDraft() {
  const session = sessionStorage.getItem(key);
  if (session) return JSON.parse(session);
  const raw = localStorage.getItem(pendingKey);
  if (!raw) return null;
  const pending = JSON.parse(raw);
  if (!pending || typeof pending.expiresAt !== "number" || pending.expiresAt <= Date.now()) {
    localStorage.removeItem(pendingKey);
    return null;
  }
  return pending.data;
}
export function clearDraft() {
  try { sessionStorage.removeItem(key); } catch { /* Storage may be unavailable in privacy mode. */ }
  try { localStorage.removeItem(pendingKey); } catch { /* The cross-tab fallback is optional. */ }
  try { sessionStorage.removeItem(metaKey); localStorage.removeItem(metaKey); } catch {}
}
export function useSignatureDraft(form: UseFormReturn<SignatureData>, enabled: boolean, access: { pro: boolean; owned: string[] }) {
  const [restored, setRestored] = useState(false);
  useEffect(() => {
    if (!enabled || restored) return;
    try {
      const raw = readDraft();
      if (raw) {
        const parsed = signatureSchema.safeParse(raw);
        if (parsed.success) form.reset(canUseTemplate(parsed.data.template, access.pro, access.owned) ? parsed.data : toEssential(parsed.data));
      }
    } catch { /* Invalid or unavailable session storage does not block editing. */ }
    setRestored(true);
  }, [form, enabled, restored, access.pro, access.owned]);
  useEffect(() => {
    if (!enabled || !restored) return;
    const subscription = form.watch(value => { storeDraft(value as SignatureData); });
    return () => subscription.unsubscribe();
  }, [form, enabled, restored]);
}
