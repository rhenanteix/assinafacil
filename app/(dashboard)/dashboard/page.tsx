import { notFound, redirect } from "next/navigation";
import { SignatureBuilder } from "@/components/signature/SignatureBuilder";
import { DeleteSignature, SignOutButton } from "@/components/shared/DashboardActions";
import { Button } from "@/components/ui/button";
import { TrackedLink } from "@/components/shared/TrackedLink";
import { currentAccount } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { signatureAccess } from "@/lib/prisma/signatures";
import { getTranslator } from "@/lib/i18n/server";
import { canUseTemplate, signatureSchema, toEssential } from "@/types/signature";

export const metadata = { title: "Meu espaço", robots: { index: false } };
export default async function Dashboard({ searchParams }: { searchParams: Promise<{ editar?: string; pagamento?: string; nova?: string; salva?: string }> }) {
  const account = await currentAccount();
  if (!account) redirect("/login");
  if (!account.emailVerified) redirect("/verificar-email");
  const [{ editar, pagamento, nova, salva }, access, rows, user] = await Promise.all([
    searchParams, signatureAccess(account.id),
    db.signature.findMany({ where: { userId: account.id }, orderBy: { updatedAt: "desc" } }),
    db.user.findUnique({ where: { id: account.id }, select: { workspace: true, name: true } }),
  ]);
  const signatures = rows.flatMap(row => { const parsed = signatureSchema.safeParse(row.data); return parsed.success ? [{ id: row.id, data: parsed.data }] : []; });
  if (editar && !signatures.some(row => row.id === editar)) notFound();
  const workspace = workspaceSchema.safeParse(user?.workspace);
  return <WorkspaceDashboard name={user?.name ?? ""} email={account.email ?? ""} {...access} signatures={signatures} workspace={workspace.success ? workspace.data : null} edit={editar} creating={nova === "1"} payment={pagamento} saved={salva === "1"} />;
}
