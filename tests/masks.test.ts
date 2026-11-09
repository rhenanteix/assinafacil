import assert from "node:assert/strict";
import test from "node:test";
import { maskPhoneBR, maskCEP, maskCNPJ, validCEP, validCNPJ } from "../lib/masks";

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
