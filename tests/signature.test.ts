import assert from "node:assert/strict";
import test from "node:test";
import sharp from "sharp";
import { canUseTemplate, demo, signatureSchema, templates, toEssential } from "@/types/signature";
import { prepareSignature } from "@/lib/signature/access";
import { freeSignaturePng } from "@/lib/signature/free-png";
import { renderSignature } from "@/lib/utils/signature";

test("Free has one fixed template and strips premium data", () => {
  assert.deepEqual(templates.filter(template => canUseTemplate(template.id, false)).map(template => template.id), ["essential"]);
  const original = { ...demo, template: "essential" as const, photo: "https://res.cloudinary.com/example/image.png", website: "https://example.com", instagram: "https://instagram.com/example", color: "#ff0000" };
  const result = prepareSignature(original, { pro: false, owned: [] });
  assert.equal(result?.premium, false);
  assert.deepEqual(result?.data, toEssential(demo));
  assert.equal(prepareSignature(demo, { pro: false, owned: [] }), null);
});

test("exclusive templates require their own purchase", () => {
  assert.equal(canUseTemplate("signature-luxe", true), false);
  assert.equal(canUseTemplate("signature-luxe", false, ["signature-luxe"]), true);
  assert.equal(prepareSignature({ ...demo, template: "signature-luxe" }, { pro: false, owned: ["signature-luxe"] })?.premium, true);
});

test("old records receive defaults for new social fields", () => {
  const old = { ...demo } as Partial<typeof demo>;
  for (const key of ["facebook", "whatsapp", "youtube", "tiktok", "x", "github"] as const) delete old[key];
  const parsed = signatureSchema.parse(old);
  assert.equal(parsed.facebook, "");
  assert.equal(parsed.youtube, "");
  assert.equal(signatureSchema.safeParse({ ...demo, facebook: "javascript:alert(1)" }).success, false);
  assert.equal(signatureSchema.safeParse({ ...demo, facebook: "https://facebook.com.attacker.test/profile" }).success, false);
});

test("social icons use linked PNGs with accessible labels and escaped input", async () => {
  const data = { ...demo, name: '<img src="x" onerror="alert(1)">', instagram: "https://instagram.com/example", facebook: "https://facebook.com/example", linkedin: "https://linkedin.com/in/example" };
  const html = renderSignature(data, true, "pt-BR", "https://example.com");
  assert.match(html, /&lt;img/);
  assert.doesNotMatch(html, /<img src="x"/);
  for (const network of ["instagram", "facebook", "linkedin"]) {
    assert.match(html, new RegExp(network + "\\.com"));
    assert.doesNotMatch(html, /<svg|data:image/);
    assert.ok(html.includes(`https://example.com/social/${network}.png`));
  }
  assert.doesNotMatch(html, /youtube\.com\/example/);
  assert.match(html, /alt="Facebook"/);
  assert.doesNotMatch(renderSignature(data, false), /<svg/);
});

test("free preview produces real PNG and safely handles XML-like names", async () => {
  const png = await freeSignaturePng({ ...demo, name: '<script>& "Nome"</script>', email: "a".repeat(240) + "@example.com" });
  const metadata = await sharp(png).metadata();
  assert.equal(metadata.format, "png");
  assert.equal(metadata.width, 920);
  assert.ok((metadata.height ?? 0) > 300);
});


test("Free PNG wraps long wide names instead of clipping", async () => {
  const base = { ...toEssential(demo), role: "", company: "", phone: "", email: "", address: "", cnpj: "", professionalRegistrationType: undefined, professionalRegistration: "", legalNotice: "", whatsapp: "" };
  const short = await sharp(await freeSignaturePng({ ...base, name: "Ana" })).metadata();
  const metadata = await sharp(await freeSignaturePng({ ...base, name: "W".repeat(100) })).metadata();
  assert.equal(metadata.width, 920);
  assert.ok((metadata.height ?? 0) > (short.height ?? 0) + 100);
});


test("Free HTML keeps contact links and branding without unlocking premium customization", () => {
  const prepared = prepareSignature({ ...demo, template: "essential", phone: "+55 11 99999-0000", color: "#ff0000", logo: "https://res.cloudinary.com/example/logo.png" }, { pro: false, owned: [] });
  assert.ok(prepared);
  const html = renderSignature(prepared.data, prepared.premium);
  assert.match(html, /mailto:/);
  assert.match(html, /tel:/);
  assert.match(html, /https:\/\/wa.me\//);
  assert.match(html, /Criado com Maily/);
  assert.doesNotMatch(html, /#ff0000|logo.png|instagram.com/);
});
