"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { Plan } from "@/lib/payments/plans";
export function CheckoutButton({ plan, signedIn, label }: { plan: Plan; signedIn: boolean; label: string }) {
  return <Button asChild><Link href={signedIn ? `/checkout?plan=${plan}` : "/login?destino=precos"}>
    {label}
  </Link></Button>;
}
