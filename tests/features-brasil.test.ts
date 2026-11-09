import assert from "node:assert/strict";
import test from "node:test";
import { maskPhoneBR, maskCEP, maskCNPJ, validCEP, validCNPJ, maskPhoneInput, normalizePhoneBR, validPhoneBR } from "../lib/masks";
import { whatsappLink } from "../types/whatsapp";
import { formatarRegistro, conselhosProfissionais, getConselho } from "../lib/professions/registries";
import { regrasChecklist, avaliarRegras } from "../lib/professions/checklist";
import { professionPacks } from "../lib/professions";
import { signatureSchema, emptySignature } from "../types/signature";
import { renderSignature } from "../lib/utils/signature";

test("masks format BR phone, CEP, CNPJ", () => {
  assert.equal(maskPhoneBR("11999990000"), "+55 (11) 99999-0000");
  assert.equal(maskCEP("01310100"), "01310-100");
  assert.equal(maskCNPJ("11222333000181"), "11.222.333/0001-81");
});

test("validators accept empty and valid values, reject invalid", () => {
  assert.equal(validCEP(""), true);
  assert.equal(validCEP("01310-100"), true);
  assert.equal(validCEP("123"), false);
  assert.equal(validCNPJ(""), true);
  assert.equal(validCNPJ("11.222.333/0001-81"), true);
  assert.equal(validCNPJ("00.000.000/0000-00"), false);
});

test("maskPhoneInput applies BR phone mask while typing", () => {
  assert.equal(maskPhoneInput("11999990000"), "+55 (11) 99999-0000");
  assert.equal(maskPhoneInput("+55 11 99999-0000"), "+55 (11) 99999-0000");
  assert.equal(maskPhoneInput("1133334444"), "+55 (11) 3333-4444");
  assert.equal(maskPhoneInput(""), "");
});

test("normalizePhoneBR distinguishes mobile and landline", () => {
  const mobile = normalizePhoneBR("+55 (11) 99999-0000");
  assert.equal(mobile.kind, "celular");
  assert.equal(mobile.ddd, "11");
  assert.equal(mobile.number, "999990000");

  const fixo = normalizePhoneBR("11 3333-4444");
  assert.equal(fixo.kind, "fixo");
  assert.equal(fixo.ddd, "11");
  assert.equal(fixo.number, "33334444");
});

test("validPhoneBR accepts valid mobile and landline, rejects invalid", () => {
  assert.equal(validPhoneBR("+55 (11) 99999-0000"), true);
  assert.equal(validPhoneBR("11 3333-4444"), true);
  assert.equal(validPhoneBR(""), true);
  assert.equal(validPhoneBR("11 9999-0000"), false); // celular precisa de 9 dígitos
  assert.equal(validPhoneBR("11 6666-6666"), false); // fixo não começa com 6
  assert.equal(validPhoneBR("12345"), false);
});

test("whatsappLink generates wa.me link with encoded message", () => {
  assert.equal(whatsappLink("5511999990000"), "https://wa.me/5511999990000");
  assert.equal(whatsappLink("5511999990000", "Olá, vim pelo seu e-mail"), "https://wa.me/5511999990000?text=Ol%C3%A1%2C%20vim%20pelo%20seu%20e-mail");
  assert.equal(whatsappLink("123"), null);
});

test("formatarRegistro produces standardized display", () => {
  assert.equal(formatarRegistro("CRM", "123456", "SP", "12345"), "CRM-SP 123456 | RQE 12345");
  assert.equal(formatarRegistro("OAB", "123456", "SP"), "OAB-SP 123456");
  assert.equal(formatarRegistro("OUTRO", "123456", ""), "Outro 123456");
});

