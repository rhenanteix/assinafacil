"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "@/lib/i18n/client";
import { localeCookie, resolveLocale } from "@/lib/i18n/shared";

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return <label className="flex items-center gap-2 text-xs">
    <span className="sr-only">{locale === "en" ? "Language" : "Idioma"}</span>
    <select value={locale} disabled={pending} aria-busy={pending} className="min-h-11 rounded-lg border border-violet-200 bg-white px-2 text-sm text-brand" onChange={event => {
      const next = resolveLocale(event.target.value);
      document.cookie = `${localeCookie}=${next}; Path=/; Max-Age=31536000; SameSite=Lax${location.protocol === "https:" ? "; Secure" : ""}`;
      startTransition(() => router.refresh());
    }}>
      <option value="pt-BR" lang="pt-BR">PT-BR</option>
      <option value="en" lang="en">English</option>
    </select>
  </label>;
}
