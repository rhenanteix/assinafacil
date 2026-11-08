import { canAssignFolder } from "@/lib/signature/folders";
import { prepareSignature } from "@/lib/signature/access";
import { verifiedUserId } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { captureServerEvent } from "@/lib/posthog-server";
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
  const result = await db.$transaction(async tx => {
    await lockUser(tx, userId);
    const access = await signatureAccess(userId, tx);
    if (!await canAssignFolder(tx, userId, parsed.data.folderId, access.business)) return failure("Área indisponível para esta conta.", 403);
    const signature = prepareSignature(parsed.data, access);
    if (!signature) return failure("Este template precisa ser desbloqueado.", 403);
    const updated = await tx.signature.updateMany({ where: { id, userId }, data: { data: signature.data } });
    return updated.count ? true : failure("Assinatura não encontrada.", 404);
  });
  if (result instanceof Response) return result;
  await captureServerEvent({ distinctId: userId, event: "signature_updated" });
  return Response.json({ id });
}
export async function DELETE(request: Request, { params }: Context) {
  if (!sameOrigin(request)) return failure("Origem inválida.", 403);
  const userId = await verifiedUserId();
  if (!userId) return failure("Entre com um e-mail confirmado para continuar.", 401);
  const { id } = await params;
  const result = await db.signature.deleteMany({ where: { id, userId } });
  if (!result.count) return failure("Assinatura não encontrada.", 404);
  await captureServerEvent({ distinctId: userId, event: "signature_deleted" });
  return Response.json({ ok: true });
}
