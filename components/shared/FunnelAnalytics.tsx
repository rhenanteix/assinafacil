"use client";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { initPostHog, posthog } from "@/lib/posthog-client";
export function FunnelAnalytics() {
  const pathname = usePathname();
  const previous = useRef<string | null>(null);
  useEffect(() => {
    if (previous.current === pathname) return;
    previous.current = pathname;
    initPostHog();
    const event = pathname === "/precos" ? "pricing_visited" : pathname === "/checkout" ? "checkout_visited" : pathname === "/" ? "landing_visited" : null;
    if (event) posthog.capture(event, { path: pathname });
  }, [pathname]);
  return null;
}
