import assert from "node:assert/strict";
import test from "node:test";
import { sendTransactionalEmail } from "@/lib/email/send";
test("transactional email requires provider acceptance and sends an idempotency key", async () => {
  const originalFetch = globalThis.fetch;
  const originalKey = process.env.RESEND_API_KEY, originalSender = process.env.VERIFICATION_FROM_EMAIL;
  process.env.RESEND_API_KEY = "test"; process.env.VERIFICATION_FROM_EMAIL = "sender@example.com";
  try {
    globalThis.fetch = async (_url, init) => {
      assert.equal((init?.headers as Record<string, string>)["Idempotency-Key"], "test-key");
      const body = JSON.parse(String(init?.body)); assert.deepEqual(body.to, ["recipient@example.com"]);
      return Response.json({ id: "email-1" });
    };
    const email = { to: "recipient@example.com", subject: "Test", text: "Test", key: "test-key" };
    assert.equal(await sendTransactionalEmail(email), "email-1");
    globalThis.fetch = async () => Response.json({ error: "rejected" }, { status: 403 });
    await assert.rejects(() => sendTransactionalEmail(email));
  } finally {
    globalThis.fetch = originalFetch;
    if (originalKey === undefined) delete process.env.RESEND_API_KEY; else process.env.RESEND_API_KEY = originalKey;
    if (originalSender === undefined) delete process.env.VERIFICATION_FROM_EMAIL; else process.env.VERIFICATION_FROM_EMAIL = originalSender;
  }
});
