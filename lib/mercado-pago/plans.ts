export const plans = {
  monthly: { label: "Mensal", cents: 1990, days: 30 },
  annual: { label: "Anual", cents: 14700, days: 365 },
  lifetime: { label: "Pro", cents: 4990, days: null },
  "signature-luxe": { label: "Signature Luxe", cents: 2490, days: null },
  "brand-desk": { label: "Brand Desk", cents: 2490, days: null },
} as const;
export const offers = ["lifetime", "signature-luxe", "brand-desk"] as const;
export type Plan = keyof typeof plans;
export function isPlan(value: unknown): value is Plan {
  return typeof value === "string" && Object.hasOwn(plans, value);
}
export function price(cents: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);
}
