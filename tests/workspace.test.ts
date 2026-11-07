import test from "node:test";
import assert from "node:assert/strict";
import type { Prisma } from "@prisma/client";
import { canAssignFolder } from "@/lib/signature/folders";
import { emptySignature } from "@/types/signature";
import { signatureAccess } from "@/lib/prisma/signatures";
const workspace = { completed: true, brand: { ...emptySignature, name: "Ana" }, folders: [{ id: "marketing", name: "Marketing", color: "#553399", template: "modern" }] };
test("folder assignment requires Business and a folder owned by the current account", async () => {
  const client = { user: { findUnique: async ({ where }: { where: { id: string } }) => ({ workspace: where.id === "owner" ? workspace : null }) } } as unknown as Prisma.TransactionClient;
  assert.equal(await canAssignFolder(client, "owner", "marketing", true), true);
  assert.equal(await canAssignFolder(client, "other", "marketing", true), false);
  assert.equal(await canAssignFolder(client, "owner", "marketing", false), false);
  assert.equal(await canAssignFolder(client, "owner", "missing", true), false);
  assert.equal(await canAssignFolder(client, "owner", undefined, false), true);
});
test("Business includes Pro access but does not unlock separately purchased templates", async () => {
  const client = { order: { findMany: async () => [{ plan: "business" }] } } as unknown as Prisma.TransactionClient;
  assert.deepEqual(await signatureAccess("owner", client), { pro: true, business: true, owned: [] });
});
