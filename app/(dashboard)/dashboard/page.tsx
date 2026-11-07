import { notFound, redirect } from "next/navigation";
import { currentAccount } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { signatureAccess } from "@/lib/prisma/signatures";
import { signatureSchema } from "@/types/signature";
import { workspaceSchema } from "@/lib/workspace";
import { WorkspaceDashboard } from "@/components/dashboard/WorkspaceDashboard";
export const metadata = { title: "Meu espaço", robots: { index: false } };
export default async function Dashboard({ searchParams }: { searchParams: Promise<{ editar?: string; pagamento?: string; nova?: string }> }) {
  const account = await currentAccount();
  if (!account) redirect("/login");
  if (!account.emailVerified) redirect("/verificar-email");
  const [{ editar, pagamento, nova }, access, rows, user] = await Promise.all([
    searchParams, signatureAccess(account.id),
    db.signature.findMany({ where: { userId: account.id }, orderBy: { updatedAt: "desc" } }),
    db.user.findUnique({ where: { id: account.id }, select: { workspace: true, name: true } }),
  ]);
  const signatures = rows.flatMap(row => { const parsed = signatureSchema.safeParse(row.data); return parsed.success ? [{ id: row.id, data: parsed.data }] : []; });
  if (editar && !signatures.some(row => row.id === editar)) notFound();
  const workspace = workspaceSchema.safeParse(user?.workspace);
  return <WorkspaceDashboard name={user?.name ?? ""} email={account.email ?? ""} {...access} signatures={signatures} workspace={workspace.success ? workspace.data : null} edit={editar} creating={nova === "1"} payment={pagamento} />;
}
