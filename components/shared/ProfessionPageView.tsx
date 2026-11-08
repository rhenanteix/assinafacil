"use client";
import { useEffect } from "react";
import posthog from "posthog-js";
import { initPostHog } from "@/lib/posthog-client";
import { captureUtm } from "@/lib/utm";
export function ProfessionPageView({ slug }: { slug: string }) {
  useEffect(() => { initPostHog(); posthog.capture("profession_page_viewed", { profession_slug: slug, ...captureUtm() }); }, [slug]);
  return null;
}
