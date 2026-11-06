import { getLocale } from "@/lib/i18n/server";
import { createHash, randomBytes } from "node:crypto";
import { db } from "@/lib/prisma";
import { lockUser } from "@/lib/prisma/signatures";

const lifetime = 24 * 60 * 60 * 1000;
export const tokenHash = (token: string) => createHash("sha256").update(token).digest("hex");

export async function sendVerification(user: { id: string; email: string }, destination: string) {
  const locale = await getLocale();
  const { RESEND_API_KEY, VERIFICATION_FROM_EMAIL, NEXTAUTH_URL } = process.env;
  if (!RESEND_API_KEY || !VERIFICATION_FROM_EMAIL || !NEXTAUTH_URL) {
    console.error("[verification] missing_configuration", {
      apiKey: !!RESEND_API_KEY, sender: !!VERIFICATION_FROM_EMAIL, baseUrl: !!NEXTAUTH_URL,
    });
    throw new Error("Envio indisponível.");
  }
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
  let rejected = false;
  const started = Date.now();
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      signal: AbortSignal.timeout(20000),
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json", "Idempotency-Key": hash },
      body: JSON.stringify({
        from: VERIFICATION_FROM_EMAIL, to: [user.email], subject: locale === "en" ? "Verify your email on Maily" : "Confirme seu e-mail no Maily",
        text: `${locale === "en" ? "Verify your email on Maily within 24 hours:" : "Confirme seu e-mail no Maily em até 24 horas:"}\n\n${link.href}`,
      }),
    });
    if (!response.ok) {
      rejected = response.status >= 400 && response.status < 500;
      const details = await response.json().catch(() => null);
      // Never log the provider body: it can contain recipient addresses.
      const message = typeof details?.message === "string" ? details.message : "";
      const reason = /domain.*not verified/i.test(message) ? "domain_not_verified"
        : /only send testing emails/i.test(message) ? "testing_restriction"
        : /API key.*(invalid|restricted|not active)|permission|scope/i.test(message) ? "api_key_permissions"
        : response.status === 429 ? "rate_limit" : "provider_rejection";
      console.error("[verification] resend_error", { status: response.status, reason, elapsedMs: Date.now() - started });
      throw new Error("Falha no envio.");
    }
    return true;
  } catch (error) {
    if (rejected) {
      await db.verificationToken.deleteMany({ where: { token: hash } });
    }
    // A timeout/network failure does not prove the email was rejected. Keep
    // its token valid in case it arrives; the existing cooldown limits retries.
    if (error instanceof Error && error.message !== "Falha no envio.") {
      console.error("[verification] transport_error", {
        reason: error.name === "TimeoutError" ? "timeout" : "network_error",
        elapsedMs: Date.now() - started,
      });
    }
    throw error;
  }
}
