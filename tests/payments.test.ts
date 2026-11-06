import assert from "node:assert/strict";
import test from "node:test";
import { createHmac } from "node:crypto";
import { chargeSchema, abacatePay, PaymentApiError } from "@/lib/abacatepay/client";
import { verifyAbacateWebhook, webhookIntegrityKey } from "@/lib/abacatepay/security";
import { nextPaymentStatus, paymentStatus, publicPaymentData } from "@/lib/payments/state";
import { checkoutInput } from "@/lib/payments/validation";

const id = "f47ac10b-58cc-4372-a567-0e02b2c3d479";
const payload = { id: "card_abc123", amount: 4990, status: "APPROVED", devMode: false,
  updatedAt: "2026-11-05T10:00:00.000Z", metadata: { orderId: "order-1" } };

test("webhook requires private secret AND exact signed raw body", () => {
  const raw = JSON.stringify({ id: "log_123", event: "transparent.completed" });
  const signature = createHmac("sha256", webhookIntegrityKey).update(raw).digest("base64");
  const request = (secret: string, sig = signature) => new Request(`https://example.com/api/payments/abacatepay/webhook?webhookSecret=${secret}`, { headers: { "x-webhook-signature": sig } });
  assert.equal(verifyAbacateWebhook(request("private"), raw, "private"), true);
  assert.equal(verifyAbacateWebhook(request("wrong"), raw, "private"), false);
  assert.equal(verifyAbacateWebhook(request("private"), raw + " ", "private"), false);
  assert.equal(verifyAbacateWebhook(request("private", "bad"), raw, "private"), false);
  assert.equal(verifyAbacateWebhook(request(""), raw, ""), false);
  assert.equal(verifyAbacateWebhook(request("private", "é".repeat(signature.length)), raw, "private"), false);
});
test("charge projection strips reusable tokens and customer PII", () => {
  const charge = chargeSchema.parse({ ...payload, cardToken: "permanent-secret", token: "ctok_secret", customer: { taxId: "12345678901" },
    receiptUrl: "javascript:alert(1)", url: "https://app.abacatepay.com/boleto/123", brCodeBase64: "data:image/svg+xml,<svg></svg>" });
  const visible = publicPaymentData(charge);
  assert.deepEqual(visible, { url: "https://app.abacatepay.com/boleto/123" });
  assert.doesNotMatch(JSON.stringify(charge), /permanent-secret|ctok_secret|12345678901/);
});
test("payment status handles approvals, refunds, disputes and out-of-order delivery", () => {
  const before = new Date("2026-11-05T10:00:00Z");
  const after = new Date("2026-11-05T11:00:00Z");
  assert.equal(paymentStatus("APPROVED"), "approved");
  assert.equal(paymentStatus("PAID"), "approved");
  assert.equal(paymentStatus("UNKNOWN"), undefined);
  assert.equal(nextPaymentStatus("refunded", "approved", before, after), "refunded");
  assert.equal(nextPaymentStatus("in_mediation", "approved", after, before), "in_mediation");
  assert.equal(nextPaymentStatus("in_mediation", "approved", before, after), "approved");
  assert.equal(nextPaymentStatus("approved", "pending", before, after), "approved");
  assert.equal(nextPaymentStatus("approved", "refunded", before, after), "refunded");
});
test("checkout accepts only active plans and tokens, never client prices or raw card details", () => {
  const pix = { plan: "lifetime", method: "PIX", requestId: id };
  assert.equal(checkoutInput.safeParse(pix).success, true);
  assert.equal(checkoutInput.safeParse({ ...pix, amount: 100 }).success, false);
  assert.equal(checkoutInput.safeParse({ ...pix, plan: "monthly" }).success, false);
  assert.equal(checkoutInput.safeParse({ ...pix, method: "CARD", cardNumber: "4242424242424242" }).success, false);
  assert.equal(checkoutInput.safeParse({ ...pix, method: "CARD", token: "dev_card_4242" }).success, false);
  assert.equal(checkoutInput.safeParse({ ...pix, method: "BOLETO" }).success, false);
});
test("provider failure distinguishes refusal from uncertain timeout/5xx without retrying", async () => {
  const previousKey = process.env.ABACATEPAY_API_KEY;
  process.env.ABACATEPAY_API_KEY = "test-only";
  const realFetch = globalThis.fetch;
  let calls = 0;
  try {
    globalThis.fetch = async () => { calls++; return Response.json({ success: false, error: "refused" }, { status: 400 }); };
    await assert.rejects(abacatePay("/transparents/create", {}), (error: unknown) => error instanceof PaymentApiError && error.definiteRejection);
    assert.equal(calls, 1);
    globalThis.fetch = async () => { calls++; return new Response("bad gateway", { status: 502 }); };
    await assert.rejects(abacatePay("/transparents/create", {}), (error: unknown) => error instanceof PaymentApiError && !error.definiteRejection);
    assert.equal(calls, 2);
    globalThis.fetch = async () => Response.json({ data: payload, error: null, success: { message: "Created" } });
    assert.deepEqual(await abacatePay("/transparents/create", {}), payload);
  } finally {
    globalThis.fetch = realFetch;
    if (previousKey === undefined) delete process.env.ABACATEPAY_API_KEY; else process.env.ABACATEPAY_API_KEY = previousKey;
  }
});
