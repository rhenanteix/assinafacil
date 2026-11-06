"use client";
import { useEffect, useRef } from "react";
import { useTranslation } from "@/lib/i18n/client";

import { clearDraft } from "@/hooks/use-signature-draft";
import posthog from "posthog-js";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { jsonRequest, useSignatureActions } from "@/hooks/use-signature-actions";

type PostHogIdentityProps = {
  userId: string;
  email?: string | null;
  name?: string | null;
};

export function PostHogIdentity({ userId, email, name }: PostHogIdentityProps) {
  const identifiedUserId = useRef<string | null>(null);

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN || !process.env.NEXT_PUBLIC_POSTHOG_HOST) return;

    if (identifiedUserId.current && identifiedUserId.current !== userId) {
      posthog.reset();
    }

    posthog.identify(userId, {
      ...(email ? { email } : {}),
      ...(name ? { name } : {}),
    });
    identifiedUserId.current = userId;
  }, [email, name, userId]);

  return null;
}

export function SignOutButton() {
  const t = useTranslation();
  return <Button variant="ghost" onClick={() => { clearDraft(); posthog.reset(); void signOut({ callbackUrl: "/" }); }}>{t("Sair")}</Button>;
}
export function DeleteSignature({ id, name }: { id: string; name: string }) {
  const t = useTranslation();
  const router = useRouter();
  const { busy, run } = useSignatureActions();
  return <Button variant="ghost" aria-label={t("Excluir {name}", { name })} disabled={!!busy} onClick={() => {
    if (!window.confirm(t("Excluir a assinatura “{name}”?", { name }))) return;
    void run("delete", async () => {
      await jsonRequest(`/api/signatures/${id}`, { method: "DELETE" });
      router.replace("/dashboard");
      router.refresh();
      toast.success(t("Assinatura excluída."));
    });
  }}>{busy ? t("Excluindo…") : t("Excluir")}</Button>;
}
