import { createHash, randomUUID } from "node:crypto";
import { z } from "zod";
import { db } from "@/lib/prisma";
import { businessInput, businessEmail } from "@/lib/business";
import { failure, sameOrigin } from "@/lib/utils/http";
export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return failure("Origem inválida.", 403);
  if (Number(request.headers.get("content-length")) > 8000) return failure("Mensagem muito grande.", 413);
  const raw = await request.text();
  if (raw.length > 8000) return failure("Mensagem muito grande.", 413);
  let body: unknown;
  try { body = JSON.parse(raw); } catch { return failure("Confira os campos indicados.", 400); }
  const parsed = businessInput.safeParse(body);
  if (!parsed.success) return failure("Confira os campos indicados.", 400);
  const { RESEND_API_KEY: key, VERIFICATION_FROM_EMAIL: from, BUSINESS_CONTACT_EMAIL: to } = process.env;
  if (!key || !from || !z.string().email().safeParse(to).success) return failure("Contato comercial indisponível no momento.", 503);
  const ip = process.env.VERCEL ? request.headers.get("x-vercel-forwarded-for") ?? "unknown" : "local";
  const digest = (value: string) => createHash("sha256").update(value).digest("hex");
  const identifiers = [`business:ip:${digest(ip)}`, `business:email:${digest(parsed.data.email.toLowerCase())}`];
  try {
    // Database-backed throttling works across serverless instances; no raw IP is stored.
    const allowed = await db.$transaction(async tx => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext('maily-business-rate-limit'))`;
      const now = new Date();
      await tx.verificationToken.deleteMany({ where: { identifier: { startsWith: "business:" }, expires: { lte: now } } });
      const recent = await tx.verificationToken.count({ where: { identifier: { in: identifiers }, expires: { gt: new Date(Date.now() + 59 * 60000) } } });
      const total = await tx.verificationToken.count({ where: { identifier: { startsWith: "business:email:" }, expires: { gt: now } } });
      if (recent || total >= 30) return false;
      for (const identifier of identifiers) await tx.verificationToken.create({ data: { identifier, token: randomUUID(), expires: new Date(Date.now() + 3600000) } });
      return true;
    });
    if (!allowed) return failure("Aguarde alguns minutos antes de enviar outra solicitação.", 429);
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST", signal: AbortSignal.timeout(20000),
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json", "Idempotency-Key": randomUUID() },
      body: JSON.stringify({ from, to: [to], reply_to: parsed.data.email, subject: "Maily Business — solicitação de orçamento", text: businessEmail(parsed.data) }),
    });
    const result = await response.json().catch(() => null);
    if (!response.ok || !result?.id) {
      console.error("business.send_failed", { status: response.status });
      return failure("Não foi possível enviar. Tente novamente mais tarde.", 502);
    }
    return Response.json({ ok: true }, { status: 201 });
  } catch {
    console.error("business.send_failed", { reason: "database_or_network" });
    return failure("Não foi possível confirmar o envio. Aguarde antes de tentar novamente.", 503);
  }
}
