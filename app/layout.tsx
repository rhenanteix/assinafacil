import { getTranslator, getLocale } from "@/lib/i18n/server";
import { LocaleProvider } from "@/lib/i18n/client";
import { Footer } from "@/components/layout/Footer";

import { publicSiteUrl } from "@/lib/utils/site-url";
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { MailyToaster } from "@/components/shared/MailyToaster";
import { Header } from "@/components/layout/Header";
import { PostHogIdentity } from "@/components/shared/DashboardActions";
import { PostHogProvider } from "@/components/shared/PostHogProvider";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import "@/styles/globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslator();
  const locale = await getLocale();
  const url = publicSiteUrl();
  return {
    metadataBase: url,
    icons: {
      icon: { url: "/mascote/boas-vindas.png", type: "image/png" },
      apple: { url: "/mascote/boas-vindas.png", type: "image/png" },
    },
    title: { default: t("Maily | Assinaturas profissionais de e-mail"), template: "%s | Maily" },
    description: t("Crie uma assinatura profissional de e-mail em minutos. Personalize templates e exporte em HTML ou PNG."),
    keywords: ["assinatura de e-mail", "gerador de assinatura", "assinatura profissional", "assinatura Gmail", "assinatura Outlook", "assinatura HTML", "assinatura PNG"],
    authors: [{ name: "Maily" }],
    robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 } },
    alternates: { canonical: url?.href },
    openGraph: { title: "Maily", description: t("Crie sua assinatura profissional de e-mail com prévia ao vivo."), url: url?.href, siteName: "Maily", locale: locale === "en" ? "en_US" : "pt_BR", type: "website", images: [{ url: "/mascote/logo.png", width: 2172, height: 724, alt: "Maily" }] },
    twitter: { card: "summary_large_image", title: "Maily", description: t("Crie sua assinatura profissional de e-mail com prévia ao vivo."), images: ["/mascote/logo.png"] },
  };
}
export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const t = await getTranslator();
  const locale = await getLocale();
  const session = await getServerSession(authOptions);
  return <html lang={locale} suppressHydrationWarning><body className={`${GeistSans.className} flex min-h-dvh flex-col`} suppressHydrationWarning>
    <PostHogProvider>
      <LocaleProvider locale={locale}>
        {session?.user?.id && <PostHogIdentity userId={session.user.id} email={session.user.email} name={session.user.name} />}
        <a href="#conteudo" className="sr-only focus:not-sr-only">{t("Ir para o conteúdo")}</a>
        <Header />
        <main id="conteudo" className="flex flex-1 flex-col">{children}</main>
        <Footer />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
      "@context": "https://schema.org",
      "@graph": [
        { "@type": "Organization", name: "Maily", url: publicSiteUrl()?.href, logo: publicSiteUrl() ? new URL("/mascote/logo.png", publicSiteUrl()!).href : undefined },
        { "@type": "WebSite", name: "Maily", url: publicSiteUrl()?.href, inLanguage: "pt-BR" },
        { "@type": "SoftwareApplication", name: "Maily", applicationCategory: "BusinessApplication", operatingSystem: "Web", offers: { "@type": "Offer", price: "0", priceCurrency: "BRL" }, description: "Gerador de assinatura de e-mail profissional." },
      ],
    }) }} />
    <MailyToaster />
      </LocaleProvider>
    </PostHogProvider>
  </body></html>;
}
