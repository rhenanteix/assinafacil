import assert from "node:assert/strict";
import test from "node:test";
import { db } from "@/lib/prisma";
import { POST } from "@/app/api/business/route";

test("Business only confirms provider acceptance and respects validation and rate limits", async () => {
  const previous = { ...process.env };
  const originalFetch = globalThis.fetch;
  const originalTransaction = db.$transaction;
  let allowed = true;
  let calls = 0;
  Object.assign(process.env, { NEXTAUTH_URL: "https://example.com", RESEND_API_KEY: "fake-test-key", VERIFICATION_FROM_EMAIL: "Maily <sender@example.com>", BUSINESS_CONTACT_EMAIL: "team@example.com" });
  // Isolate transport and persistence; this test never sends email or connects to a DB.
  db.$transaction = (async () => allowed) as unknown as typeof db.$transaction;
  const input = { name: "Ana Silva", email: "ana@example.com", company: "Empresa", employees: 20, message: "Orçamento" };
  const request = (body = input, origin = "https://example.com") => new Request("https://example.com/api/business", { method: "POST", headers: { origin, "Content-Type": "application/json" }, body: JSON.stringify(body) });
  try {
    globalThis.fetch = async (_url, init) => {
      calls++;
      const payload = JSON.parse(String(init?.body));
      assert.deepEqual(payload.to, ["team@example.com"]);
      assert.equal(payload.reply_to, "ana@example.com");
      assert.equal(payload.html, undefined);
      return Response.json({ id: "accepted-test" });
    };
    assert.equal((await POST(request(input, "https://evil.example"))).status, 403);
    assert.equal((await POST(request({ ...input, employees: 0 }))).status, 400);
    assert.equal(calls, 0);
    assert.equal((await POST(request())).status, 201);
    assert.equal(calls, 1);
    allowed = false;
    assert.equal((await POST(request())).status, 429);
    assert.equal(calls, 1);
    allowed = true;
    globalThis.fetch = async () => Response.json({ error: "rejected" }, { status: 403 });
    assert.equal((await POST(request())).status, 502);
    delete process.env.BUSINESS_CONTACT_EMAIL;
    assert.equal((await POST(request())).status, 503);
  } finally {
    globalThis.fetch = originalFetch;
    db.$transaction = originalTransaction;
    for (const key of ["NEXTAUTH_URL", "RESEND_API_KEY", "VERIFICATION_FROM_EMAIL", "BUSINESS_CONTACT_EMAIL"]) {
      if (previous[key] === undefined) delete process.env[key]; else process.env[key] = previous[key];
    }
  }
});
