import sharp from "sharp";

export async function prepareSignatureImage(bytes: Buffer, kind: "photo" | "logo") {
  const source = sharp(bytes, { limitInputPixels: 25_000_000 }).rotate();
  if (kind === "logo") return source.resize(256, 256, { fit: "contain", background: { r: 255, g: 255, b: 255, alpha: 0 } }).png().toBuffer();
  const square = await source.resize(256, 256, { fit: "cover", position: "centre" }).png().toBuffer();
  const mask = Buffer.from('<svg width="256" height="256"><circle cx="128" cy="128" r="128" fill="white"/></svg>');
  return sharp(square).composite([{ input: mask, blend: "dest-in" }]).png().toBuffer();
}
