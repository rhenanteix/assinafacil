import { translator, type Locale } from "@/lib/i18n/shared";
import { join } from "node:path";
import type { z } from "zod";
import type { basicSignatureSchema } from "@/types/signature";

function escapeText(text: string) {
  return text.replace(/[\u0000-\u001f\ufffe\uffff]/g, " ").replace(/[&<>"']/g, char =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[char] ?? char);
}

export async function freeSignaturePng(data: z.infer<typeof basicSignatureSchema>, locale: Locale = "pt-BR") {
  // Serverless Linux runtimes may not ship /etc/fonts/fonts.conf.
  // Set our bundled configuration before loading the native renderer.
  process.env.FONTCONFIG_FILE ??= join(process.cwd(), "assets", "fonts", "fonts.conf");
  const { default: sharp } = await import("sharp");
  const t = translator(locale);
  const width = 920;
  const lines = [
    { text: data.name, color: "#17152b", font: "DejaVu Sans Bold 46", gap: 14 },
    { text: data.role, color: "#344054", font: "DejaVu Sans 30", gap: 10 },
    { text: data.company, color: "#344054", font: "DejaVu Sans 30", gap: 10 },
    { text: data.phone, color: "#344054", font: "DejaVu Sans 28", gap: 10 },
    { text: data.email, color: "#344054", font: "DejaVu Sans 28", gap: 28 },
    { text: data.whatsapp ? `WhatsApp: ${data.whatsapp}` : "", color: "#344054", font: "DejaVu Sans 24", gap: 10 },
    { text: [data.professionalRegistrationType, data.professionalRegistration].filter(Boolean).join(" "), color: "#344054", font: "DejaVu Sans 24", gap: 10 },
    { text: data.cnpj ? `CNPJ: ${data.cnpj}` : "", color: "#344054", font: "DejaVu Sans 24", gap: 10 },
    { text: data.address, color: "#344054", font: "DejaVu Sans 24", gap: 10 },
    { text: data.legalNotice, color: "#526078", font: "DejaVu Sans 20", gap: 14 },
    { text: t("Criado com Maily"), color: "#526078", font: "DejaVu Sans 22", gap: 12 },
  ].filter(line => line.text);
  const rendered = await Promise.all(lines.map(async line => {
    const result = await sharp({
      text: {
        text: `<span foreground="${line.color}">${escapeText(line.text)}</span>`,
        font: line.font, fontfile: join(process.cwd(), "assets", "fonts", line.font.includes("Bold") ? "DejaVuSans-Bold.ttf" : "DejaVuSans.ttf"), width: 832, wrap: "word-char", rgba: true,
      },
    }).png().toBuffer({ resolveWithObject: true });
    return { ...result, gap: line.gap };
  }));
  let top = 34;
  const layers = rendered.map(line => {
    const layer = { input: line.data, left: 44, top };
    top += line.info.height + line.gap;
    return layer;
  });
  const height = top + 15;
  const frame = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><rect width="${width}" height="${height}" fill="white"/><rect width="8" height="${height}" fill="#5b45db"/></svg>`);
  return sharp(frame).composite(layers).png().toBuffer();
}
