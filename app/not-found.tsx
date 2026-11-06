import Link from "next/link";
import { getTranslator } from "@/lib/i18n/server";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home, Search } from "lucide-react";

export default async function NotFound() {
  const t = await getTranslator();
  return (
    <main className="shell flex min-h-[calc(100vh-4.5rem)] flex-col items-center justify-center py-16 text-center">
      <div className="mx-auto max-w-2xl">
        <div className="relative mx-auto mb-8 w-48 sm:w-64 animate-float">
          <div className="absolute -inset-4 rounded-full bg-gradient-to-br from-violet-200 via-fuchsia-100 to-indigo-200 opacity-60 blur-2xl" />
          <img
            src="/mascote/logo.png"
            alt="Maily"
            className="relative z-10 w-full drop-shadow-lg"
            width={256}
            height={256}
          />
          <span
            className="absolute -right-2 top-2 z-20 text-4xl animate-bounce-in"
            style={{ animationDelay: "0.8s" }}
          >
            ✉️
          </span>
          <span
            className="absolute -left-3 bottom-4 z-20 text-3xl animate-bounce-in"
            style={{ animationDelay: "1s" }}
          >
            💌
          </span>
        </div>

        <div className="space-y-6 animate-stagger">
          <span className="inline-block animate-fade-in rounded-full bg-violet-100 px-4 py-1.5 text-sm font-semibold text-violet-700" style={{ animationDelay: "0.2s" }}>
            404
          </span>

          <h1
            className="animate-fade-in text-4xl font-bold tracking-tight text-ink sm:text-5xl"
            style={{ animationDelay: "0.35s" }}
          >
            {t("Ops! Página não encontrada.")}
          </h1>

          <p
            className="animate-fade-in mx-auto max-w-md text-lg text-slate-600"
            style={{ animationDelay: "0.5s" }}
          >
            {t("Parece que o endereço que você tentou acessar não existe ou foi movido. O gatinho não conseguiu encontrar essa página.")}
          </p>

          <div
            className="animate-fade-in flex flex-wrap items-center justify-center gap-3 pt-4"
            style={{ animationDelay: "0.65s" }}
          >
            <Button asChild>
              <Link href="/">
                <Home className="h-4 w-4" />
                {t("Voltar para o início")}
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/#modelos">
                <Search className="h-4 w-4" />
                {t("Ver modelos")}
              </Link>
            </Button>
            <Button asChild variant="ghost">
              <Link href="/dashboard">
                <ArrowLeft className="h-4 w-4" />
                {t("Minha conta")}
              </Link>
            </Button>
          </div>
        </div>

        <p
          className="animate-fade-in mt-12 text-sm text-slate-400"
          style={{ animationDelay: "1.5s" }}
        >
          {t("Se o problema persistir, entre em contato conosco.")}
        </p>
      </div>
    </main>
  );
}