test("conselhos list includes required types and is data-driven", () => {
  const ids = conselhosProfissionais.map(c => c.id);
  assert.ok(ids.includes("CRECI"));
  assert.ok(ids.includes("OAB"));
  assert.ok(ids.includes("CRM"));
  assert.ok(ids.includes("CRO"));
  assert.ok(ids.includes("CRP"));
  assert.ok(ids.includes("CRN"));
  assert.ok(ids.includes("CRC"));
  assert.ok(ids.includes("CAU"));
  assert.ok(ids.includes("CREA"));
  assert.ok(ids.includes("CREF"));
  assert.ok(ids.includes("OUTRO"));
  assert.ok(getConselho("CRECI")?.ufObrigatoria);
  assert.ok(!getConselho("OUTRO")?.ufObrigatoria);
  assert.ok(getConselho("CRM")?.rqe);
});

test("profession packs validate against schema and render without empty lines", () => {
  for (const p of professionPacks) {
    const data = signatureSchema.parse({ ...emptySignature, ...p.example, professionId: p.id });
    const html = renderSignature(data, true);
    assert.ok(!html.includes("undefined"));
  }
});

test("checklist rules are non-blocking and have review date and source", () => {
  for (const r of regrasChecklist) {
    assert.ok(r.id && r.label && r.dataRevisao && r.fonte);
    assert.ok(Array.isArray(r.profissoes) && r.profissoes.length > 0);
    const resultado = r.avaliar({});
    assert.ok(typeof resultado.ok === "boolean" && typeof resultado.motivo === "string");
  }
});

test("checklist detects missing registration for professions that require it", () => {
  const semRegistro = avaliarRegras("advogado", { professionalRegistration: "", professionalRegistrationType: "" });
  const registroFaltante = semRegistro.find(r => r.id === "registro-profissional-faltante");
  assert.ok(registroFaltante);
  assert.equal(registroFaltante.resultado.ok, false);

  const comRegistro = avaliarRegras("advogado", { professionalRegistration: "123456", professionalRegistrationType: "OAB" });
  const registroOk = comRegistro.find(r => r.id === "registro-profissional-faltante");
  assert.ok(registroOk);
  assert.equal(registroOk.resultado.ok, true);
});

test("checklist detects CRM without RQE", () => {
  const semRqe = avaliarRegras("saude", { professionalRegistration: "123456", professionalRegistrationType: "CRM", professionalRegistrationRqe: "" });
  const regra = semRqe.find(r => r.id === "crm-sem-rqe");
  assert.ok(regra);
  assert.equal(regra.resultado.ok, false);

  const comRqe = avaliarRegras("saude", { professionalRegistration: "123456", professionalRegistrationType: "CRM", professionalRegistrationRqe: "12345" });
  const regraOk = comRqe.find(r => r.id === "crm-sem-rqe");
  assert.ok(regraOk);
  assert.equal(regraOk.resultado.ok, true);
});

test("checklist detects imperative commercial CTA for advocacia", () => {
  const comImperativo = avaliarRegras("advogado", { ctaLabel: "Ligue já!" });
  const regra = comImperativo.find(r => r.id === "cta-imperativo-advocacia");
  assert.ok(regra);
  assert.equal(regra.resultado.ok, false);

  const semImperativo = avaliarRegras("advogado", { ctaLabel: "Falar com o escritório" });
  const regraOk = semImperativo.find(r => r.id === "cta-imperativo-advocacia");
  assert.ok(regraOk);
  assert.equal(regraOk.resultado.ok, true);
});

test("HTML omits empty optional fields (no blank lines)", () => {
  const data = signatureSchema.parse({ ...emptySignature, name: "Ana", email: "", phone: "", company: "", role: "", address: "", template: "essential" });
  const html = renderSignature(data, false);
  assert.ok(html.includes("Ana"));
  assert.ok(!html.includes("undefined"));
});

test("signature renders CNPJ example that passes validation", () => {
  const data = signatureSchema.parse({ ...emptySignature, name: "João", cnpj: "11.222.333/0001-81", template: "essential" });
  const html = renderSignature(data, false);
  assert.ok(html.includes("11.222.333/0001-81"));
  assert.ok(!html.includes("example.com"));
});
