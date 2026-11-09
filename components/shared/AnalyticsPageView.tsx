"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { trackPageView, track } from "@/lib/posthog-client";
import { EVENT_DESCRIPTIONS } from "@/lib/analytics/events";

/**
 * Acompanha page views em toda navegação do App Router.
 *
 * Dispara um evento `page_viewed`:
 * - assim que o componente monta (primeira página da visita);
 * - sempre que o pathname ou a query string mudam (navegação por Link/router).
 *
 * Deve ser renderizado uma única vez no layout raiz, abaixo do PostHogProvider,
 * para que o posthog já esteja inicializado.
 */
export function AnalyticsPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // Primeira montagem: registra o page view da página de entrada.
    if (!initialized) {
      setInitialized(true);
      trackPageView({
        path: pathname,
        title: document.title,
        query: searchParams.toString() || undefined,
      });
      return;
    }

    // Navegação subsequente: registra o novo page view.
    trackPageView({
      path: pathname,
      title: document.title,
      query: searchParams.toString() || undefined,
    });
  }, [pathname, searchParams, initialized]);

  return null;
}
