import { mkdir, writeFile } from "node:fs/promises";
import { templates, demoDemos } from "../types/signature";
import { renderSignature } from "../lib/utils/signature";
async function main() {
  const directory = "docs/compatibilidade/fixtures";
  await mkdir(directory, { recursive: true });
  for (const template of templates) await writeFile(`${directory}/${template.id}.html`, renderSignature(demoDemos[template.id], template.pro));
  const clients = ["gmail-web", "outlook-classic-windows", "outlook-web", "apple-mail-macos", "gmail-android", "apple-mail-ios"];
  const rows = templates.flatMap(template => clients.flatMap(client => ["light", "dark"].map(mode => `${template.id},${client},${mode},pending,,,,`)));
  await writeFile("docs/compatibilidade/matriz.csv", "template,client,mode,status,app_version,os_version,tested_at,evidence\n" + rows.join("\n") + "\n");
  console.log(`${templates.length} HTML fixtures and ${rows.length} pending test cases generated. No email sent.`);
}
main().catch(() => { console.error("Unable to write fixtures"); process.exitCode = 1; });
