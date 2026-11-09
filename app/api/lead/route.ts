import { z } from "zod";
import { verifiedUserId } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { captureServerEvent } from "@/lib/posthog-server";
import { failure, sameOrigin } from "@/lib/utils/http";

// Qualificação opcional (tamanho da empresa). Associada somente após cadastro/aceite + e-mail verificado.
export async function POST(request: Request) {
  if (!sameOrigin(request)) return failure("Origem inválida.", 403);
  const userId = await verifiedUserId();
  if (!userId) return failure("Entre para continuar.", 401);
  const parsed = z.object({ companySize: z.enum(["solo", "2-10", "11-50", "51+"]) }).safeParse(await request.json().catch(() => null));
  if (!parsed.success) return failure("Dados inválidos.", 400);
  const user = await db.user.findUnique({ where: { id: userId }, select: { workspace: true } });
  const current = user?.workspace && typeof user.workspace === "object" && !Array.isArray(user.workspace) ? user.workspace as Record<string, unknown> : {};
  await db.user.update({ where: { id: userId }, data: { workspace: { ...current, companySize: parsed.data.companySize } } });
  await captureServerEvent({ distinctId: userId, event: "company_size_informed", properties: { company_size: parsed.data.companySize } });
  return Response.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
}
