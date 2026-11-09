"use client";

import { useEffect } from "react";
import { track } from "@/lib/posthog-client";

type SectionViewTrackerProps = {
  /** Id/âncora da seção. */
  section: string;
  /** Rótulo legível da seção. */
  label: string;
  /** Limite de visibilidade (0 a 1). Padrão 0.3 (30% visível). */
  threshold?: number;
};

/**
 * Dispara `section_viewed` quando a seção entra na viewport pela primeira vez.
 * Usar uma instância por seção a ser acompanhada.
 */
export function SectionViewTracker({ section, label, threshold = 0.3 }: SectionViewTrackerProps) {
  useEffect(() => {
    let observer: IntersectionObserver | null = null;
    let reported = false;
    try {
      observer = new IntersectionObserver(
        (entries) => {
          if (reported) return;
          const [entry] = entries;
          if (entry?.isIntersecting) {
            reported = true;
            track("section_viewed", { section, section_label: label });
            if (observer) observer.disconnect();
          }
        },
        { threshold, rootMargin: "0px 0px -10% 0px" },
      );
      const target = document.getElementById(section);
      if (target) observer.observe(target);
    } catch {
      // IntersectionObserver não disponível: sem rastreamento de seção.
    }
    return () => {
      if (observer) observer.disconnect();
    };
  }, [section, label, threshold]);

  return null;
}
