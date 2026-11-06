import { writeFileSync } from "node:fs";
import { demoDemos, templates } from "@/types/signature";
import { renderSignature } from "@/lib/utils/signature";
import { freeSignaturePng } from "@/lib/signature/free-png";

async function generate() {
  for (const template of templates) {
    const data = demoDemos[template.id as keyof typeof demoDemos];
    if (template.id === "essential") {
      writeFileSync(new URL("./essential.png", import.meta.url), await freeSignaturePng(data));

    }
    const signature = renderSignature({ ...data, template: template.id }, template.pro, "pt-BR", "../public").split("\n").map(line => line.trimEnd()).join("\n");
    writeFileSync(new URL(`./${template.id}.html`, import.meta.url), `<!doctype html>
<html lang="pt-BR"><meta charset="utf-8"><title>${template.label} · Maily</title>
<body>${signature}</body></html>\n`);
  }
}
void generate();
