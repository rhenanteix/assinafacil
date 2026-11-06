import { z } from "zod";
import { socialNetworks } from "./social";

export const templates = [
  { id: "minimal", label: "Minimalista", pro: true },
  { id: "essential", label: "Essencial", pro: false },
  { id: "modern", label: "Moderno", pro: true },
  { id: "classic", label: "Corporativo", pro: true },
  { id: "color", label: "Colorido", pro: true },
  { id: "banner", label: "Com banner", pro: true },
  { id: "compact", label: "Compacto", pro: true },
  { id: "executive", label: "Executivo", pro: true },
  { id: "studio", label: "Estúdio", pro: true },
  { id: "consulting", label: "Consultoria", pro: true },
  { id: "sales", label: "Comercial", pro: true },
  { id: "monogram", label: "Monograma", pro: true },
  { id: "editorial", label: "Editorial", pro: true },
  { id: "signature-luxe", label: "Signature Luxe", pro: true, exclusive: true },
  { id: "brand-desk", label: "Brand Desk", pro: true, exclusive: true },
] as const;

const link = z.string().trim().max(500).refine((value) => {
  if (!value) return true;
  try { return new URL(value).protocol === "https:"; } catch { return false; }
}, "Informe um endereço completo começando com https://");
const image = link.refine((value) => {
  if (!value) return true;
  try { return new URL(value).hostname === "res.cloudinary.com"; } catch { return false; }
}, "Imagem inválida");
function socialLink(network: typeof socialNetworks[number]) {
  return link.refine(value => {
    if (!value) return true;
    try {
      const url = new URL(value);
      return !url.username && !url.password && network.domains.some(domain => url.hostname === domain || url.hostname.endsWith("." + domain));
    } catch { return false; }
  }, `Informe um link válido de ${network.label}.`).default("");
}
const socialFields = Object.fromEntries(socialNetworks.map(network => [network.key, socialLink(network)])) as
  Record<typeof socialNetworks[number]["key"], ReturnType<typeof socialLink>>;
export const basicSignatureSchema = z.object({
  name: z.string().trim().min(1, "Informe seu nome").max(100),
  role: z.string().trim().max(100),
  company: z.string().trim().max(100),
  phone: z.string().trim().max(30).regex(/^[\d+().\s-]*$/, "Telefone inválido"),
  email: z.string().trim().max(254).email("E-mail inválido").or(z.literal("")),
});
export const signatureSchema = basicSignatureSchema.extend({
  website: link,
  ...socialFields,
  photo: image, logo: image,
  color: z.string().regex(/^#[0-9a-f]{6}$/i),
  template: z.enum(["essential", "minimal", "modern", "classic", "color", "banner", "compact", "executive", "studio", "consulting", "sales", "monogram", "editorial", "signature-luxe", "brand-desk"]),
});
export type SignatureData = z.infer<typeof signatureSchema>;
export const demo: SignatureData = {
  name: "Marina Costa", role: "Diretora de Design", company: "Estúdio Horizonte",
  phone: "+55 11 99999-0000", email: "marina@example.com", website: "https://example.com",
  instagram: "", facebook: "", linkedin: "", whatsapp: "", youtube: "", tiktok: "", x: "", github: "", photo: "", logo: "", color: "#5b45db", template: "modern",
};
export const emptySignature: SignatureData = {
  name: "", role: "", company: "", phone: "", email: "", website: "",
  instagram: "", facebook: "", linkedin: "", whatsapp: "", youtube: "", tiktok: "", x: "", github: "", photo: "", logo: "", color: "#5b45db", template: "essential",
};

export function canUseTemplate(template: SignatureData["template"], pro: boolean, owned: readonly string[] = []) {
  const item = templates.find(item => item.id === template);
  if (!item) return false;
  if ("exclusive" in item) return owned.includes(item.id);
  return !item.pro || pro;
}


export function toEssential(data: z.infer<typeof basicSignatureSchema>): SignatureData {
  return {
    ...emptySignature,
    name: data.name, role: data.role, company: data.company, phone: data.phone, email: data.email,
  };
}
