import assert from "node:assert/strict";
import test from "node:test";
import { renderSignature } from "@/lib/utils/signature";
import { demoDemos } from "@/types/signature";
import { commercialInfo } from "@/lib/commercial";
test("Free attribution is a linked acquisition channel, Pro does not contain it", () => {
  const free = renderSignature(demoDemos.essential, false);
  assert.match(free, /utm_source=signature/);
  assert.match(free, /Criado com Maily/);
  assert.doesNotMatch(renderSignature(demoDemos.modern, true), /utm_source=signature/);
});
test("Business displays the authorized initial and monthly prices", () => {
  assert.equal(commercialInfo().businessBase.cents, 8990);
  assert.equal(commercialInfo().businessBase.monthlyCents, 990);
});
