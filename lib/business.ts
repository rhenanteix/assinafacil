import { z } from "zod";
export const businessInput = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(254),
  company: z.string().trim().min(2).max(150),
  employees: z.coerce.number().int().min(1).max(1000000),
  message: z.string().trim().max(1500).default(""),
  website: z.string().max(0).default(""),
}).strict();
export function businessEmail(data: z.infer<typeof businessInput>) {
  return `Nome: ${data.name}\nE-mail: ${data.email}\nEmpresa: ${data.company}\nColaboradores: ${data.employees}\n\n${data.message}`;
}
