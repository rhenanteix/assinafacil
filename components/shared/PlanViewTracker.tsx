"use client";

import { useEffect, useRef } from "react";
import { track } from "@/lib/posthog-client";

type PlanViewTrackerProps = {
  plan: string;
  planLabel: string;
  amountCents: number;
  isExclusive?: boolean;
  children: React.ReactNode;
};

/**
 * Envolve o card de um plano e dispara `plan_viewed` quando o card fica visível pela primeira vez.
 */
export function PlanViewTracker({ plan, planLabel, amountCents, isExclusive, children }: PlanViewTrackerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reported = useRef(false);

  useEffect(() => {
    if (reported.current) return;
    const target = ref.current;
    if (!target) return;
    let observer: IntersectionObserver | null = null;
    try {
      observer = new IntersectionObserver(
        (entries) => {
          if (reported.current) return;
          const [entry] = entries;
          if (entry?.isIntersecting) {
            reported.current = true;
            track("plan_viewed", { plan, plan_label: planLabel, amount_cents: amountCents, is_exclusive: isExclusive });
            if (observer) observer.disconnect();
          }
        },
        { threshold: 0.15, rootMargin: "0px 0px -5% 0px" },
      );
      observer.observe(target);
    } catch {
      // Sem IntersectionObserver: não rastreia impressão do plano.
    }
    return () => {
      if (observer) observer.disconnect();
    };
  }, [plan, planLabel, amountCents, isExclusive]);

  return <div ref={ref}>{children}</div>;
}
