import { writeFileSync } from "node:fs";
import { demo, templates } from "@/types/signature";
import { renderSignature } from "@/lib/utils/signature";
import { freeSignaturePng } from "@/lib/signature/free-png";

async function generate() {
  for (const template of templates) {
    if (template.id === "essential") {
      writeFileSync(new URL("./essential.png", import.meta.url), await freeSignaturePng(demo));
      continue;
    }
    const signature = renderSignature({ ...demo, template: template.id, instagram: "https://instagram.com/example", facebook: "https://facebook.com/example", linkedin: "https://linkedin.com/in/example" }, true);
    writeFileSync(new URL(`./${template.id}.html`, import.meta.url), `<!doctype html>
<html lang="pt-BR"><meta charset="utf-8"><title>${template.label} · AssinaFácil</title>
<body>${signature}</body></html>\n`);
  }
}
void generate();
