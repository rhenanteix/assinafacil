import { canUseTemplate, toEssential, type SignatureData } from "@/types/signature";

export function prepareSignature(data: SignatureData, access: { pro: boolean; owned: readonly string[] }) {
  if (!canUseTemplate(data.template, access.pro, access.owned)) return null;
  const premium = access.pro || access.owned.includes(data.template);
  return { premium, data: premium ? data : toEssential(data) };
}
