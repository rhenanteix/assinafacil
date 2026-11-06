import { createHmac, timingSafeEqual } from "node:crypto";

export async function mercadoPago<T>(path: string, payload?: object): Promise<T> {
  const token = process.env.MP_ACCESS_TOKEN;
  if (!token) throw new Error("Mercado Pago indisponível.");
  const response = await fetch(`https://api.mercadopago.com${path}`, {
    method: payload ? "POST" : "GET", cache: "no-store", signal: AbortSignal.timeout(12000),
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: payload ? JSON.stringify(payload) : undefined,
  });
  if (!response.ok) throw new Error(`Mercado Pago HTTP ${response.status}`);
  return response.json();
}
export function verifyWebhook(request: Request, id: string) {
  const secret = process.env.MP_WEBHOOK_SECRET;
  const requestId = request.headers.get("x-request-id");
  const parts = Object.fromEntries((request.headers.get("x-signature") ?? "").split(",").map(part => part.trim().split("=", 2)));
  if (!secret || !requestId || !/^\d+$/.test(parts.ts ?? "") || !/^[\da-f]{64}$/i.test(parts.v1 ?? "")) return false;
  const manifest = `id:${id};request-id:${requestId};ts:${parts.ts};`;
  const expected = createHmac("sha256", secret).update(manifest).digest();
  return timingSafeEqual(expected, Buffer.from(parts.v1, "hex"));
}
