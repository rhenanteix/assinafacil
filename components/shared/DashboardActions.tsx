"use client";
import { useTranslation } from "@/lib/i18n/client";

import { clearDraft } from "@/hooks/use-signature-draft";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { jsonRequest, useSignatureActions } from "@/hooks/use-signature-actions";

export function SignOutButton() {
  const t = useTranslation();
  return <Button variant="ghost" onClick={() => { clearDraft(); void signOut({ callbackUrl: "/" }); }}>{t("Sair")}</Button>;
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
