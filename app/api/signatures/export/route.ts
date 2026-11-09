import { getLocale } from "@/lib/i18n/server";
import { z } from "zod";
import { verifiedUserId } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { captureServerEvent } from "@/lib/posthog-server";
import { lockUser, signatureAccess } from "@/lib/prisma/signatures";
import { prepareSignature } from "@/lib/signature/access";
import { freeSignaturePng } from "@/lib/signature/free-png";
import { renderSignature } from "@/lib/utils/signature";
import { failure, sameOrigin } from "@/lib/utils/http";
import { signatureSchema } from "@/types/signature";

const exportSchema = z.object({
  id: z.string().min(1).max(64).optional(),
  format: z.enum(["png", "html"]),
  data: signatureSchema,
});
const privateHeaders = { "Cache-Control": "no-store" };

export async function POST(request: Request) {
  if (!sameOrigin(request)) return failure("Origem inválida.", 403);
  const userId = await verifiedUserId();
  if (!userId) return failure("Entre com um e-mail confirmado para exportar.", 401);
  const parsed = exportSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return failure("Dados da assinatura inválidos.", 400);
  const { id, format, data } = parsed.data;
  const signature = prepareSignature(data, await signatureAccess(userId));
  if (!signature) return failure("Desbloqueie este modelo para exportar.", 403);

  if (format === "html") {
    if (!signature.premium) {
      await db.user.updateMany({ where: { id: userId, firstFreeExportAt: null }, data: { firstFreeExportAt: new Date() } });
    }
    await captureServerEvent({
      distinctId: userId,
      event: "signature_exported",
      properties: { format, premium: signature.premium, uses_blocos: Boolean(signature.data.templateBlocos || signature.data.blocos), template_blocos_id: signature.data.templateBlocos ?? null },
    });
    return Response.json({ html: renderSignature(signature.data, signature.premium, await getLocale(), new URL(request.url).origin) }, { headers: privateHeaders });
  }
  if (signature.premium) return failure("Use a opção de PNG no editor premium.", 400);

  const png = await freeSignaturePng(signature.data, await getLocale());
  const result = await db.$transaction(async tx => {
    await lockUser(tx, userId);
    const signatures = await tx.signature.findMany({
      where: { userId }, select: { id: true }, orderBy: { updatedAt: "desc" }, take: 1,
    });
    if (id) {
      const updated = await tx.signature.updateMany({ where: { id, userId }, data: { data: signature.data } });
      if (!updated.count) return failure("Assinatura não encontrada.", 404);
    } else if (signatures.length) {
      return failure("Você já tem uma assinatura salva. Abra-a em Minha conta para editar e baixar.", 409);
    }
    const savedId = id ?? (await tx.signature.create({ data: { userId, data: signature.data } })).id;
    await tx.user.updateMany({ where: { id: userId, firstFreeExportAt: null }, data: { firstFreeExportAt: new Date() } });
    return savedId;
  });
  if (result instanceof Response) return result;
  await captureServerEvent({
    distinctId: userId,
    event: "signature_exported",
    properties: { format, premium: signature.premium, uses_blocos: Boolean(signature.data.templateBlocos || signature.data.blocos), template_blocos_id: signature.data.templateBlocos ?? null },
  });
  return new Response(new Uint8Array(png), {
    headers: { ...privateHeaders, "Content-Type": "image/png", "Content-Disposition": 'attachment; filename="assinatura.png"', "X-Signature-Id": result },
  });
}
