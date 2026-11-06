import Image from "next/image";
import Link from "next/link";
import { publicSiteUrl } from "@/lib/utils/site-url";
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { Toaster } from "sonner";
import { Header } from "@/components/layout/Header";
import "@/styles/globals.css";

export const metadata: Metadata = {
  metadataBase: publicSiteUrl(),
  icons: { icon: { url: "/icon.svg", type: "image/svg+xml" } },
  title: { default: "AssinaFácil | Assinaturas profissionais de e-mail", template: "%s | AssinaFácil" },
  description: "Crie uma assinatura profissional de e-mail em minutos. Personalize templates e exporte em HTML ou PNG.",
  openGraph: { title: "AssinaFácil", description: "Crie sua assinatura profissional de e-mail com prévia ao vivo.", locale: "pt_BR", type: "website" },
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR"><body className={GeistSans.className}>
    <a href="#conteudo" className="sr-only focus:not-sr-only">Ir para o conteúdo</a>
    <Header />
    <main id="conteudo">{children}</main>
    <footer className="shell mt-16 flex flex-col items-start justify-between gap-5 border-t border-indigo-100 py-8 text-sm text-slate-600 sm:flex-row sm:items-center">
      <Link href="/" aria-label="Página inicial — AssinaFácil"><Image src="/mascote/logo.png" alt="maily" width={2172} height={724} sizes="144px" className="h-auto w-36" /></Link>
      <p>Assinaturas profissionais de e-mail</p>
    </footer>
    <Toaster richColors position="bottom-right" />
  </body></html>;
}
