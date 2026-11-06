"use client";
import { useEffect } from "react";
import posthog from "posthog-js";
import { useTranslation } from "@/lib/i18n/client";

import { Button } from "@/components/ui/button";
export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslation();

  useEffect(() => {
    posthog.captureException(error);
  }, [error]);
  return <div className="shell py-16"><h1 className="text-3xl font-bold">{t("Algo deu errado")}</h1>
    <p className="my-4 text-slate-600">{t("Tente carregar a página novamente.")}</p><Button onClick={reset}>{t("Tentar novamente")}</Button></div>;
}
