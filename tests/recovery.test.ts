import assert from "node:assert/strict";
import test from "node:test";
import { db } from "@/lib/prisma";
import { recoveryHash, resetPassword } from "@/lib/auth/recovery";
import { compare } from "bcryptjs";
test("recovery token is consumed once and invalidates existing sessions", async () => {
  const token = "a".repeat(64);
  const saved = { token: recoveryHash(token), identifier: "recover:user-1", expires: new Date(Date.now() + 60000) };
  const find = db.verificationToken.findUnique, transaction = db.$transaction;
  let consumed = false, passwordHash = "", revoked = false;
  db.verificationToken.findUnique = (async () => saved) as unknown as typeof find;
  db.$transaction = (async (fn: (tx: unknown) => Promise<unknown>) => fn({
    $queryRaw: async () => [],
    verificationToken: { deleteMany: async () => { if (consumed) return { count: 0 }; consumed = true; return { count: 1 }; } },
    user: { update: async ({ data }: { data: { passwordHash: string; authVersion: { increment: number } } }) => { passwordHash = data.passwordHash; assert.equal(data.authVersion.increment, 1); } },
    session: { deleteMany: async () => { revoked = true; } },
  })) as unknown as typeof transaction;
  try {
    assert.equal(await resetPassword(token, "new-password-123"), true);
    assert.equal(await compare("new-password-123", passwordHash), true);
    assert.equal(revoked, true);
    assert.equal(await resetPassword(token, "other-password-123"), false);
    saved.expires = new Date(0);
    assert.equal(await resetPassword(token, "other-password-123"), false);
  } finally { db.verificationToken.findUnique = find; db.$transaction = transaction; }
});
