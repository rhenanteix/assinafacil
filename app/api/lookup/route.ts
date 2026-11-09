import { captureServerEvent } from "@/lib/posthog-server";
import { consultarCEP, consultarCNPJ } from "@/lib/lookup";
import { failure, sameOrigin } from "@/lib/utils/http";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return failure("Origem inválida.", 403);
  const body = await request.json().catch(() => null);
  const { tipo, valor } = body ?? {};
  if (tipo !== "cnpj" && tipo !== "cep") return failure("Tipo inválido.", 400);
  if (typeof valor !== "string" || !valor.trim()) return failure("Informe o valor.", 400);

  try {
    let result: unknown = null;
    if (tipo === "cnpj") result = await consultarCNPJ(valor);
    else result = await consultarCEP(valor);

    // Evento analítico sem dados pessoais: apenas sucesso/falha do tipo de consulta.
    await captureServerEvent({
      distinctId: "anon",
      event: tipo === "cnpj" ? "cnpj_lookup" : "cep_lookup",
      properties: { ok: result !== null },
    }).catch(() => {});

    if (result === null) return failure("Não foi possível consultar. Tente novamente.", 422);
    return Response.json({ ok: true, data: result });
  } catch {
    return failure("Serviço indisponível no momento. Preencha manualmente.", 502);
  }
}
