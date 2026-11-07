import { redirect } from "next/navigation";
import { db } from "@/lib/prisma";
import { workspaceSchema } from "@/lib/workspace";
import { getTranslator } from "@/lib/i18n/server";
import { SignatureBuilder } from "@/components/signature/SignatureBuilder";
import { currentAccount } from "@/lib/auth";
import { signatureAccess } from "@/lib/prisma/signatures";
export async function generateMetadata() {
  const t = await getTranslator();
  return { title: t("Gerador") };
}
export default async function Generator() {
  const t = await getTranslator();
  const account = await currentAccount();
  const userId = account?.emailVerified ? account.id : undefined;
  if (userId) {
    const [user, count] = await Promise.all([db.user.findUnique({ where: { id: userId }, select: { workspace: true } }), db.signature.count({ where: { userId } })]);
    const workspace = workspaceSchema.safeParse(user?.workspace);
    if (!count && !(workspace.success && workspace.data.completed)) redirect("/dashboard");
  }
  return <div className="shell py-10">
    <p className="eyebrow">{t("Editor de assinaturas")}</p><h1 className="my-3 text-4xl font-bold tracking-tight">{t("Crie sua assinatura")}</h1>
    <p className="mb-7 text-slate-600">{t("Adicione seus dados, escolha um template e confira a prévia.")}</p>
    <SignatureBuilder signedIn={!!userId} needsVerification={!!account && !account.emailVerified} {...(userId ? await signatureAccess(userId) : {})} />
  </div>;
}
