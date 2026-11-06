import assert from "node:assert/strict";
import test from "node:test";
import sharp from "sharp";
import { demo, demoDemos, signatureSchema, toEssential } from "@/types/signature";
import { whatsappUrl } from "@/types/whatsapp";
import { renderSignature } from "@/lib/utils/signature";
import { prepareSignatureImage } from "@/lib/signature/image";
import { businessInput, businessEmail } from "@/lib/business";

test("legacy signatures retain empty optional professional fields", () => {
  const old = { ...demo } as Partial<typeof demo>;
  for (const key of ["address", "cnpj", "professionalRegistration", "professionalRegistrationType", "legalNotice", "whatsapp"] as const) delete old[key];
  const parsed = signatureSchema.parse(old);
  assert.equal(parsed.address, "");
  assert.equal(parsed.legalNotice, "");
  assert.equal(signatureSchema.safeParse({ ...parsed, professionalRegistrationType: "" }).success, true);
});
test("WhatsApp accepts international numbers and preserves query parameters safely", () => {
  assert.equal(whatsappUrl("+55 (11) 99999-0000"), "https://wa.me/5511999990000");
  assert.equal(whatsappUrl("https://wa.me/5511999990000?text=Hello%202026"), "https://wa.me/5511999990000?text=Hello%202026");
  assert.equal(whatsappUrl("https://wa.me.evil.test/5511999990000"), null);
  assert.equal(whatsappUrl("javascript:alert(1)"), null);
  assert.equal(toEssential(signatureSchema.parse({ ...demo, whatsapp: "+5511999990000" })).whatsapp, "https://wa.me/5511999990000");
});
test("all profession samples validate and render escaped fields and readable domains", () => {
  assert.equal(Object.keys(demoDemos).length, 15);
  for (const sample of Object.values(demoDemos)) {
    const parsed = signatureSchema.parse(sample);
    const html = renderSignature({ ...parsed, legalNotice: '<script>alert("x")</script>', address: "Rua <b>Brasil</b>" }, true);
    assert.match(html, /&lt;script&gt;/);
    assert.match(html, /Rua &lt;b&gt;/);
    assert.equal(sample.address, "");
    assert.equal(sample.cnpj, "");
    assert.equal(sample.website, "");
    assert.match(html, /alt="WhatsApp"/);
    assert.doesNotMatch(html, /<svg|object-fit|data:image/);
  }
});
test("uploaded portraits are square PNGs with transparent circular corners", async () => {
  const source = await sharp({ create: { width: 500, height: 300, channels: 3, background: "red" } }).png().toBuffer();
  const photo = await prepareSignatureImage(source, "photo");
  const { data, info } = await sharp(photo).raw().toBuffer({ resolveWithObject: true });
  assert.equal(info.width, 256); assert.equal(info.height, 256);
  assert.equal(data[3], 0);
  assert.equal(data[(128 * 256 + 128) * 4 + 3], 255);
  const logo = await prepareSignatureImage(source, "logo");
  const metadata = await sharp(logo).metadata();
  assert.equal(metadata.width, 256); assert.equal(metadata.height, 256);
});
test("Business validates inputs and sends contact information as plain text", () => {
  const data = businessInput.parse({ name: "Ana Silva", email: "ana@example.com", company: "Empresa", employees: "20", message: "<b>Orçamento</b>" });
  assert.equal(data.employees, 20);
  assert.match(businessEmail(data), /Colaboradores: 20/);
  assert.equal(businessInput.safeParse({ ...data, employees: 0 }).success, false);
  assert.equal(businessInput.safeParse({ ...data, website: "spam" }).success, false);
  assert.equal(businessInput.safeParse({ ...data, email: "bad" }).success, false);
});
