import assert from "node:assert/strict";
import test from "node:test";
import { resolveLocale, translator } from "@/lib/i18n/shared";
import { renderSignature } from "@/lib/utils/signature";
import { demo } from "@/types/signature";
import { price } from "@/lib/payments/plans";

test("locale defaults to Brazilian Portuguese and rejects unsupported cookies", () => {
  assert.equal(resolveLocale(), "pt-BR");
  assert.equal(resolveLocale("fr"), "pt-BR");
  assert.equal(resolveLocale("en"), "en");
});
test("translations preserve interpolation values and localize validation errors", () => {
  const en = translator("en");
  assert.equal(en("Excluir {name}", { name: "João" }), "Delete João");
  assert.equal(en("Informe um link válido de LinkedIn."), "Enter a valid LinkedIn link.");
  assert.equal(translator("pt-BR")("Nome completo"), "Nome completo");
  assert.equal(en("Nome completo"), "Full name");
});
test("English exports translate built-in copy without changing personal details", () => {
  const data = { ...demo, name: "João", role: "Diretor", template: "consulting" as const };
  const en = renderSignature(data, false, "en");
  assert.match(en, /PROFESSIONAL CONTACT/);
  assert.match(en, /Created with Maily/);
  assert.match(en, /João/);
  assert.match(en, /Diretor/);
  assert.doesNotMatch(en, /CONTATO PROFISSIONAL|Criado com/);
  assert.match(renderSignature(data, false), /CONTATO PROFISSIONAL/);
  assert.match(renderSignature({ ...demo, template: "sales" }, true, "en"), /Chat on WhatsApp/);
});
test("localized pricing keeps the original BRL currency and amount", () => {
  assert.match(price(4990, "pt-BR"), /49,90/);
  assert.match(price(4990, "en"), /49\.90/);
  assert.match(price(4990, "en"), /R\$/);
});
