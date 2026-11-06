"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { jsonRequest, useSignatureActions } from "@/hooks/use-signature-actions";

export function VerifyEmail({ token, signedIn, destination }: { token?: string; signedIn: boolean; destination: string }) {
  const router = useRouter();
  const { busy, run } = useSignatureActions();
  return <div className="flex flex-wrap gap-2">
    {token && <Button disabled={!!busy} onClick={() => void run("verify", async () => {
      await jsonRequest("/api/auth/verify-email", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token }) });
      toast.success("E-mail confirmado.");
      router.replace(signedIn ? "/" + destination : "/login?destino=" + destination);
      router.refresh();
    })}>Confirmar meu e-mail</Button>}
    {signedIn ? <Button variant="outline" disabled={!!busy} onClick={() => void run("resend", async () => {
      await jsonRequest("/api/auth/resend-verification", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ destination }) });
      toast.success("Confira sua caixa de entrada.");
    })}>Enviar novo link</Button> : <Button asChild variant="outline"><Link href={`/login?destino=${destination}`}>Entrar</Link></Button>}
  </div>;
}
