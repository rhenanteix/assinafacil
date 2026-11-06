import { createHash, randomBytes } from "node:crypto";
import { db } from "@/lib/prisma";
import { lockUser } from "@/lib/prisma/signatures";

const lifetime = 24 * 60 * 60 * 1000;
export const tokenHash = (token: string) => createHash("sha256").update(token).digest("hex");

export async function sendVerification(user: { id: string; email: string }, destination: string) {
  const { RESEND_API_KEY, VERIFICATION_FROM_EMAIL, NEXTAUTH_URL } = process.env;
  if (!RESEND_API_KEY || !VERIFICATION_FROM_EMAIL || !NEXTAUTH_URL) throw new Error("Envio indisponível.");
  const token = randomBytes(32).toString("hex");
  const hash = tokenHash(token);
  const identifier = "verify:" + user.id;
  const link = new URL("/verificar-email", NEXTAUTH_URL);
  link.searchParams.set("token", token);
  link.searchParams.set("destino", destination);

  const created = await db.$transaction(async tx => {
    await lockUser(tx, user.id);
    const account = await tx.user.findUnique({ where: { id: user.id }, select: { emailVerified: true } });
    if (!account || account.emailVerified) return false;
    const now = Date.now();
    const recent = await tx.verificationToken.findFirst({ where: { identifier, expires: { gt: new Date(now + lifetime - 60000) } } });
    if (recent) return false;
    await tx.verificationToken.deleteMany({ where: { identifier, expires: { lte: new Date(now) } } });
    await tx.verificationToken.create({ data: { identifier, token: hash, expires: new Date(now + lifetime) } });
    return true;
  });
  if (!created) return false;
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      signal: AbortSignal.timeout(8000),
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json", "Idempotency-Key": hash },
      body: JSON.stringify({
        from: VERIFICATION_FROM_EMAIL, to: [user.email], subject: "Confirme seu e-mail no AssinaFácil",
        text: `Confirme seu e-mail no AssinaFácil em até 24 horas:\n\n${link.href}`,
      }),
    });
    if (!response.ok) throw new Error("Falha no envio.");
    return true;
  } catch (error) {
    await db.verificationToken.deleteMany({ where: { token: hash } });
    throw error;
  }
}
