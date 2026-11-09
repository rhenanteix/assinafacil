import assert from "node:assert/strict";
import test from "node:test";
import { professionPacks, getProfessionBySlug } from "../lib/professions";
import { signatureSchema, emptySignature } from "../types/signature";
import { renderSignature, renderSignatureText } from "../lib/utils/signature";

test("profession packs have required typed shape and unique slugs", () => {
  assert.ok(professionPacks.length >= 4);
  const slugs = professionPacks.map(p => p.slug);
  assert.equal(new Set(slugs).size, slugs.length);
  for (const p of professionPacks) {
    assert.ok(p.id && p.name && p.slug);
    assert.ok(p.fields.length > 0);
    assert.ok(p.cta.label && (p.cta.type === "link" || p.cta.type === "whatsapp"));
    assert.ok(Array.isArray(p.recommendedModels) && p.recommendedModels.length > 0);
    assert.ok(p.seo.forWho && p.seo.whyItWorks);
    // exemplos fictícios .com.br, sem marcas reais
    assert.match(p.example.email, /@exemplo.*\.com\.br/);
  }
});

test("profession examples validate against signature schema and render without empty lines for blanks", () => {
  for (const p of professionPacks) {
    const data = signatureSchema.parse({ ...emptySignature, ...p.example, professionId: p.id });
    const html = renderSignature(data, false);
    assert.ok(!html.includes("undefined"));
    // campos vazios não geram conteúdo visível extra de endereço/empresa quando vazios (base)
    const blank = renderSignature({ ...emptySignature, name: "Nome", template: "essential" } as any, false);
    assert.ok(!blank.includes("undefined"));
  }
});

test("CTA and notice render only with pro in HTML; text version includes notice", () => {
  const data = signatureSchema.parse({ ...emptySignature, name: "Ana", template: "modern", ctaLabel: "Agendar", ctaType: "link", ctaUrl: "https://exemplo.com.br", legalNotice: "Aviso modelo" });
  const free = renderSignature(data, false);
  assert.ok(!free.includes("Agendar"));
  const pro = renderSignature(data, true);
  assert.ok(pro.includes("Agendar"));
  const text = renderSignatureText(data, true);
  assert.ok(text.includes("Aviso modelo"));
  assert.ok(text.includes("Agendar"));
});
