"use client";

import Link from "next/link";
import { track } from "@/lib/posthog-client";
import type { AnalyticsProperties } from "@/lib/analytics/events";

type TrackedLinkProps = {
  /** Nome do evento a disparar no clique. */
  event: string;
  /** Propriedades do evento. */
  properties?: AnalyticsProperties;
  /** Conteúdo do link. */
  children: React.ReactNode;
  /** Props repassadas ao <Link> (inclui href obrigatório). */
  linkProps: React.ComponentProps<typeof Link>;
};

/**
 * Link que dispara um evento de analytics no clique antes de navegar.
 * Útil para navegação do header, CTAs e cards.
 */
export function TrackedLink({ event, properties, children, linkProps }: TrackedLinkProps) {
  function handleClick() {
    track(event, properties);
  }
  return <Link {...linkProps} onClick={handleClick}>{children}</Link>;
}
