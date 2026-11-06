import { createHash, createHmac, timingSafeEqual } from "node:crypto";
// Public integrity key published at docs.abacatepay.com/pages/webhooks/security.
// This is NOT the store's pk_ card key. Authentication also requires our private webhook secret.
export const webhookIntegrityKey = "t9dXRhHHo3yDEj5pVDYz0frf7q6bMKyMRmxxCPIPp3RCplBfXRxqlC6ZpiWmOqj4L63qEaeUOtrCI8P0VMUgo6iIga2ri9ogaHFs0WIIywSMg0q7RmBfybe1E5XJcfC4IW3alNqym0tXoAKkzvfEjZxV6bE0oG2zJrNNYmUCKZyV0KZ3JS8Votf9EAWWYdiDkMkpbMdPggfh1EqHlVkMiTady6jOR3hyzGEHrIz2Ret0xHKMbiqkr9HS1JhNHDX9";
export function verifyAbacateWebhook(request: Request, raw: string, secret = process.env.ABACATEPAY_WEBHOOK_SECRET) {
  if (!secret) return false;
  const supplied = new URL(request.url).searchParams.get("webhookSecret") ?? "";
  const hash = (value: string) => createHash("sha256").update(value).digest();
  if (!timingSafeEqual(hash(supplied), hash(secret))) return false;
  const signature = request.headers.get("x-webhook-signature") ?? "";
  const expected = createHmac("sha256", webhookIntegrityKey).update(raw, "utf8").digest("base64");
  const suppliedBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  return suppliedBuffer.length === expectedBuffer.length && timingSafeEqual(suppliedBuffer, expectedBuffer);
}
