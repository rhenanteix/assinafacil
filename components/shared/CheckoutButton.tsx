"use client";
import { Button } from "@/components/ui/button";
import { track } from "@/lib/posthog-client";
import { plans } from "@/lib/payments/plans";
import type { Plan } from "@/lib/payments/plans";
import { LinkWithOnClick } from "@/components/shared/LinkWithOnClick";

export function CheckoutButton({ plan, signedIn, label }: { plan: Plan; signedIn: boolean; label: string }) {
  const href = signedIn ? `/checkout?plan=${plan}` : "/login?destino=precos";
  return <Button asChild><LinkWithOnClick href={href} onClick={() => {
    track("checkout_button_clicked", { plan, plan_label: plans[plan].label, amount_cents: plans[plan].cents, signed_in: signedIn, destination: href });
  }}>{label}</LinkWithOnClick></Button>;
}
