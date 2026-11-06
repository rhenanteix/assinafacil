import assert from "node:assert/strict";
import test from "node:test";
import { randomUUID, createHmac } from "node:crypto";
import { webhookIntegrityKey } from "@/lib/abacatepay/security";

// Explicit, disposable DB only. This test never connects to DATABASE_URL from .env.
const target = process.env.PAYMENT_TEST_DATABASE_URL;
test("payment transactions and signed webhook grant/revoke access exactly once", { skip: !target }, async () => {
  const url = new URL(target!);
  assert.equal(url.hostname, "127.0.0.1");
  assert.equal(url.port, "55432");
  assert.equal(url.pathname, "/payment_test");
  process.env.DATABASE_URL = target;
  process.env.ABACATEPAY_ENVIRONMENT = "production";
  process.env.ABACATEPAY_API_KEY = "test-only-never-sent";
  process.env.ABACATEPAY_WEBHOOK_SECRET = "test-webhook-secret";
  const { db } = await import("@/lib/prisma");
  const { applyCharge } = await import("@/lib/payments/orders");
  const { signatureAccess } = await import("@/lib/prisma/signatures");
  const { POST } = await import("@/app/api/payments/abacatepay/webhook/route");
  const user = await db.user.create({ data: { email: `${randomUUID()}@example.invalid`, emailVerified: new Date() } });
  const eventId = "test_" + randomUUID();
  const paymentId = "card_" + randomUUID();
  const realFetch = globalThis.fetch;
  try {
    const order = await db.order.create({ data: { userId: user.id, provider: "abacatepay", method: "CARD", plan: "lifetime", cents: 4990, status: "creating" } });
    const base = { id: paymentId, amount: 4990, status: "PENDING", devMode: false, updatedAt: "2026-11-05T10:00:00.000Z", metadata: { orderId: order.id } };
    await assert.rejects(applyCharge(order.id, { ...base, amount: 100 }));
    await assert.rejects(applyCharge(order.id, { ...base, devMode: true }));
    await assert.rejects(applyCharge(order.id, { ...base, metadata: { orderId: "another-order" } }));
    assert.equal((await signatureAccess(user.id)).pro, false);
    await applyCharge(order.id, base);
    const charge = { ...base, status: "APPROVED", updatedAt: "2026-11-05T10:01:00.000Z" };
    const raw = JSON.stringify({ id: eventId, event: "transparent.completed", apiVersion: 2, devMode: false, data: { transparent: charge } });
    const signature = createHmac("sha256", webhookIntegrityKey).update(raw).digest("base64");
    const request = (secret = "test-webhook-secret") => new Request(`https://example.com/api/payments/abacatepay/webhook?webhookSecret=${secret}`, { method: "POST", body: raw, headers: { "x-webhook-signature": signature } });
    assert.equal((await POST(request("wrong"))).status, 401);
    assert.equal((await signatureAccess(user.id)).pro, false);
    let providerReads = 0;
    globalThis.fetch = async () => { providerReads++; return Response.json({ data: charge, success: true, error: null }); };
    const responses = await Promise.all([POST(request()), POST(request())]);
    assert.deepEqual(responses.map(r => r.status), [200, 200]);
    assert.equal((await signatureAccess(user.id)).pro, true);
    assert.equal(await db.paymentEvent.count({ where: { id: `abacatepay:${eventId}` } }), 1);
    const reads = providerReads;
    assert.equal((await POST(request())).status, 200);
    assert.equal(providerReads, reads);
    await applyCharge(order.id, { ...charge, status: "UNDER_DISPUTE", updatedAt: "2026-11-05T11:00:00.000Z" });
    assert.equal((await signatureAccess(user.id)).pro, false);
    await applyCharge(order.id, charge); // late approval cannot reopen access
    assert.equal((await signatureAccess(user.id)).pro, false);
    await applyCharge(order.id, { ...charge, status: "PAID", updatedAt: "2026-11-05T12:00:00.000Z" });
    assert.equal((await signatureAccess(user.id)).pro, true);
    await applyCharge(order.id, { ...charge, status: "REFUNDED", updatedAt: "2026-11-05T13:00:00.000Z" });
    await applyCharge(order.id, { ...charge, updatedAt: "2026-11-05T14:00:00.000Z" });
    assert.equal((await signatureAccess(user.id)).pro, false);
    assert.equal((await db.order.findUniqueOrThrow({ where: { id: order.id } })).status, "refunded");
    const exclusive = await db.order.create({ data: { userId: user.id, provider: "abacatepay", method: "PIX", plan: "signature-luxe", cents: 2490, status: "creating" } });
    await applyCharge(exclusive.id, { ...base, id: "pix_char_" + randomUUID(), amount: 2490, status: "PAID", metadata: { orderId: exclusive.id } });
    assert.deepEqual((await signatureAccess(user.id)).owned, ["signature-luxe"]);
    const sandbox = await db.order.create({ data: { userId: user.id, provider: "abacatepay", method: "PIX", plan: "lifetime", cents: 4990, status: "approved", devMode: true } });
    assert.equal((await signatureAccess(user.id)).pro, false, "test payments never grant production access");
    assert.ok(sandbox.id);
  } finally {
    globalThis.fetch = realFetch;
    await db.paymentEvent.deleteMany({ where: { id: `abacatepay:${eventId}` } });
    await db.user.delete({ where: { id: user.id } });
    await db.$disconnect();
  }
});
