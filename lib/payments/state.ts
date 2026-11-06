import type { Charge } from "@/lib/abacatepay/client";

export function paymentStatus(status: string) {
  const map: Record<string, string> = { PAID: "approved", APPROVED: "approved", PENDING: "pending", REFUNDED: "refunded", UNDER_DISPUTE: "in_mediation", LOST: "charged_back", FAILED: "failed", CANCELLED: "cancelled", EXPIRED: "expired" };
  return map[status];
}
export function nextPaymentStatus(current: string, incoming: string, previousAt: Date | null, incomingAt: Date) {
  if (previousAt && incomingAt < previousAt) return current;
  if (["refunded", "charged_back"].includes(current)) return current;
  if (incoming === "pending" && !["creating", "uncertain", "pending"].includes(current)) return current;
  if (current === "in_mediation" && incoming === "approved" && previousAt && incomingAt <= previousAt) return current;
  return incoming;
}
function httpsUrl(value: string | null | undefined) {
  if (!value) return undefined;
  try { const url = new URL(value); return url.protocol === "https:" && !url.username && !url.password ? url.href : undefined; }
  catch { return undefined; }
}
// Explicit allowlist: never persist or return cardToken, token, or customer PII.
export function publicPaymentData(charge: Charge) {
  const data: Record<string, string> = {};
  for (const key of ["brCode", "barCode", "identificationNumber"] as const) {
    if (charge[key]) data[key] = charge[key];
  }
  if (charge.brCodeBase64 && /^data:image\/png;base64,[A-Za-z0-9+/=]+$/.test(charge.brCodeBase64)) data.brCodeBase64 = charge.brCodeBase64;
  for (const key of ["url", "receiptUrl"] as const) { const url = httpsUrl(charge[key]); if (url) data[key] = url; }
  if (charge.expiresAt && Number.isFinite(Date.parse(charge.expiresAt))) data.expiresAt = charge.expiresAt;
  return data;
}
export type CheckoutOrder = {
  id: string; plan: string; cents: number; status: string; method: string | null;
  paymentData: Record<string, string>; devMode: boolean;
};
