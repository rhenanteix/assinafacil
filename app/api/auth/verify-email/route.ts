import { tokenHash } from "@/lib/auth/verification";
import { db } from "@/lib/prisma";
import { lockUser } from "@/lib/prisma/signatures";
import { failure, sameOrigin } from "@/lib/utils/http";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return failure("Origem inválida.", 403);
  const token = (await request.json().catch(() => null))?.token;
  if (typeof token !== "string" || !/^[a-f0-9]{64}$/.test(token)) return failure("Link inválido.", 400);
  const hash = tokenHash(token);
  const found = await db.verificationToken.findUnique({ where: { token: hash } });
  if (!found?.identifier.startsWith("verify:")) return failure("Link inválido ou expirado. Solicite outro.", 400);
  const id = found.identifier.slice("verify:".length);
  const verified = await db.$transaction(async tx => {
    await lockUser(tx, id);
    const result = await tx.verificationToken.deleteMany({ where: { token: hash, expires: { gt: new Date() } } });
    if (!result.count) return false;
    await tx.user.update({ where: { id }, data: { emailVerified: new Date() } });
    await tx.verificationToken.deleteMany({ where: { identifier: found.identifier } });
    return true;
  });
  return verified ? Response.json({ ok: true }) : failure("Link inválido ou expirado. Solicite outro.", 400);
}
