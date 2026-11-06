import { redirect } from "next/navigation";
import { currentAccount } from "@/lib/auth";
import { authDestination } from "@/lib/auth/destination";
import { VerifyEmail } from "@/components/shared/VerifyEmail";

export const metadata = { title: "Confirmar e-mail", robots: { index: false, follow: false }, referrer: "no-referrer" as const };
export default async function Verification({ searchParams }: { searchParams: Promise<{ token?: string; destino?: string }> }) {
  const { token, destino } = await searchParams;
  const destination = authDestination(destino);
  const account = await currentAccount();
  if (account?.emailVerified && !token) redirect("/" + destination);
  return <div className="shell py-14"><section className="panel mx-auto max-w-lg space-y-4">
    <h1 className="text-3xl font-bold">Confirme seu e-mail</h1>
    <p className="text-slate-700">{token ? "Confirme seu e-mail para liberar o acesso à sua assinatura." : "Use o link que enviamos para seu e-mail. Você também pode solicitar outro link abaixo."}</p>
    <VerifyEmail token={token} signedIn={!!account} destination={destination} />
  </section></div>;
}
