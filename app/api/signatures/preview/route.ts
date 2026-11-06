import { getLocale } from "@/lib/i18n/server";
import { verifiedUserId } from "@/lib/auth";
import { signatureAccess } from "@/lib/prisma/signatures";
import { prepareSignature } from "@/lib/signature/access";
import { renderSignature } from "@/lib/utils/signature";
import { failure, sameOrigin } from "@/lib/utils/http";
import { signatureSchema } from "@/types/signature";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return failure("Origem inválida.", 403);
  const userId = await verifiedUserId();
  if (!userId) return failure("Entre com um e-mail confirmado.", 401);
  const parsed = signatureSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return failure("Dados inválidos.", 400);
  const signature = prepareSignature(parsed.data, await signatureAccess(userId));
  if (!signature?.premium) return failure("Este modelo exige acesso premium.", 403);
  return Response.json({ html: renderSignature(signature.data, true, await getLocale()) }, { headers: { "Cache-Control": "no-store" } });
}
