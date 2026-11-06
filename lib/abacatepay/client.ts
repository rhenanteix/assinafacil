import { z } from "zod";

export class PaymentApiError extends Error {
  constructor(public readonly status: number, public readonly definiteRejection: boolean) {
    super(`AbacatePay HTTP ${status}`);
  }
}
export async function abacatePay(path: string, payload?: object): Promise<unknown> {
  const token = process.env.ABACATEPAY_API_KEY;
  if (!token) throw new Error("AbacatePay is not configured");
  const response = await fetch(`https://api.abacatepay.com/v2${path}`, {
    method: payload ? "POST" : "GET", cache: "no-store", redirect: "error",
    signal: AbortSignal.timeout(20000),
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: payload ? JSON.stringify(payload) : undefined,
  });
  const result = await response.json().catch(() => null);
  if (!response.ok || !result?.data || result.error || !result.success) {
    // A timeout/5xx may hide an accepted charge. Never retry creation automatically.
    throw new PaymentApiError(response.status, [400, 401, 403, 404, 422].includes(response.status));
  }
  return result.data;
}
export const chargeSchema = z.object({
  id: z.string().regex(/^(pix_char_|card_|bole_)[A-Za-z0-9_-]+$/),
  amount: z.number().int().positive(), status: z.string(), devMode: z.boolean(),
  updatedAt: z.string().datetime(),
  metadata: z.object({ orderId: z.string().optional() }).passthrough().nullish(),
  brCode: z.string().nullish(), brCodeBase64: z.string().nullish(),
  barCode: z.string().nullish(), identificationNumber: z.string().nullish(),
  url: z.string().nullish(), receiptUrl: z.string().nullish(), expiresAt: z.string().nullish(),
});
export type Charge = z.infer<typeof chargeSchema>;
export async function getCharge(id: string) {
  return chargeSchema.parse(await abacatePay(`/transparents/get?id=${encodeURIComponent(id)}`));
}
