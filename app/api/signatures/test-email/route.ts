import { z } from "zod";
import { verifiedUserId } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { renderSignatureText } from "@/lib/utils/signature";
import { prepareSignature } from "@/lib/signature/access";
import { signatureAccess } from "@/lib/prisma/signatures";
import { failure, sameOrigin } from "@/lib/utils/http";
import { signatureSchema } from "@/types/signature";
import { sendTransactionalEmail } from "@/lib/email/send";
import { getLocale } from "@/lib/i18n/server";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return failure("Origem inválida.", 403);
  const userId = await verifiedUserId();
  if (!userId) return failure("Entre para continuar.", 401);
  const parsed = z.object({ email: z.string().email().max(254), signatureId: z.string().min(1).max(64).optional() }).safeParse(await request.json().catch(() => null));
  if (!parsed.success) return failure("Informe um e-mail válido.", 400);
  const sig = parsed.data.signatureId
    ? await db.signature.findFirst({ where: { id: parsed.data.signatureId, userId } })
    : await db.signature.findFirst({ where: { userId }, orderBy: { updatedAt: "desc" } });
  if (!sig) return failure("Assinatura não encontrada.", 404);
  const data = signatureSchema.safeParse(sig.data);
  if (!data.success) return failure("Assinatura inválida.", 400);
  const prepared = prepareSignature(data.data, await signatureAccess(userId));
  if (!prepared) return failure("Modelo indisponível.", 403);
  const text = renderSignatureText(prepared.data, prepared.premium, await getLocale());
  try {
    await sendTransactionalEmail({ to: parsed.data.email, subject: "Teste de assinatura - Maily", text, key: `sig-test:${userId}:${sig.id}:${parsed.data.email}` });
    return Response.json({ ok: true, message: "E-mail de teste enviado." });
  } catch {
    // TODO funcional depende de RESEND_API_KEY/VERIFICATION_FROM_EMAIL configurados.
    return Response.json({ ok: false, message: "Envio de teste indisponível no momento (e-mail transacional não configurado). Copie o HTML e faça um envio manual." });
  }
}
