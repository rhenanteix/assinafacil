"use client";
import { useTranslation } from "@/lib/i18n/client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { Plan } from "@/lib/payments/plans";
export function CheckoutButton({ plan, signedIn, label }: { plan: Plan; signedIn: boolean; label: string }) {
  const t = useTranslation();
  return <Button asChild><Link href={signedIn ? `/checkout?plan=${plan}` : "/login?destino=precos"}>
    {signedIn ? label : t("Entrar para contratar")}
  </Link></Button>;
}
