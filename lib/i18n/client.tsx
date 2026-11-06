"use client";

import { createContext, useContext, useMemo } from "react";
import { translator, type Locale } from "./shared";

const LocaleContext = createContext<Locale>("pt-BR");
export function LocaleProvider({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  return <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>;
}
export function useLocale() { return useContext(LocaleContext); }
export function useTranslation() {
  const locale = useLocale();
  return useMemo(() => translator(locale), [locale]);
}
