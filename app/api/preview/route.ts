import { getLocale } from "@/lib/i18n/server";
import { freeSignaturePng } from "@/lib/signature/free-png";
import { basicSignatureSchema } from "@/types/signature";
import { failure, sameOrigin } from "@/lib/utils/http";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return failure("Origem inválida.", 403);
  const raw = await request.text();
  if (raw.length > 4096) return failure("Prévia muito grande.", 413);
  let data: unknown;
  try { data = JSON.parse(raw); } catch { return failure("Dados inválidos.", 400); }
  const parsed = basicSignatureSchema.safeParse(data);
  if (!parsed.success) return failure("Confira os dados da assinatura.", 400);
  const png = await freeSignaturePng(parsed.data, await getLocale());
  return new Response(new Uint8Array(png), { headers: { "Content-Type": "image/png", "Cache-Control": "no-store" } });
}
