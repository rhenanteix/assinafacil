import { prepareSignature } from "@/lib/signature/access";
import { verifiedUserId } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { lockUser, signatureAccess } from "@/lib/prisma/signatures";
import { failure, sameOrigin } from "@/lib/utils/http";
import { signatureSchema } from "@/types/signature";
type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Context) {
  if (!sameOrigin(request)) return failure("Origem inválida.", 403);
  const userId = await verifiedUserId();
  if (!userId) return failure("Entre com um e-mail confirmado para continuar.", 401);
  const { id } = await params;
  const parsed = signatureSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return failure("Dados da assinatura inválidos.", 400);
  return db.$transaction(async tx => {
    await lockUser(tx, userId);
    const signature = prepareSignature(parsed.data, await signatureAccess(userId, tx));
    if (!signature) return failure("Este template precisa ser desbloqueado.", 403);
    const result = await tx.signature.updateMany({ where: { id, userId }, data: { data: signature.data } });
    return result.count ? Response.json({ id }) : failure("Assinatura não encontrada.", 404);
  });
}
export async function DELETE(request: Request, { params }: Context) {
  if (!sameOrigin(request)) return failure("Origem inválida.", 403);
  const userId = await verifiedUserId();
  if (!userId) return failure("Entre com um e-mail confirmado para continuar.", 401);
  const { id } = await params;
  const result = await db.signature.deleteMany({ where: { id, userId } });
  return result.count ? Response.json({ ok: true }) : failure("Assinatura não encontrada.", 404);
}
