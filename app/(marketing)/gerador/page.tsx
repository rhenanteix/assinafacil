import { SignatureBuilder } from "@/components/signature/SignatureBuilder";
import { currentAccount } from "@/lib/auth";
import { signatureAccess } from "@/lib/prisma/signatures";
export const metadata = { title: "Gerador" };
export default async function Generator() {
  const account = await currentAccount();
  const userId = account?.emailVerified ? account.id : undefined;
  return <div className="shell py-10">
    <p className="eyebrow">Editor de assinaturas</p><h1 className="my-3 text-4xl font-bold tracking-tight">Crie sua assinatura</h1>
    <p className="mb-7 text-slate-600">Adicione seus dados, escolha um template e confira a prévia.</p>
    <SignatureBuilder signedIn={!!userId} needsVerification={!!account && !account.emailVerified} {...(userId ? await signatureAccess(userId) : {})} />
  </div>;
}
