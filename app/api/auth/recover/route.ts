import { credentialsSchema } from "@/lib/auth";
import { requestRecovery } from "@/lib/auth/recovery";
import { sameOrigin, failure } from "@/lib/utils/http";
export async function POST(request: Request) {
  if (!sameOrigin(request)) return failure("Origem inválida.", 403);
  const raw = await request.text(); if (raw.length > 2000) return failure("Dados inválidos.", 400);
  let body: unknown; try { body = JSON.parse(raw); } catch { return failure("Dados inválidos.", 400); }
  const parsed = credentialsSchema.pick({ email: true }).safeParse(body);
  if (!parsed.success) return failure("Informe um e-mail válido.", 400);
  try {
    await requestRecovery(parsed.data.email, process.env.VERCEL ? request.headers.get("x-vercel-forwarded-for") ?? "unknown" : "local");
  } catch { console.error("recovery.request_failed"); }
  // Same response for unknown accounts, throttling and transport failure.
  return Response.json({ ok: true, message: "Se houver uma conta com senha para este e-mail, você receberá um link. Para contas Google, use Entrar com Google. Se não receber, aguarde e tente novamente ou contate o suporte." });
}
