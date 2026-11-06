import en from "./en.json";

export const locales = ["pt-BR", "en"] as const;
export type Locale = typeof locales[number];
export const localeCookie = "assinafacil-locale";
export function resolveLocale(value?: string): Locale {
  return value === "en" ? "en" : "pt-BR";
}
export function translator(locale: Locale) {
  return (message: string, values: Record<string, string | number> = {}): string => {
    let translated = locale === "en" ? (en as Record<string, string>)[message] ?? message : message;
    if (locale === "en" && /^Informe um link válido de .+\.$/.test(message)) {
      translated = message.replace(/^Informe um link válido de (.+)\.$/, "Enter a valid $1 link.");
    }
    return translated.replace(/\{(\w+)\}/g, (match, key: string) => String(values[key] ?? match));
  };
}
