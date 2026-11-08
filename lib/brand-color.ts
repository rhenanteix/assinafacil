/** Sample locally: transparent, near-white and near-black pixels do not define a brand. */
export async function extractBrandColor(file: File): Promise<string | null> {
  const bitmap = await createImageBitmap(file);
  try {
    const canvas = document.createElement("canvas"); canvas.width = 64; canvas.height = 64;
    const context = canvas.getContext("2d"); if (!context) return null;
    context.drawImage(bitmap, 0, 0, 64, 64);
    const pixels = context.getImageData(0, 0, 64, 64).data;
    const buckets = new Map<string, number>();
    for (let i = 0; i < pixels.length; i += 4) {
      const [r, g, b, a] = pixels.slice(i, i + 4);
      if (a < 160 || Math.max(r, g, b) < 35 || Math.min(r, g, b) > 225 || Math.max(r, g, b) - Math.min(r, g, b) < 25) continue;
      const hex = "#" + [r, g, b].map(v => Math.min(255, Math.round(v / 24) * 24).toString(16).padStart(2, "0")).join("");
      buckets.set(hex, (buckets.get(hex) ?? 0) + 1);
    }
    return [...buckets].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
  } finally { bitmap.close(); }
}
