"use client";
import { useTranslation } from "@/lib/i18n/client";
import { useRef, useState } from "react";
import { toast } from "sonner";

export async function jsonRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, init);
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(data?.error ?? "Não foi possível concluir. Tente novamente.");
  return data as T;
}
export function useSignatureActions() {
  const t = useTranslation();
  const locked = useRef(false);
  const [busy, setBusy] = useState<string | null>(null);
  async function run(action: string, operation: () => Promise<void>) {
    if (locked.current) return;
    locked.current = true;
    setBusy(action);
    try { await operation(); }
    catch (error) { toast.error(t(error instanceof Error ? error.message : "Algo deu errado.")); }
    finally { locked.current = false; setBusy(null); }
  }
  return { busy, run };
}
