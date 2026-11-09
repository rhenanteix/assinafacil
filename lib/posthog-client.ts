"use client";

import posthog from "posthog-js";
import type { AnalyticsEventName, AnalyticsProperties } from "@/lib/analytics/events";

let initialized = false;

export function initPostHog() {
  if (initialized || typeof window === "undefined" || window.location.pathname === "/redefinir-senha") return;

  const posthogKey =
    process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN ??
    process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST;

  if (!posthogKey) {
    if (process.env.NODE_ENV === "development") {
      console.error(
        "NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN variable required by PostHog is missing or un-configured, this causes events to be silently missed.",
      );
    }
    return;
  }

  posthog.init(posthogKey, {
    api_host: "/ingest",
    ui_host: posthogHost ?? "https://us.posthog.com",
    defaults: "2026-08-30",
    capture_pageview: "history_change",
    capture_pageleave: true,
    capture_exceptions: true,
    debug: process.env.NODE_ENV === "development",
  });
  initialized = true;
}

/**
 * Dispara um evento customizado no PostHog.
 * @param event Nome do evento (convenção categoria_acao, veja lib/analytics/events.ts).
 * @param properties Propriedades do evento (opcional).
 */
export function track(event: AnalyticsEventName | string, properties?: AnalyticsProperties) {
  if (typeof window === "undefined") return;
  try {
    posthog.capture(event, properties);
  } catch {
    // Analytics nunca deve quebrar a experiência do usuário.
  }
}

/**
 * Dispara um page view manual com propriedades ricas (caminho, título, tier do usuário).
 */
export function trackPageView(properties: {
  path?: string;
  title?: string;
  query?: string;
  internal_referer?: string;
  signed_in?: boolean;
  user_tier?: "free" | "pro" | "business";
}) {
  track("page_viewed", {
    path: properties.path ?? typeof window !== "undefined" ? window.location.pathname : undefined,
    title: properties.title ?? typeof document !== "undefined" ? document.title : undefined,
    query: properties.query,
    internal_referer: properties.internal_referer,
    signed_in: properties.signed_in,
    user_tier: properties.user_tier,
  });
}

/**
 * Identifica um usuário no PostHog com id e propriedades de perfil.
 */
export function identifyUser(
  userId: string,
  properties?: { email?: string | null; name?: string | null; [key: string]: string | number | boolean | null | undefined },
) {
  if (typeof window === "undefined") return;
  try {
    posthog.identify(userId, properties);
  } catch {
    // Analytics nunca deve quebrar a experiência do usuário.
  }
}

/**
 * Reseta a identidade do usuário (ex: logout).
 */
export function resetUser() {
  if (typeof window === "undefined") return;
  try {
    posthog.reset();
  } catch {
    // Ignorar.
  }
}

export { posthog };
