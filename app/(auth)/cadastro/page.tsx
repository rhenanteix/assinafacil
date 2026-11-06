import { authDestination } from "@/lib/auth/destination";
import { AuthForm } from "@/components/shared/AuthForm";
import { googleEnabled } from "@/lib/auth";
export const metadata = { title: "cadastro" };
export default async function AuthPage({ searchParams }: { searchParams: Promise<{ destino?: string; error?: string }> }) {
  const params = await searchParams;
  return <>{params.error && <p role="alert" className="shell pt-4 text-red-700">O login com Google não foi concluído. Confira seu método de acesso e tente novamente.</p>}
    <AuthForm register={true} google={googleEnabled} destination={authDestination(params.destino)} /></>;
}
