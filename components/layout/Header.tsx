import { getTranslator } from "@/lib/i18n/server";
import { LanguageSwitcher } from "./LanguageSwitcher";
import Link from "next/link";
import Image from "next/image";
import { TrackedLink } from "@/components/shared/TrackedLink";
import { track } from "@/lib/posthog-client";

type NavItem = { href: string; labelKey: string; eventProperties?: Record<string, string> };

const NAV_ITEMS: NavItem[] = [
  { href: "/#sobre", labelKey: "Sobre" },
  { href: "/#modelos", labelKey: "Modelos" },
  { href: "/precos", labelKey: "Planos" },
  { href: "/#empresas", labelKey: "Empresas" },
];

export async function Header() {
  const t = await getTranslator();
  return <header className="border-b border-violet-100 bg-white"><nav aria-label={t("Navegação principal")} className="shell flex min-h-[4.5rem] flex-wrap items-center justify-between gap-x-6 gap-y-3 py-3">
    <Link href="/" aria-label={t("Página inicial — Maily")} className="shrink-0 rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-600" onClick={() => {
      track("cta_clicked", { cta_label: t("Logotipo"), cta_location: "header", destination: "/" });
    }}><Image src="/mascote/logo.png" alt="Maily" width={2172} height={724} sizes="180px" priority className="h-auto w-[156px] sm:w-[180px]" /></Link>
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm font-semibold sm:gap-6">
      {NAV_ITEMS.map(({ href, labelKey, eventProperties }) => {
        const label = t(labelKey);
        return <TrackedLink key={href} event="nav_link_clicked" properties={{ link: href, link_label: label, ...eventProperties }} linkProps={{ href, className: "hover:text-brand" }}>{label}</TrackedLink>;
      })}
      <TrackedLink event="cta_clicked" properties={{ cta_label: t("Minha conta"), cta_location: "header", destination: "/dashboard" }} linkProps={{ href: "/dashboard", className: "rounded-lg border border-violet-200 px-3 py-2 text-brand hover:bg-violet-50" }}>{t("Minha conta")}</TrackedLink>
      <LanguageSwitcher />
    </div>
  </nav></header>;
}
