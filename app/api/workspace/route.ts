import { verifiedUserId } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { lockUser, signatureAccess } from "@/lib/prisma/signatures";
import { failure, sameOrigin } from "@/lib/utils/http";
import { workspaceSchema } from "@/lib/workspace";
import { canUseTemplate } from "@/types/signature";
import { prepareSignature } from "@/lib/signature/access";
export async function PUT(request: Request) {
  if (!sameOrigin(request)) return failure("Origem inválida.", 403);
  const userId = await verifiedUserId();
  if (!userId) return failure("Entre para continuar.", 401);
  const raw = await request.text();
  if (raw.length > 64000) return failure("Dados muito grandes.", 413);
  let body: unknown; try { body = JSON.parse(raw); } catch { return failure("Dados inválidos.", 400); }
  const parsed = workspaceSchema.safeParse(body);
  if (!parsed.success) return failure("Confira os dados da assinatura.", 400);
  return db.$transaction(async tx => {
    await lockUser(tx, userId);
    const access = await signatureAccess(userId, tx);
    if (parsed.data.folders.length && !access.business) return failure("Pastas são exclusivas do Business.", 403);
    if (new Set(parsed.data.folders.map(f => f.id)).size !== parsed.data.folders.length) return failure("Pastas duplicadas.", 400);
    if (parsed.data.folders.some(f => !canUseTemplate(f.template, access.pro, access.owned))) return failure("Template indisponível.", 403);
    const prepared = prepareSignature(parsed.data.brand, access);
    if (!prepared) return failure("Template indisponível.", 403);
    await tx.user.update({ where: { id: userId }, data: { workspace: { ...parsed.data, brand: prepared.data } } });
    return Response.json({ ok: true });
  });
}
