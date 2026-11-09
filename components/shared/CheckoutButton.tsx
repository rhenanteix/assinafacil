"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { track } from "@/lib/posthog-client";
import { plans } from "@/lib/payments/plans";
import type { Plan } from "@/lib/payments/plans";

export function CheckoutButton({ plan, signedIn, label }: { plan: Plan; signedIn: boolean; label: string }) {
  const href = signedIn ? `/checkout?plan=${plan}` : "/login?destino=precos";
  return <Button asChild><Link href={href} onClick={() => {
    track("checkout_button_clicked", { plan, plan_label: plans[plan].label, amount_cents: plans[plan].cents, signed_in: signedIn, destination: href });
  }}>{label}</Link></Button>;
}
