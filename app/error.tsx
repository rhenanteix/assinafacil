"use client";
import { useTranslation } from "@/lib/i18n/client";

import { Button } from "@/components/ui/button";
export default function ErrorPage({ reset }: { reset: () => void }) {
  const t = useTranslation();
  return <div className="shell py-16"><h1 className="text-3xl font-bold">{t("Algo deu errado")}</h1>
    <p className="my-4 text-slate-600">{t("Tente carregar a página novamente.")}</p><Button onClick={reset}>{t("Tentar novamente")}</Button></div>;
}
