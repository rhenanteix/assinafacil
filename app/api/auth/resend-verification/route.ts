import { currentAccount } from "@/lib/auth";
import { authDestination } from "@/lib/auth/destination";
import { sendVerification } from "@/lib/auth/verification";
import { captureServerEvent } from "@/lib/posthog-server";
import { failure, sameOrigin } from "@/lib/utils/http";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return failure("Origem inválida.", 403);
  const account = await currentAccount();
  if (!account) return failure("Entre para reenviar o e-mail.", 401);
  if (account.emailVerified) return failure("Seu e-mail já está confirmado.", 409);
  const body = await request.json().catch(() => null);
  try {
    if (!await sendVerification(account, authDestination(body?.destination))) return failure("Aguarde um minuto para pedir outro link.", 429);
    await captureServerEvent({ distinctId: account.id, event: "verification_email_resent" });
    return Response.json({ ok: true });
  } catch {
    return failure("O envio de confirmação está indisponível no momento.", 503);
  }
}
