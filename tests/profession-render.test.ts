import assert from "node:assert/strict";
import test from "node:test";
import { signatureSchema, emptySignature } from "../types/signature";
import { renderSignature, renderSignatureText } from "../lib/utils/signature";

test("renderSignature omits empty optional fields (no blank lines/content for empties)", () => {
  const data = signatureSchema.parse({ ...emptySignature, name: "Ana", email: "", phone: "", company: "", role: "", address: "", template: "essential" });
  const html = renderSignature(data, false);
  assert.ok(html.includes("Ana"));
  assert.ok(!html.includes("undefined"));
  assert.ok(!html.includes("tel:"));
  assert.ok(!html.includes("mailto:"));
});

test("legacy signature without new fields still parses and renders", () => {
  const parsed = signatureSchema.parse({ name: "Ana", role: "Dev", company: "X", phone: "", email: "", address: "", cnpj: "", whatsapp: "", template: "essential", color: "#5b45db", website: "", instagram: "", facebook: "", linkedin: "", youtube: "", tiktok: "", x: "", github: "", photo: "", logo: "", legalNotice: "", professionalRegistration: "" });
  assert.equal(parsed.professionId, "");
  assert.ok(renderSignature(parsed, false).includes("Ana"));
});
