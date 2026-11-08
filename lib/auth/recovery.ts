import { createHash, randomBytes, randomUUID } from "node:crypto";
import { hash } from "bcryptjs";
import { db } from "@/lib/prisma";
import { lockUser } from "@/lib/prisma/signatures";
import { sendTransactionalEmail } from "@/lib/email/send";
export const recoveryHash = (value: string) => createHash("sha256").update(value).digest("hex");
export async function requestRecovery(email: string, ip: string) {
  if (!process.env.RESEND_API_KEY || !process.env.VERIFICATION_FROM_EMAIL || !process.env.NEXTAUTH_URL) throw new Error("Recovery unavailable");
  const token = randomBytes(32).toString("hex");
  const user = await db.$transaction(async tx => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext('maily-recovery-rate-limit'))`;
    const now = new Date();
    await tx.verificationToken.deleteMany({ where: { identifier: { startsWith: "recover-rate:" }, expires: { lte: now } } });
    const ipKey = `recover-rate:ip:${recoveryHash(ip)}`, emailKey = `recover-rate:email:${recoveryHash(email)}`;
    const [ipCount, emailCount] = await Promise.all([
      tx.verificationToken.count({ where: { identifier: ipKey, expires: { gt: now } } }),
      tx.verificationToken.count({ where: { identifier: emailKey, expires: { gt: now } } }),
    ]);
    if (ipCount >= 10 || emailCount >= 3) return null;
    for (const identifier of [ipKey, emailKey]) await tx.verificationToken.create({ data: { identifier, token: randomUUID(), expires: new Date(Date.now() + 3600000) } });
    const account = await tx.user.findUnique({ where: { email }, select: { id: true, email: true, passwordHash: true } });
    if (!account?.passwordHash) return null;
    await lockUser(tx, account.id);
    await tx.verificationToken.deleteMany({ where: { identifier: `recover:${account.id}` } });
    await tx.verificationToken.create({ data: { identifier: `recover:${account.id}`, token: recoveryHash(token), expires: new Date(Date.now() + 30 * 60000) } });
    return account;
  });
  if (!user) return;
  const url = new URL("/redefinir-senha", process.env.NEXTAUTH_URL);
  // A fragment never reaches the server, access logs or HTTP referrers.
  url.hash = token;
  await sendTransactionalEmail({ to: user.email, key: `recovery-${recoveryHash(token)}`, subject: "Redefina sua senha na Maily", text: `Recebemos um pedido para redefinir sua senha. O link vale por 30 minutos e pode ser usado uma vez:\n\n${url.href}\n\nSe não foi você, ignore esta mensagem. Sua senha permanece igual.` });
}
export async function resetPassword(token: string, password: string) {
  const digest = recoveryHash(token);
  const saved = await db.verificationToken.findUnique({ where: { token: digest } });
  if (!saved || !saved.identifier.startsWith("recover:") || saved.expires <= new Date()) return false;
  const userId = saved.identifier.slice("recover:".length);
  const passwordHash = await hash(password, 12);
  return db.$transaction(async tx => {
    await lockUser(tx, userId);
    const consumed = await tx.verificationToken.deleteMany({ where: { token: digest, identifier: `recover:${userId}`, expires: { gt: new Date() } } });
    if (!consumed.count) return false;
    await tx.user.update({ where: { id: userId }, data: { passwordHash, authVersion: { increment: 1 } } });
    await tx.session.deleteMany({ where: { userId } });
    return true;
  });
}
