import { Prisma } from "@prisma/client";
import { hash } from "bcryptjs";
import { z } from "zod";
import { credentialsSchema } from "@/lib/auth";
import { authDestination } from "@/lib/auth/destination";
import { sendVerification } from "@/lib/auth/verification";
import { db } from "@/lib/prisma";
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
    return Response.json({ ok: true, verificationSent }, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") return failure("Já existe uma conta com este e-mail.", 409);
    return failure("Cadastro indisponível no momento.", 503);
  }
}
