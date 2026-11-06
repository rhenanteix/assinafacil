import { mkdirSync, copyFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { createRequire } from "node:module";
import sharp from "sharp";
import {
  faInstagram, faFacebook, faLinkedin, faWhatsapp, faYoutube, faTiktok, faXTwitter, faGithub,
} from "@fortawesome/free-brands-svg-icons";

const icons = [
  ["instagram", faInstagram, "#C13584"], ["facebook", faFacebook, "#0866FF"],
  ["linkedin", faLinkedin, "#0A66C2"], ["whatsapp", faWhatsapp, "#087E50"],
  ["youtube", faYoutube, "#D10000"], ["tiktok", faTiktok, "#151515"],
  ["x", faXTwitter, "#151515"], ["github", faGithub, "#24292F"],
];
mkdirSync("public/social", { recursive: true });
for (const [name, definition, color] of icons) {
  const [width, height, , , path] = definition.icon;
  const paths = (Array.isArray(path) ? path : [path]).map(d => `<path fill="${color}" d="${d}"/>`).join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 ${width} ${height}">${paths}</svg>`;
  const png = await sharp(Buffer.from(svg)).resize(64, 64, { fit: "contain", background: "#ffffff" }).png().toBuffer();
  writeFileSync(`public/social/${name}.png`, png);
}
const require = createRequire(import.meta.url);
copyFileSync(join(dirname(require.resolve("@fortawesome/free-brands-svg-icons")), "LICENSE.txt"), "public/social/LICENSE.txt");
