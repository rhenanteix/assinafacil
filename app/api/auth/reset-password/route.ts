import { z } from "zod";
import { credentialsSchema } from "@/lib/auth";
import { resetPassword } from "@/lib/auth/recovery";
import { sameOrigin, failure } from "@/lib/utils/http";
export async function POST(request: Request) {
  if (!sameOrigin(request)) return failure("Origem inválida.", 403);
  const raw = await request.text(); if (raw.length > 2000) return failure("Dados inválidos.", 400);
  let body: unknown; try { body = JSON.parse(raw); } catch { return failure("Dados inválidos.", 400); }
  const parsed = z.object({ token: z.string().regex(/^[a-f0-9]{64}$/), password: credentialsSchema.shape.password }).safeParse(body);
  if (!parsed.success) return failure("Confira o link e use uma senha entre 8 caracteres e 72 bytes.", 400);
  try {
    if (!await resetPassword(parsed.data.token, parsed.data.password)) return failure("Link inválido, expirado ou já utilizado. Solicite outro.", 400);
    return Response.json({ ok: true });
  } catch { return failure("Não foi possível redefinir agora. Tente novamente.", 503); }
}
