import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { SignatureBuilder } from "@/components/signature/SignatureBuilder";
import { DeleteSignature, SignOutButton } from "@/components/shared/DashboardActions";
import { Button } from "@/components/ui/button";
import { currentAccount } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { signatureAccess } from "@/lib/prisma/signatures";
import { canUseTemplate, signatureSchema, toEssential } from "@/types/signature";
export const metadata = { title: "Minhas assinaturas", robots: { index: false } };
export default async function Dashboard({ searchParams }: { searchParams: Promise<{ editar?: string; pagamento?: string }> }) {
  const account = await currentAccount();
  if (!account) redirect("/login");
  if (!account.emailVerified) redirect("/verificar-email");
  const userId = account.id;
  const { editar, pagamento } = await searchParams;
  const [{ pro, owned }, rows] = await Promise.all([signatureAccess(userId), db.signature.findMany({ where: { userId }, orderBy: { updatedAt: "desc" } })]);
  const signatures = rows.flatMap(row => {
    const result = signatureSchema.safeParse(row.data);
    return result.success ? [{ id: row.id, data: result.data }] : [];
  });
  const selected = signatures.find(row => row.id === editar);
  if (editar && !selected) notFound();
  return <div className="shell py-10">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div><p className="eyebrow">Plano {pro ? "Pro" : "Free"}</p><h1 className="mt-2 text-4xl font-bold">Minhas assinaturas</h1></div>
      <div className="flex gap-2">{!pro && <Button asChild variant="outline"><Link href="/precos">Conhecer o Pro</Link></Button>}<SignOutButton /></div>
    </div>
    {pagamento && <p role="status" className="mt-5 rounded-xl bg-indigo-100 p-4 text-sm">{pagamento === "falhou" ? "O checkout não foi concluído." : "A confirmação do pagamento é feita pelo Mercado Pago. Atualize a página para conferir os recursos liberados."}</p>}
    <section className="panel my-6" aria-label="Assinaturas salvas">
      {signatures.length ? <ul className="divide-y divide-slate-100">{signatures.map(({ id, data }) =>
        <li key={id} className="flex flex-wrap items-center justify-between gap-2 py-2"><span className="max-w-full break-all font-semibold">{data.name}</span>
          <div className="flex gap-2"><Button asChild variant="outline"><Link href={`/dashboard?editar=${id}`}>Editar</Link></Button><DeleteSignature id={id} name={data.name} /></div></li>)}</ul>
        : <p className="text-slate-600">Sua primeira assinatura vai aparecer aqui depois de salva.</p>}
      {pro && !!signatures.length && <Button asChild className="mt-3"><Link href="/dashboard">Nova assinatura</Link></Button>}
    </section>
    {selected && !canUseTemplate(selected.data.template, pro, owned) && <p className="mb-4 text-sm text-slate-700">O modelo salvo exige acesso premium. A prévia mostra como os dados ficam no Essencial. Salve se quiser substituir a versão anterior.</p>}
    {(selected || pro || !signatures.length) && <SignatureBuilder key={selected?.id ?? "new"} signedIn pro={pro} owned={owned} id={selected?.id} initial={selected && (canUseTemplate(selected.data.template, pro, owned) ? selected.data : toEssential(selected.data))} />}
  </div>;
}
