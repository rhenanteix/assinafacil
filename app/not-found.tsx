import Link from "next/link";
import { getTranslator } from "@/lib/i18n/server";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import { motion } from "framer-motion";
import { ArrowLeft, Home, Search } from "lucide-react";

const float = {
  initial: { y: 0 },
  animate: {
    y: [-12, 8, -6, 10, 0],
    transition: {
      duration: 5,
      repeat: Infinity,
      ease: "easeInOut" as const,
    },
  },
};

const bounce = {
  initial: { scale: 0.8, opacity: 0 },
  animate: {
    scale: 1,
    opacity: 1,
    transition: {
      duration: 0.6,
      ease: "easeOut" as const,
    },
  },
};

const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

export default async function NotFound() {
  const t = await getTranslator();
  return (
    <main className="shell flex min-h-[calc(100vh-4.5rem)] flex-col items-center justify-center py-16 text-center">
      <div className="mx-auto max-w-2xl">
        <motion.div
          variants={float}
          initial="initial"
          animate="animate"
          className="relative mx-auto mb-8 w-48 sm:w-64"
        >
          <div className="absolute -inset-4 rounded-full bg-gradient-to-br from-violet-200 via-fuchsia-100 to-indigo-200 opacity-60 blur-2xl" />
          <img
            src="/mascote/logo.png"
            alt="Maily"
            className="relative z-10 w-full drop-shadow-lg"
            width={256}
            height={256}
          />
          <motion.div
            className="absolute -right-2 top-2 z-20"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.8, duration: 0.5, type: "spring", stiffness: 200 }}
          >
            <span className="text-4xl">✉️</span>
          </motion.div>
          <motion.div
            className="absolute -left-3 bottom-4 z-20"
            initial={{ scale: 0, rotate: 180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 1, duration: 0.5, type: "spring", stiffness: 200 }}
          >
            <span className="text-3xl">💌</span>
          </motion.div>
        </motion.div>

        <motion.div
          variants={stagger}
          initial="initial"
          animate="animate"
          className="space-y-6"
        >
          <motion.div variants={bounce}>
            <span className="inline-block rounded-full bg-violet-100 px-4 py-1.5 text-sm font-semibold text-violet-700">
              404
            </span>
          </motion.div>

          <motion.h1
            variants={bounce}
            className="text-4xl font-bold tracking-tight text-ink sm:text-5xl"
          >
            {t("Ops! Página não encontrada.")}
          </motion.h1>

          <motion.p
            variants={bounce}
            className="mx-auto max-w-md text-lg text-slate-600"
          >
            {t("Parece que o endereço que você tentou acessar não existe ou foi movido. O gatinho não conseguiu encontrar essa página.")}
          </motion.p>

          <motion.div
            variants={bounce}
            className="flex flex-wrap items-center justify-center gap-3 pt-4"
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
          </motion.div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.8 }}
          className="mt-12 text-sm text-slate-400"
        >
          {t("Se o problema persistir, entre em contato conosco.")}
        </motion.p>
      </div>
    </main>
  );
}