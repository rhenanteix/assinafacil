"use client";

import { useEffect, useRef } from "react";
import { track } from "@/lib/posthog-client";

type ModelCardViewTrackerProps = {
  modelId: string;
  modelLabel: string;
  tier: "free" | "pro" | "exclusive";
  children: React.ReactNode;
};

/**
 * Envolve o conteúdo de um card de modelo e dispara `model_card_viewed`
 * quando o card fica visível pela primeira vez.
 */
export function ModelCardViewTracker({ modelId, modelLabel, tier, children }: ModelCardViewTrackerProps) {
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
            track("model_card_viewed", { model_id: modelId, model_label: modelLabel, tier });
            if (observer) observer.disconnect();
          }
        },
        { threshold: 0.15, rootMargin: "0px 0px -5% 0px" },
      );
      observer.observe(target);
    } catch {
      // Sem IntersectionObserver: não rastreia impressão do card.
    }
    return () => {
      if (observer) observer.disconnect();
    };
  }, [modelId, modelLabel, tier]);

  return <div ref={ref}>{children}</div>;
}
