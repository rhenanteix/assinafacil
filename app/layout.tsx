import { getTranslator, getLocale } from "@/lib/i18n/server";
import { LocaleProvider } from "@/lib/i18n/client";
import Image from "next/image";
import Link from "next/link";
import { publicSiteUrl } from "@/lib/utils/site-url";
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { Toaster } from "sonner";
import { Header } from "@/components/layout/Header";
import "@/styles/globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslator();
  return {
  metadataBase: publicSiteUrl(),
  icons: {
    icon: { url: "/mascote/boas-vindas.png", type: "image/png" },
    apple: { url: "/mascote/boas-vindas.png", type: "image/png" },
  },
  title: { default: t("Maily | Assinaturas profissionais de e-mail"), template: "%s | Maily" },
  description: t("Crie uma assinatura profissional de e-mail em minutos. Personalize templates e exporte em HTML ou PNG."),
  openGraph: { title: "Maily", description: t("Crie sua assinatura profissional de e-mail com prévia ao vivo."), locale: (await getLocale()) === "en" ? "en_US" : "pt_BR", type: "website" },
};
}
export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const t = await getTranslator();
  const locale = await getLocale();
  return <html lang={locale}><body className={GeistSans.className}><LocaleProvider locale={locale}>
    <a href="#conteudo" className="sr-only focus:not-sr-only">{t("Ir para o conteúdo")}</a>
    <Header />
    <main id="conteudo">{children}</main>
    <footer className="shell mt-16 flex flex-col items-start justify-between gap-5 border-t border-indigo-100 py-8 text-sm text-slate-600 sm:flex-row sm:items-center">
      <Link href="/" aria-label={t("Página inicial — Maily")}><Image src="/mascote/logo.png" alt="Maily" width={2172} height={724} sizes="144px" className="h-auto w-36" /></Link>
      <p>{t("Assinaturas profissionais de e-mail")}</p>
    </footer>
    <Toaster richColors position="bottom-right" />
  </LocaleProvider></body></html>;
}
