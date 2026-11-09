import { notFound, redirect } from "next/navigation";
import { WorkspaceDashboard } from "@/components/dashboard/WorkspaceDashboard";
import { currentAccount } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { signatureAccess } from "@/lib/prisma/signatures";
import { workspaceSchema } from "@/lib/workspace";
import { signatureSchema } from "@/types/signature";

export const metadata = { title: "Meu espaço", robots: { index: false } };

export default async function Dashboard({
  searchParams,
}: {
  searchParams: Promise<{ editar?: string; pagamento?: string; nova?: string; salva?: string }>;
}) {
  const account = await currentAccount();
  if (!account) redirect("/login");
  if (!account.emailVerified) redirect("/verificar-email");

  const [{ editar, pagamento, nova, salva }, access, rows, user] = await Promise.all([
    searchParams,
    signatureAccess(account.id),
    db.signature.findMany({
      where: { userId: account.id },
      orderBy: { updatedAt: "desc" },
    }),
    db.user.findUnique({
      where: { id: account.id },
      select: { workspace: true, name: true },
    }),
  ]);

  const signatures = rows.flatMap(row => {
    const parsed = signatureSchema.safeParse(row.data);
    return parsed.success ? [{ id: row.id, data: parsed.data }] : [];
  });

  if (editar && !signatures.some(row => row.id === editar)) notFound();

  const parsedWorkspace = workspaceSchema.safeParse(user?.workspace);

  return (
    <WorkspaceDashboard
      name={user?.name ?? ""}
      email={account.email ?? ""}
      {...access}
      signatures={signatures}
      workspace={parsedWorkspace.success ? parsedWorkspace.data : null}
      edit={editar}
      creating={nova === "1"}
      payment={pagamento}
      saved={salva === "1"}
    />
  );
}
