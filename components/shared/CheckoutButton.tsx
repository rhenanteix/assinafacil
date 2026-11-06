"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { jsonRequest, useSignatureActions } from "@/hooks/use-signature-actions";
import type { Plan } from "@/lib/mercado-pago/plans";
export function CheckoutButton({ plan, signedIn, label }: { plan: Plan; signedIn: boolean; label: string }) {
  const { busy, run } = useSignatureActions();
  if (!signedIn) return <Button asChild><Link href="/login?destino=precos">Entrar para contratar</Link></Button>;
  return <Button disabled={!!busy} onClick={() => void run("checkout", async () => {
    const { url } = await jsonRequest<{ url: string }>("/api/payments/checkout", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ plan }),
    });
    window.location.assign(url);
  })}>{busy ? "Abrindo checkout…" : label}</Button>;
}
