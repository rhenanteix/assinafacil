"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "@/lib/i18n/client";
import { localeCookie, resolveLocale } from "@/lib/i18n/shared";
import { track } from "@/lib/posthog-client";

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return (
    <div className="flex items-center gap-2">
      <span className="sr-only">{locale === "en" ? "Language" : "Idioma"}</span>
      <div className="flex overflow-hidden rounded-lg border border-violet-200 bg-white shadow-sm">
        <button
          type="button"
          disabled={pending}
          aria-pressed={locale === "pt-BR"}
          aria-label="Português (Brasil)"
          onClick={() => {
            if (locale === "pt-BR") return;
            track("language_changed", { from: locale, to: "pt-BR" });
            document.cookie = `${localeCookie}=pt-BR; Path=/; Max-Age=31536000; SameSite=Lax${location.protocol === "https:" ? "; Secure" : ""}`;
            startTransition(() => router.refresh());
          }}
          className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-violet-400 focus:ring-inset disabled:opacity-50 disabled:cursor-not-allowed ${
            locale === "pt-BR"
              ? "bg-violet-600 text-white"
              : "bg-white text-brand hover:bg-violet-50"
          }`}
        >
          <span className="text-base leading-none">🇧🇷</span>
          <span>PT-BR</span>
        </button>
        <button
          type="button"
          disabled={pending}
          aria-pressed={locale === "en"}
          aria-label="English (US)"
          onClick={() => {
            if (locale === "en") return;
            track("language_changed", { from: locale, to: "en" });
            document.cookie = `${localeCookie}=en; Path=/; Max-Age=31536000; SameSite=Lax${location.protocol === "https:" ? "; Secure" : ""}`;
            startTransition(() => router.refresh());
          }}
          className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-violet-400 focus:ring-inset disabled:opacity-50 disabled:cursor-not-allowed ${
            locale === "en"
              ? "bg-violet-600 text-white"
              : "bg-white text-brand hover:bg-violet-50"
          }`}
        >
          <span className="text-base leading-none">🇺🇸</span>
          <span>English</span>
        </button>
      </div>
    </div>
  );
}
