import { getLocale } from "@/lib/i18n/server";
import { renderSignature } from "@/lib/utils/signature";
import { failure, sameOrigin } from "@/lib/utils/http";
import { signatureSchema } from "@/types/signature";

// Prévia pública (same-origin, sem persistência) para o fluxo sem conta.
// Renderiza aparência visual; exportação/salvamento continuam protegidos pelas rotas autenticadas.
export async function POST(request: Request) {
  if (!sameOrigin(request)) return failure("Origem inválida.", 403);
  const raw = await request.text();
  if (raw.length > 8192) return failure("Prévia muito grande.", 413);
  let body: unknown;
  try { body = JSON.parse(raw); } catch { return failure("Dados inválidos.", 400); }
  const parsed = signatureSchema.safeParse(body);
  if (!parsed.success) return failure("Dados inválidos.", 400);
  return Response.json(
    { html: renderSignature(parsed.data, true, await getLocale(), new URL(request.url).origin) },
    { headers: { "Cache-Control": "no-store" } },
  );
}
