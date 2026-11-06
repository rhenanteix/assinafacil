import { z } from "zod";
import { offers } from "./plans";

export const checkoutInput = z.object({
  plan: z.enum(offers), requestId: z.string().uuid(),
  method: z.enum(["PIX", "BOLETO", "CARD"]),
  token: z.string().regex(/^ctok_[A-Za-z0-9_-]+$/).max(300).optional(),
  customer: z.object({
    name: z.string().trim().min(2).max(150),
    taxId: z.string().transform(value => value.replace(/\D/g, "")).refine(value => /^(\d{11}|\d{14})$/.test(value)),
    cellphone: z.string().trim().min(8).max(20),
  }).optional(),
}).strict().superRefine((value, ctx) => {
  if (value.method !== "PIX" && !value.customer) ctx.addIssue({ code: "custom", message: "Customer is required" });
  if (value.method === "CARD" && !value.token) ctx.addIssue({ code: "custom", message: "Card token is required" });
  if (value.method !== "CARD" && value.token) ctx.addIssue({ code: "custom", message: "Unexpected card token" });
});
