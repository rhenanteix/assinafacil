import { getTranslator } from "@/lib/i18n/server";
import { authDestination } from "@/lib/auth/destination";
import { AuthForm } from "@/components/shared/AuthForm";
import { SignupPreview } from "@/components/shared/SignupPreview";
import { googleEnabled } from "@/lib/auth";
import { professionPacksEnabled } from "@/lib/feature-flags";
export async function generateMetadata() {
  const t = await getTranslator();
  return { title: t("cadastro") };
}
export default async function AuthPage({ searchParams }: { searchParams: Promise<{ destino?: string; error?: string }> }) {
  const t = await getTranslator();
  const params = await searchParams;
  const dest = authDestination(params.destino);
  const showPreview = professionPacksEnabled() && dest === "gerador";
  return <div className="shell py-10">{params.error && <p role="alert" className="mb-4 text-red-700">{t("O login com Google não foi concluído. Confira seu método de acesso e tente novamente.")}</p>}
    {showPreview ? <div className="mx-auto grid max-w-5xl items-start gap-6 lg:grid-cols-[minmax(0,420px)_1fr]"><div className="panel"><AuthForm register={true} google={googleEnabled} destination={dest} embedded /></div><SignupPreview /></div>
      : <AuthForm register={true} google={googleEnabled} destination={dest} />}
  </div>;
}
