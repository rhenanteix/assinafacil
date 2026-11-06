"use client";

import { PostHogProvider as PHProvider } from "posthog-js/react";
import { useEffect } from "react";
import { initPostHog, posthog } from "@/lib/posthog-client";

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    initPostHog();
  }, []);

  return <PHProvider client={posthog}>{children}</PHProvider>;
}