import { Prisma } from "@prisma/client";
import { hash } from "bcryptjs";
import { z } from "zod";
import { credentialsSchema } from "@/lib/auth";
import { authDestination } from "@/lib/auth/destination";
import { sendVerification } from "@/lib/auth/verification";
import { db } from "@/lib/prisma";
import { captureServerEvent } from "@/lib/posthog-server";
import { failure, sameOrigin } from "@/lib/utils/http";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return failure("Origem inválida.", 403);
  const body = await request.json().catch(() => null);
  const parsed = credentialsSchema.extend({ name: z.string().trim().min(2).max(100) }).safeParse(body);
  if (!parsed.success) return failure("Confira nome, e-mail e senha. Use entre 8 caracteres e 72 bytes na senha.", 400);
  const { name, email, password } = parsed.data;
  try {
    const user = await db.user.create({ data: { name, email, passwordHash: await hash(password, 12) }, select: { id: true, email: true } });
    const verificationSent = await sendVerification(user, authDestination(body?.destination)).catch(() => false);
    await captureServerEvent({
      distinctId: user.id,
      event: "account_registered",
      properties: { verification_sent: verificationSent },
    });
    return Response.json({ ok: true, verificationSent }, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") return failure("Já existe uma conta com este e-mail.", 409);
    // Do not log the raw Prisma error: it may include input data or connection details.
    const code = error instanceof Prisma.PrismaClientKnownRequestError ? error.code
      : error instanceof Prisma.PrismaClientInitializationError ? error.errorCode : undefined;
    console.error("[register] creation_failed", {
      code: code ?? "UNKNOWN",
      reason: code === "P2021" || code === "P2022" ? "database_schema_outdated"
        : code === "P1000" ? "database_authentication"
        : code === "P1001" || code === "P1002" || code === "P2024" ? "database_connection"
        : "database_or_server_error",
    });
    return failure("Cadastro indisponível no momento.", 503);
  }
}
