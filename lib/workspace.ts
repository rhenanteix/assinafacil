import { z } from "zod";
import { signatureSchema } from "@/types/signature";
export const folderSchema = z.object({ id: z.string().min(1).max(100), name: z.string().trim().min(1).max(60), color: signatureSchema.shape.color, template: signatureSchema.shape.template });
export const workspaceSchema = z.object({ completed: z.boolean(), brand: signatureSchema, folders: z.array(folderSchema).max(50) });
export type Workspace = z.infer<typeof workspaceSchema>;
