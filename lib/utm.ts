"use client";
export function captureUtm() {
  if (typeof window === "undefined") return {};
  const p = new URLSearchParams(window.location.search);
  const keys = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"];
  const utm: Record<string, string> = {};
  for (const k of keys) { const v = p.get(k); if (v) utm[k] = v.slice(0, 120); }
  return utm;
}
