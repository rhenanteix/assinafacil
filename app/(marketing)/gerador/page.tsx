import { redirect } from "next/navigation";
import { db } from "@/lib/prisma";
import { workspaceSchema } from "@/lib/workspace";
import { getTranslator } from "@/lib/i18n/server";
import { SignatureBuilder } from "@/components/signature/SignatureBuilder";
import { ProfessionSignatureBuilder } from "@/components/signature/ProfessionSignatureBuilder";
import { currentAccount } from "@/lib/auth";
import { signatureAccess } from "@/lib/prisma/signatures";
import { professionPacksEnabled } from "@/lib/feature-flags";
import { getProfessionBySlug } from "@/lib/professions";

export async function generateMetadata() {
  const t = await getTranslator();
  return { title: t("Gerador") };
}
export default async function Generator({ searchParams }: { searchParams: Promise<{ profissao?: string }> }) {
  const t = await getTranslator();
  const account = await currentAccount();
  const userId = account?.emailVerified ? account.id : undefined;
  const enabled = professionPacksEnabled();
  if (userId) {
    const [user, count] = await Promise.all([db.user.findUnique({ where: { id: userId }, select: { workspace: true } }), db.signature.count({ where: { userId } })]);
    const workspace = workspaceSchema.safeParse(user?.workspace);
    if (!count && !(workspace.success && workspace.data.completed) && !enabled) redirect("/dashboard");
  }
  const params = await searchParams;
  const profession = enabled && params.profissao ? getProfessionBySlug(params.profissao) : undefined;
  return <div className="shell py-10">
    <p className="eyebrow">{t("Editor de assinaturas")}</p><h1 className="my-3 text-4xl font-bold tracking-tight">{t("Crie sua assinatura")}</h1>
    <p className="mb-7 text-slate-600">{t("Adicione seus dados, escolha um template e confira a prévia.")}</p>
    {enabled
      ? <ProfessionSignatureBuilder signedIn={!!userId} needsVerification={!!account && !account.emailVerified} initialProfession={profession?.id} {...(userId ? await signatureAccess(userId) : {})} />
      : <SignatureBuilder signedIn={!!userId} needsVerification={!!account && !account.emailVerified} {...(userId ? await signatureAccess(userId) : {})} />}
  </div>;
}

