import { z } from "zod";
import { whatsappUrl } from "./whatsapp";
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
const professionalTypes = ["CRECI", "OAB", "CRM", "CRC", "CNPJ"] as const;
export type ProfessionalType = typeof professionalTypes[number];
export const basicSignatureSchema = z.object({
  name: z.string().trim().min(1, "Informe seu nome").max(100),
  role: z.string().trim().max(100),
  company: z.string().trim().max(100),
  phone: z.string().trim().max(30).regex(/^[\d+().\s-]*$/, "Telefone inválido"),
  email: z.string().trim().max(254).email("E-mail inválido").or(z.literal("")),
  address: z.string().trim().max(200).default(""),
  cnpj: z.string().trim().max(18).default(""),
  professionalRegistrationType: z.union([z.enum(professionalTypes), z.literal("")]).optional(),
  professionalRegistration: z.string().trim().max(30).default(""),
  legalNotice: z.string().trim().max(300).default(""),
  whatsapp: z.string().trim().max(500).default("").refine(value => whatsappUrl(value) !== null, "Informe o WhatsApp com código do país (ex.: +55 11 99999-0000) ou um link válido.").transform(value => whatsappUrl(value) ?? ""),
});
export const signatureSchema = basicSignatureSchema.extend({
  website: link,
  ...socialFields,
  whatsapp: basicSignatureSchema.shape.whatsapp,
  photo: image, logo: image,
  color: z.string().regex(/^#[0-9a-f]{6}$/i),
  template: z.enum(["essential", "minimal", "modern", "classic", "color", "banner", "compact", "executive", "studio", "consulting", "sales", "monogram", "editorial", "signature-luxe", "brand-desk"]),
});
export type SignatureData = z.infer<typeof signatureSchema>;
export const demoDemos: Record<SignatureData["template"], SignatureData> = {
  essential: { name: "Ana Silva", role: "Advogada", company: "Silva & Associados", phone: "", email: "ana@silvaadv.com.br", website: "", address: "", cnpj: "", professionalRegistrationType: "", professionalRegistration: "", legalNotice: "", instagram: "https://instagram.com/example", facebook: "https://facebook.com/example", linkedin: "", whatsapp: "https://wa.me/5511988887777", youtube: "", tiktok: "", x: "", github: "", photo: "", logo: "", color: "#1a3a5a", template: "essential" },
  minimal: { name: "Carlos Mendes", role: "Corretor de Imóveis", company: "Imóveis Brasil", phone: "", email: "carlos@imoveisbrasil.com.br", website: "", address: "", cnpj: "", professionalRegistrationType: "", professionalRegistration: "", legalNotice: "", instagram: "https://instagram.com/example", facebook: "", linkedin: "", whatsapp: "https://wa.me/5511977776666", youtube: "", tiktok: "https://tiktok.com/@example", x: "", github: "", photo: "", logo: "", color: "#0e7490", template: "minimal" },
  modern: { name: "Fernanda Lima", role: "Consultora de Negócios", company: "Lima Consultoria", phone: "", email: "fernanda@limaconsultoria.com.br", website: "", address: "", cnpj: "", professionalRegistrationType: "", professionalRegistration: "", legalNotice: "", instagram: "https://instagram.com/example", facebook: "https://facebook.com/example", linkedin: "", whatsapp: "https://wa.me/5511966665555", youtube: "", tiktok: "", x: "", github: "", photo: "", logo: "", color: "#5b45db", template: "modern" },
  classic: { name: "Dr. Roberto Santos", role: "Médico Cardiologista", company: "Clínica Coração São Paulo", phone: "", email: "roberto@clinica.com.br", website: "", address: "", cnpj: "", professionalRegistrationType: "", professionalRegistration: "", legalNotice: "", instagram: "https://instagram.com/example", facebook: "", linkedin: "", whatsapp: "https://wa.me/5511955554444", youtube: "", tiktok: "https://tiktok.com/@example", x: "", github: "", photo: "", logo: "", color: "#2c3e50", template: "classic" },
  color: { name: "Juliana Pereira", role: "Consultora de Marketing", company: "Pereira Marketing", phone: "", email: "juliana@pereiramkt.com.br", website: "", address: "", cnpj: "", professionalRegistrationType: "", professionalRegistration: "", legalNotice: "", instagram: "https://instagram.com/example", facebook: "https://facebook.com/example", linkedin: "", whatsapp: "https://wa.me/5511944443333", youtube: "", tiktok: "", x: "", github: "", photo: "", logo: "", color: "#e74c3c", template: "color" },
  banner: { name: "Ricardo Alves", role: "Advogado Trabalhista", company: "Alves Advogados", phone: "", email: "ricardo@alvesadv.com.br", website: "", address: "", cnpj: "", professionalRegistrationType: "", professionalRegistration: "", legalNotice: "", instagram: "https://instagram.com/example", facebook: "", linkedin: "", whatsapp: "https://wa.me/5511933332222", youtube: "", tiktok: "https://tiktok.com/@example", x: "", github: "", photo: "", logo: "", color: "#8e44ad", template: "banner" },
  compact: { name: "Patrícia Rocha", role: "Corretora de Imóveis", company: "Rocha Imóveis", phone: "", email: "patricia@rochaimoveis.com.br", website: "", address: "", cnpj: "", professionalRegistrationType: "", professionalRegistration: "", legalNotice: "", instagram: "https://instagram.com/example", facebook: "https://facebook.com/example", linkedin: "", whatsapp: "https://wa.me/5511922221111", youtube: "", tiktok: "", x: "", github: "", photo: "", logo: "", color: "#16a085", template: "compact" },
  executive: { name: "Dr. Marcos Teixeira", role: "Médico Ortopedista", company: "Teixeira Ortopedia", phone: "", email: "marcos@teixeiraorto.com.br", website: "", address: "", cnpj: "", professionalRegistrationType: "", professionalRegistration: "", legalNotice: "", instagram: "https://instagram.com/example", facebook: "", linkedin: "", whatsapp: "https://wa.me/5511911110000", youtube: "", tiktok: "https://tiktok.com/@example", x: "", github: "", photo: "", logo: "", color: "#2980b9", template: "executive" },
  studio: { name: "Lucas Ferreira", role: "Designer de Produto", company: "Estúdio Horizonte", phone: "", email: "lucas@estudiohorizonte.com.br", website: "", address: "", cnpj: "", professionalRegistrationType: "", professionalRegistration: "", legalNotice: "", instagram: "https://instagram.com/example", facebook: "https://facebook.com/example", linkedin: "", whatsapp: "https://wa.me/5511900009999", youtube: "", tiktok: "", x: "", github: "", photo: "", logo: "", color: "#5b45db", template: "studio" },
  consulting: { name: "Mariana Gomes", role: "Consultora Financeira", company: "Gomes Consultoria", phone: "", email: "mariana@gomesconsultoria.com.br", website: "", address: "", cnpj: "", professionalRegistrationType: "", professionalRegistration: "", legalNotice: "", instagram: "https://instagram.com/example", facebook: "", linkedin: "", whatsapp: "https://wa.me/5511899998888", youtube: "", tiktok: "https://tiktok.com/@example", x: "", github: "", photo: "", logo: "", color: "#c0392b", template: "consulting" },
  sales: { name: "Bruno Costa", role: "Corretor de Imóveis", company: "Costa Imóveis", phone: "", email: "bruno@costaimoveis.com.br", website: "", address: "", cnpj: "", professionalRegistrationType: "", professionalRegistration: "", legalNotice: "", instagram: "https://instagram.com/example", facebook: "https://facebook.com/example", linkedin: "", whatsapp: "https://wa.me/5511888887777", youtube: "", tiktok: "", x: "", github: "", photo: "", logo: "", color: "#27ae60", template: "sales" },
  monogram: { name: "Sofia Andrade", role: "Advogada Civil", company: "Andrade Advogados", phone: "", email: "sofia@andradeadv.com.br", website: "", address: "", cnpj: "", professionalRegistrationType: "", professionalRegistration: "", legalNotice: "", instagram: "https://instagram.com/example", facebook: "", linkedin: "", whatsapp: "https://wa.me/5511777776666", youtube: "", tiktok: "https://tiktok.com/@example", x: "", github: "", photo: "", logo: "", color: "#34495e", template: "monogram" },
  editorial: { name: "Felipe Nunes", role: "Médico Pediatra", company: "Clínica Nunes Pediatria", phone: "", email: "felipe@nunespediatria.com.br", website: "", address: "", cnpj: "", professionalRegistrationType: "", professionalRegistration: "", legalNotice: "", instagram: "https://instagram.com/example", facebook: "https://facebook.com/example", linkedin: "", whatsapp: "https://wa.me/5511666665555", youtube: "", tiktok: "", x: "", github: "", photo: "", logo: "", color: "#7f8c8d", template: "editorial" },
  "signature-luxe": { name: "Gustavo Ribeiro", role: "Consultor Executivo", company: "Ribeiro Consultoria", phone: "", email: "gustavo@ribeiroconsultoria.com.br", website: "", address: "", cnpj: "", professionalRegistrationType: "", professionalRegistration: "", legalNotice: "", instagram: "https://instagram.com/example", facebook: "", linkedin: "", whatsapp: "https://wa.me/5511555554444", youtube: "", tiktok: "https://tiktok.com/@example", x: "", github: "", photo: "", logo: "", color: "#7d3c98", template: "signature-luxe" },
  "brand-desk": { name: "Alessandra Moura", role: "Contadora", company: "Moura Contabilidade", phone: "", email: "alessandra@mouraseguros.com.br", website: "", address: "", cnpj: "", professionalRegistrationType: "", professionalRegistration: "", legalNotice: "", instagram: "https://instagram.com/example", facebook: "https://facebook.com/example", linkedin: "", whatsapp: "https://wa.me/5511444443333", youtube: "", tiktok: "", x: "", github: "", photo: "", logo: "", color: "#1abc9c", template: "brand-desk" },
};
export const demo = demoDemos.modern;
export const emptySignature: SignatureData = {
  name: "", role: "", company: "", phone: "", email: "", website: "", address: "", cnpj: "",
  professionalRegistrationType: undefined, professionalRegistration: "", legalNotice: "",
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
    whatsapp: data.whatsapp,
    address: data.address, cnpj: data.cnpj,
    professionalRegistrationType: data.professionalRegistrationType, professionalRegistration: data.professionalRegistration, legalNotice: data.legalNotice,
  };
}
