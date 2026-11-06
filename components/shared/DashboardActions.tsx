"use client";
import { clearDraft } from "@/hooks/use-signature-draft";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { jsonRequest, useSignatureActions } from "@/hooks/use-signature-actions";

export function SignOutButton() {
  return <Button variant="ghost" onClick={() => { clearDraft(); void signOut({ callbackUrl: "/" }); }}>Sair</Button>;
}
export function DeleteSignature({ id, name }: { id: string; name: string }) {
  const router = useRouter();
  const { busy, run } = useSignatureActions();
  return <Button variant="ghost" aria-label={`Excluir ${name}`} disabled={!!busy} onClick={() => {
    if (!window.confirm(`Excluir a assinatura “${name}”?`)) return;
    void run("delete", async () => {
      await jsonRequest(`/api/signatures/${id}`, { method: "DELETE" });
      router.replace("/dashboard");
      router.refresh();
      toast.success("Assinatura excluída.");
    });
  }}>{busy ? "Excluindo…" : "Excluir"}</Button>;
}
