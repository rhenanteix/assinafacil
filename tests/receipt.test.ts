import test from "node:test";
import assert from "node:assert/strict";
import { db } from "@/lib/prisma";
import { sendPaymentReceipt } from "@/lib/email/receipt";
test("receipts skip test/unapproved orders and do not resend accepted receipts", async () => {
  const previousKey = process.env.RESEND_API_KEY, previousFrom = process.env.VERIFICATION_FROM_EMAIL;
  const fetch = globalThis.fetch, find = db.order.findUnique, update = db.order.update, transaction = db.$transaction;
  process.env.RESEND_API_KEY = "test"; process.env.VERIFICATION_FROM_EMAIL = "sender@example.com";
  const order = { id: "order-1", userId: "user-1", plan: "lifetime", cents: 4990, status: "pending", devMode: false, receiptSentAt: null as Date | null, receiptClaimedAt: null as Date | null, receiptAttemptedAt: null as Date | null };
  let sends = 0;
  db.order.findUnique = (async () => order) as unknown as typeof find;
  const mutate = async ({ data }: { data: object }) => Object.assign(order, data);
  db.order.update = mutate as unknown as typeof update;
  db.$transaction = (async (fn: (tx: unknown) => Promise<unknown>) => fn({ $queryRaw: async () => [], order: { findUniqueOrThrow: async () => order, update: mutate }, user: { findUniqueOrThrow: async () => ({ email: "test@example.com" }) } })) as unknown as typeof transaction;
  globalThis.fetch = async () => { sends++; return Response.json({ id: "email-1" }); };
  try {
    await sendPaymentReceipt(order.id); assert.equal(sends, 0);
    order.status = "approved"; order.devMode = true;
    await sendPaymentReceipt(order.id); assert.equal(sends, 0);
    order.devMode = false;
    await sendPaymentReceipt(order.id); assert.equal(sends, 1); assert.ok(order.receiptSentAt);
    await sendPaymentReceipt(order.id); assert.equal(sends, 1);
    order.receiptSentAt = null; order.receiptClaimedAt = null; order.receiptAttemptedAt = new Date(Date.now() - 24 * 3600000);
    await sendPaymentReceipt(order.id); assert.equal(sends, 1);
  } finally {
    globalThis.fetch = fetch; db.order.findUnique = find; db.order.update = update; db.$transaction = transaction;
    if (previousKey === undefined) delete process.env.RESEND_API_KEY; else process.env.RESEND_API_KEY = previousKey;
    if (previousFrom === undefined) delete process.env.VERIFICATION_FROM_EMAIL; else process.env.VERIFICATION_FROM_EMAIL = previousFrom;
  }
});
