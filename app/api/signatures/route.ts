import { prepareSignature } from "@/lib/signature/access";
import { verifiedUserId } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { captureServerEvent } from "@/lib/posthog-server";
import { lockUser, signatureAccess } from "@/lib/prisma/signatures";
import { failure, sameOrigin } from "@/lib/utils/http";
import { signatureSchema } from "@/types/signature";

export async function GET() {
  const userId = await verifiedUserId();
  if (!userId) return failure("Entre com um e-mail confirmado para continuar.", 401);
  return Response.json(await db.signature.findMany({ where: { userId }, orderBy: { updatedAt: "desc" } }));
}
export async function POST(request: Request) {
  if (!sameOrigin(request)) return failure("Origem inválida.", 403);
  const userId = await verifiedUserId();
  if (!userId) return failure("Entre com um e-mail confirmado para continuar.", 401);
  const parsed = signatureSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return failure("Dados da assinatura inválidos.", 400);
  const result = await db.$transaction(async tx => {
    await lockUser(tx, userId);
    const access = await signatureAccess(userId, tx);
    const signature = prepareSignature(parsed.data, access);
    if (!signature) return failure("Este template precisa ser desbloqueado.", 403);
    if (!access.pro) {
      if (await tx.signature.count({ where: { userId } })) return failure("O plano Free permite uma assinatura. Edite a existente ou ative o Pro.", 409);
    }
    return tx.signature.create({ data: { userId, data: signature.data }, select: { id: true } });
  });
  if (result instanceof Response) return result;
  await captureServerEvent({ distinctId: userId, event: "signature_created" });
  return Response.json(result, { status: 201 });
}
