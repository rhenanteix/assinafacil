import type { Prisma } from "@prisma/client";
import { workspaceSchema } from "@/lib/workspace";
export async function canAssignFolder(client: Prisma.TransactionClient, userId: string, folderId: string | undefined, business: boolean) {
  if (!folderId) return true;
  if (!business) return false;
  const user = await client.user.findUnique({ where: { id: userId }, select: { workspace: true } });
  const parsed = workspaceSchema.safeParse(user?.workspace);
  return parsed.success && parsed.data.folders.some(folder => folder.id === folderId);
}
