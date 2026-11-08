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
  { id: "tech", label: "Tecnologia", pro: true },
  { id: "finance", label: "Financeiro", pro: true },
  { id: "education", label: "Educação", pro: true },
  { id: "creative", label: "Criativo", pro: true },
  { id: "wellness", label: "Bem-estar", pro: true },
  { id: "developer", label: "Desenvolvedor", pro: true },
  { id: "architect", label: "Arquitetura", pro: true },
  { id: "growth", label: "Marketing", pro: true },
  { id: "property", label: "Imobiliário", pro: true },
  { id: "counsel", label: "Jurídico", pro: true },
  { id: "clinic", label: "Clínica", pro: true },
  { id: "portfolio", label: "Portfólio", pro: true },
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
export const professionalTypes = ["CRECI", "OAB", "CRM", "CRO", "CRP", "CRN", "CRC", "CNPJ"] as const;
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
  // Pacotes por profissão (feature-flagged). Campos opcionais para retrocompatibilidade.
  professionId: z.string().trim().max(60).default(""),
  ctaLabel: z.string().trim().max(60).default(""),
  ctaType: z.enum(["link", "whatsapp"]).default("link"),
  ctaUrl: z.string().trim().max(500).default(""),
  signoff: z.string().trim().max(80).default(""),
  companySize: z.enum(["solo", "2-10", "11-50", "51+"]).optional(),
});
export const signatureSchema = basicSignatureSchema.extend({
  folderId: z.string().max(100).optional(),
  website: link,
  ...socialFields,
  whatsapp: basicSignatureSchema.shape.whatsapp,
  photo: image, logo: image,
  color: z.string().regex(/^#[0-9a-f]{6}$/i),
  template: z.enum(["essential", "minimal", "modern", "classic", "color", "banner", "compact", "executive", "studio", "consulting", "sales", "monogram", "editorial", "tech", "finance", "education", "creative", "wellness", "developer", "architect", "growth", "property", "counsel", "clinic", "portfolio", "signature-luxe", "brand-desk"]),
});
export type SignatureData = z.infer<typeof signatureSchema>;
export const demoDemos: Record<SignatureData["template"], SignatureData> = {
  essential: { name: "Ana Silva", role: "Advogada", company: "Silva & Associados", phone: "", email: "ana@silvaadv.com.br", website: "", address: "São Paulo, SP", cnpj: "", professionalRegistrationType: "OAB", professionalRegistration: "000000/SP (exemplo)", legalNotice: "", professionId: "", ctaLabel: "", ctaType: "link" as const, ctaUrl: "", signoff: "", instagram: "https://instagram.com/example", facebook: "https://facebook.com/example", linkedin: "", whatsapp: "https://wa.me/5511988887777", youtube: "", tiktok: "", x: "", github: "", behance: "", dribbble: "", photo: "", logo: "", color: "#1a3a5a", template: "essential" },
  minimal: { name: "Carlos Mendes", role: "Corretor de Imóveis", company: "Imóveis Brasil", phone: "", email: "carlos@imoveisbrasil.com.br", website: "", address: "São Paulo, SP", cnpj: "", professionalRegistrationType: "CRECI", professionalRegistration: "000000/SP (exemplo)", legalNotice: "", professionId: "", ctaLabel: "", ctaType: "link" as const, ctaUrl: "", signoff: "", instagram: "https://instagram.com/example", facebook: "", linkedin: "", whatsapp: "https://wa.me/5511977776666", youtube: "", tiktok: "https://tiktok.com/@example", x: "", github: "", behance: "", dribbble: "", photo: "", logo: "", color: "#0e7490", template: "minimal" },
  modern: { name: "Fernanda Lima", role: "Consultora de Negócios", company: "Lima Consultoria", phone: "", email: "fernanda@limaconsultoria.com.br", website: "", address: "", cnpj: "", professionalRegistrationType: "", professionalRegistration: "", legalNotice: "", professionId: "", ctaLabel: "", ctaType: "link" as const, ctaUrl: "", signoff: "", instagram: "https://instagram.com/example", facebook: "https://facebook.com/example", linkedin: "", whatsapp: "https://wa.me/5511966665555", youtube: "", tiktok: "", x: "", github: "", behance: "", dribbble: "", photo: "", logo: "", color: "#5b45db", template: "modern" },
  classic: { name: "Dr. Roberto Santos", role: "Médico Cardiologista", company: "Clínica Coração São Paulo", phone: "", email: "roberto@clinica.com.br", website: "", address: "São Paulo, SP", cnpj: "", professionalRegistrationType: "CRM", professionalRegistration: "000000/SP (exemplo)", legalNotice: "", professionId: "", ctaLabel: "", ctaType: "link" as const, ctaUrl: "", signoff: "", instagram: "https://instagram.com/example", facebook: "", linkedin: "", whatsapp: "https://wa.me/5511955554444", youtube: "", tiktok: "https://tiktok.com/@example", x: "", github: "", behance: "", dribbble: "", photo: "", logo: "", color: "#2c3e50", template: "classic" },
  color: { name: "Juliana Pereira", role: "Consultora de Marketing", company: "Pereira Marketing", phone: "", email: "juliana@pereiramkt.com.br", website: "", address: "", cnpj: "", professionalRegistrationType: "", professionalRegistration: "", legalNotice: "", professionId: "", ctaLabel: "", ctaType: "link" as const, ctaUrl: "", signoff: "", instagram: "https://instagram.com/example", facebook: "https://facebook.com/example", linkedin: "", whatsapp: "https://wa.me/5511944443333", youtube: "", tiktok: "", x: "", github: "", behance: "", dribbble: "", photo: "", logo: "", color: "#e74c3c", template: "color" },
  banner: { name: "Ricardo Alves", role: "Advogado Trabalhista", company: "Alves Advogados", phone: "", email: "ricardo@alvesadv.com.br", website: "", address: "São Paulo, SP", cnpj: "", professionalRegistrationType: "OAB", professionalRegistration: "000000/SP (exemplo)", legalNotice: "", professionId: "", ctaLabel: "", ctaType: "link" as const, ctaUrl: "", signoff: "", instagram: "https://instagram.com/example", facebook: "", linkedin: "", whatsapp: "https://wa.me/5511933332222", youtube: "", tiktok: "https://tiktok.com/@example", x: "", github: "", behance: "", dribbble: "", photo: "", logo: "", color: "#8e44ad", template: "banner" },
  compact: { name: "Patrícia Rocha", role: "Corretora de Imóveis", company: "Rocha Imóveis", phone: "", email: "patricia@rochaimoveis.com.br", website: "", address: "São Paulo, SP", cnpj: "", professionalRegistrationType: "CRECI", professionalRegistration: "000000/SP (exemplo)", legalNotice: "", professionId: "", ctaLabel: "", ctaType: "link" as const, ctaUrl: "", signoff: "", instagram: "https://instagram.com/example", facebook: "https://facebook.com/example", linkedin: "", whatsapp: "https://wa.me/5511922221111", youtube: "", tiktok: "", x: "", github: "", behance: "", dribbble: "", photo: "", logo: "", color: "#16a085", template: "compact" },
  executive: { name: "Dr. Marcos Teixeira", role: "Médico Ortopedista", company: "Teixeira Ortopedia", phone: "", email: "marcos@teixeiraorto.com.br", website: "", address: "São Paulo, SP", cnpj: "", professionalRegistrationType: "CRM", professionalRegistration: "000000/SP (exemplo)", legalNotice: "", professionId: "", ctaLabel: "", ctaType: "link" as const, ctaUrl: "", signoff: "", instagram: "https://instagram.com/example", facebook: "", linkedin: "", whatsapp: "https://wa.me/5511911110000", youtube: "", tiktok: "https://tiktok.com/@example", x: "", github: "", behance: "", dribbble: "", photo: "", logo: "", color: "#2980b9", template: "executive" },
  studio: { name: "Lucas Ferreira", role: "Designer de Produto", company: "Estúdio Horizonte", phone: "", email: "lucas@estudiohorizonte.com.br", website: "", address: "", cnpj: "", professionalRegistrationType: "", professionalRegistration: "", legalNotice: "", professionId: "", ctaLabel: "", ctaType: "link" as const, ctaUrl: "", signoff: "", instagram: "https://instagram.com/example", facebook: "https://facebook.com/example", linkedin: "", whatsapp: "https://wa.me/5511900009999", youtube: "", tiktok: "", x: "", github: "", behance: "", dribbble: "", photo: "", logo: "", color: "#5b45db", template: "studio" },
  consulting: { name: "Mariana Gomes", role: "Consultora Financeira", company: "Gomes Consultoria", phone: "", email: "mariana@gomesconsultoria.com.br", website: "", address: "", cnpj: "", professionalRegistrationType: "", professionalRegistration: "", legalNotice: "", professionId: "", ctaLabel: "", ctaType: "link" as const, ctaUrl: "", signoff: "", instagram: "https://instagram.com/example", facebook: "", linkedin: "", whatsapp: "https://wa.me/5511899998888", youtube: "", tiktok: "https://tiktok.com/@example", x: "", github: "", behance: "", dribbble: "", photo: "", logo: "", color: "#c0392b", template: "consulting" },
  sales: { name: "Bruno Costa", role: "Corretor de Imóveis", company: "Costa Imóveis", phone: "", email: "bruno@costaimoveis.com.br", website: "", address: "São Paulo, SP", cnpj: "", professionalRegistrationType: "CRECI", professionalRegistration: "000000/SP (exemplo)", legalNotice: "", professionId: "", ctaLabel: "", ctaType: "link" as const, ctaUrl: "", signoff: "", instagram: "https://instagram.com/example", facebook: "https://facebook.com/example", linkedin: "", whatsapp: "https://wa.me/5511888887777", youtube: "", tiktok: "", x: "", github: "", behance: "", dribbble: "", photo: "", logo: "", color: "#27ae60", template: "sales" },
  monogram: { name: "Sofia Andrade", role: "Advogada Civil", company: "Andrade Advogados", phone: "", email: "sofia@andradeadv.com.br", website: "", address: "São Paulo, SP", cnpj: "", professionalRegistrationType: "OAB", professionalRegistration: "000000/SP (exemplo)", legalNotice: "", professionId: "", ctaLabel: "", ctaType: "link" as const, ctaUrl: "", signoff: "", instagram: "https://instagram.com/example", facebook: "", linkedin: "", whatsapp: "https://wa.me/5511777776666", youtube: "", tiktok: "https://tiktok.com/@example", x: "", github: "", behance: "", dribbble: "", photo: "", logo: "", color: "#34495e", template: "monogram" },
  editorial: { name: "Felipe Nunes", role: "Médico Pediatra", company: "Clínica Nunes Pediatria", phone: "", email: "felipe@nunespediatria.com.br", website: "", address: "São Paulo, SP", cnpj: "", professionalRegistrationType: "CRM", professionalRegistration: "000000/SP (exemplo)", legalNotice: "", professionId: "", ctaLabel: "", ctaType: "link" as const, ctaUrl: "", signoff: "", instagram: "https://instagram.com/example", facebook: "https://facebook.com/example", linkedin: "", whatsapp: "https://wa.me/5511666665555", youtube: "", tiktok: "", x: "", github: "", behance: "", dribbble: "", photo: "", logo: "", color: "#7f8c8d", template: "editorial" },
  tech: { name: "Renata Farias", role: "Engenheira de Software", company: "Nuvem Exemplo Tecnologia", phone: "", email: "renata@exemplo-tech.com.br", website: "https://exemplo-tech.com.br", address: "São Paulo, SP", cnpj: "", professionalRegistrationType: "", professionalRegistration: "", legalNotice: "", professionId: "", ctaLabel: "", ctaType: "link" as const, ctaUrl: "", signoff: "", instagram: "", facebook: "", linkedin: "https://linkedin.com/in/exemplo", whatsapp: "https://wa.me/5511990010001", youtube: "", tiktok: "", x: "https://x.com/exemplo", github: "https://github.com/exemplo", behance: "", dribbble: "", photo: "", logo: "", color: "#2563eb", template: "tech" },
  finance: { name: "Eduardo Martins", role: "Consultor Financeiro", company: "Martins Planejamento", phone: "", email: "eduardo@exemplo-financas.com.br", website: "https://exemplo-financas.com.br", address: "São Paulo, SP", cnpj: "", professionalRegistrationType: "CRC", professionalRegistration: "000000/SP (exemplo)", legalNotice: "", professionId: "", ctaLabel: "", ctaType: "link" as const, ctaUrl: "", signoff: "", instagram: "", facebook: "", linkedin: "https://linkedin.com/in/exemplo", whatsapp: "https://wa.me/5511990010002", youtube: "", tiktok: "", x: "", github: "", behance: "", dribbble: "", photo: "", logo: "", color: "#0f766e", template: "finance" },
  education: { name: "Prof. Helena Duarte", role: "Coordenadora Pedagógica", company: "Instituto Exemplo Saber", phone: "", email: "helena@exemplo-educacao.com.br", website: "https://exemplo-educacao.com.br", address: "São Paulo, SP", cnpj: "", professionalRegistrationType: "", professionalRegistration: "", legalNotice: "", professionId: "", ctaLabel: "", ctaType: "link" as const, ctaUrl: "", signoff: "", instagram: "https://instagram.com/exemplo", facebook: "", linkedin: "https://linkedin.com/in/exemplo", whatsapp: "https://wa.me/5511990010003", youtube: "", tiktok: "", x: "", github: "", behance: "", dribbble: "", photo: "", logo: "", color: "#ca8a04", template: "education" },
  creative: { name: "Lívia Barros", role: "Diretora de Arte", company: "Barros Criação", phone: "", email: "livia@exemplo-criativo.com.br", website: "https://exemplo-criativo.com.br", address: "", cnpj: "", professionalRegistrationType: "", professionalRegistration: "", legalNotice: "", professionId: "", ctaLabel: "", ctaType: "link" as const, ctaUrl: "", signoff: "", instagram: "https://instagram.com/exemplo", facebook: "", linkedin: "", whatsapp: "https://wa.me/5511990010004", youtube: "", tiktok: "", x: "", github: "", behance: "https://behance.net/exemplo", dribbble: "https://dribbble.com/exemplo", photo: "", logo: "", color: "#db2777", template: "creative" },
  wellness: { name: "Paula Rezende", role: "Nutricionista", company: "Espaço Exemplo Bem-estar", phone: "", email: "paula@exemplo-bemestar.com.br", website: "https://exemplo-bemestar.com.br", address: "São Paulo, SP", cnpj: "", professionalRegistrationType: "CRN", professionalRegistration: "000000/SP (exemplo)", legalNotice: "", professionId: "", ctaLabel: "", ctaType: "link" as const, ctaUrl: "", signoff: "", instagram: "https://instagram.com/exemplo", facebook: "", linkedin: "", whatsapp: "https://wa.me/5511990010005", youtube: "", tiktok: "", x: "", github: "", behance: "", dribbble: "", photo: "", logo: "", color: "#059669", template: "wellness" },
  developer: { name: "Thiago Lopes", role: "Desenvolvedor Full Stack", company: "Lopes Software", phone: "", email: "thiago@exemplo-dev.com.br", website: "https://exemplo-dev.com.br", address: "", cnpj: "", professionalRegistrationType: "", professionalRegistration: "", legalNotice: "", professionId: "", ctaLabel: "", ctaType: "link" as const, ctaUrl: "", signoff: "", instagram: "", facebook: "", linkedin: "https://linkedin.com/in/exemplo", whatsapp: "https://wa.me/5511990010006", youtube: "", tiktok: "", x: "https://x.com/exemplo", github: "https://github.com/exemplo", behance: "", dribbble: "", photo: "", logo: "", color: "#4f46e5", template: "developer" },
  architect: { name: "Isabela Tavares", role: "Arquiteta", company: "Tavares Arquitetura", phone: "", email: "isabela@exemplo-arquitetura.com.br", website: "https://exemplo-arquitetura.com.br", address: "São Paulo, SP", cnpj: "", professionalRegistrationType: "", professionalRegistration: "", legalNotice: "", professionId: "", ctaLabel: "", ctaType: "link" as const, ctaUrl: "", signoff: "", instagram: "https://instagram.com/exemplo", facebook: "", linkedin: "", whatsapp: "https://wa.me/5511990010007", youtube: "", tiktok: "", x: "", github: "", behance: "", dribbble: "", photo: "", logo: "", color: "#78716c", template: "architect" },
  growth: { name: "Diego Pacheco", role: "Especialista em Marketing", company: "Pacheco Growth", phone: "", email: "diego@exemplo-marketing.com.br", website: "https://exemplo-marketing.com.br", address: "", cnpj: "", professionalRegistrationType: "", professionalRegistration: "", legalNotice: "", professionId: "", ctaLabel: "", ctaType: "link" as const, ctaUrl: "", signoff: "", instagram: "https://instagram.com/exemplo", facebook: "", linkedin: "https://linkedin.com/in/exemplo", whatsapp: "https://wa.me/5511990010008", youtube: "", tiktok: "", x: "", github: "", behance: "", dribbble: "", photo: "", logo: "", color: "#ea580c", template: "growth" },
  property: { name: "André Moreira", role: "Consultor Imobiliário", company: "Moreira Negócios Imobiliários", phone: "", email: "andre@exemplo-imobiliario.com.br", website: "https://exemplo-imobiliario.com.br", address: "São Paulo, SP", cnpj: "", professionalRegistrationType: "CRECI", professionalRegistration: "000000/SP (exemplo)", legalNotice: "", professionId: "", ctaLabel: "", ctaType: "link" as const, ctaUrl: "", signoff: "", instagram: "https://instagram.com/exemplo", facebook: "", linkedin: "", whatsapp: "https://wa.me/5511990010009", youtube: "", tiktok: "", x: "", github: "", behance: "", dribbble: "", photo: "", logo: "", color: "#0e7490", template: "property" },
  counsel: { name: "Larissa Campos", role: "Advogada", company: "Campos Advocacia", phone: "", email: "larissa@exemplo-juridico2.com.br", website: "https://exemplo-juridico2.com.br", address: "São Paulo, SP", cnpj: "", professionalRegistrationType: "OAB", professionalRegistration: "000000/SP (exemplo)", legalNotice: "", professionId: "", ctaLabel: "", ctaType: "link" as const, ctaUrl: "", signoff: "", instagram: "", facebook: "", linkedin: "https://linkedin.com/in/exemplo", whatsapp: "https://wa.me/5511990010010", youtube: "", tiktok: "", x: "", github: "", behance: "", dribbble: "", photo: "", logo: "", color: "#1e3a5f", template: "counsel" },
  clinic: { name: "Dr. Vinícius Prado", role: "Clínico Geral", company: "Clínica Exemplo Cuidar", phone: "", email: "vinicius@exemplo-clinica.com.br", website: "https://exemplo-clinica.com.br", address: "São Paulo, SP", cnpj: "", professionalRegistrationType: "CRM", professionalRegistration: "000000/SP (exemplo)", legalNotice: "", professionId: "", ctaLabel: "", ctaType: "link" as const, ctaUrl: "", signoff: "", instagram: "https://instagram.com/exemplo", facebook: "", linkedin: "", whatsapp: "https://wa.me/5511990010011", youtube: "", tiktok: "", x: "", github: "", behance: "", dribbble: "", photo: "", logo: "", color: "#0284c7", template: "clinic" },
  portfolio: { name: "Natália Freire", role: "Designer de Marcas", company: "Freire Design", phone: "", email: "natalia@exemplo-portfolio.com.br", website: "https://portfolio.exemplo.com.br", address: "", cnpj: "", professionalRegistrationType: "", professionalRegistration: "", legalNotice: "", professionId: "", ctaLabel: "", ctaType: "link" as const, ctaUrl: "", signoff: "", instagram: "https://instagram.com/exemplo", facebook: "", linkedin: "", whatsapp: "https://wa.me/5511990010012", youtube: "", tiktok: "", x: "", github: "", behance: "https://behance.net/exemplo", dribbble: "https://dribbble.com/exemplo", photo: "", logo: "", color: "#7c3aed", template: "portfolio" },
  "signature-luxe": { name: "Gustavo Ribeiro", role: "Consultor Executivo", company: "Ribeiro Consultoria", phone: "", email: "gustavo@ribeiroconsultoria.com.br", website: "", address: "", cnpj: "", professionalRegistrationType: "", professionalRegistration: "", legalNotice: "", professionId: "", ctaLabel: "", ctaType: "link" as const, ctaUrl: "", signoff: "", instagram: "https://instagram.com/example", facebook: "", linkedin: "", whatsapp: "https://wa.me/5511555554444", youtube: "", tiktok: "https://tiktok.com/@example", x: "", github: "", behance: "", dribbble: "", photo: "", logo: "", color: "#7d3c98", template: "signature-luxe" },
  "brand-desk": { name: "Alessandra Moura", role: "Contadora", company: "Moura Contabilidade", phone: "", email: "alessandra@mouraseguros.com.br", website: "", address: "São Paulo, SP", cnpj: "", professionalRegistrationType: "CRC", professionalRegistration: "000000/SP (exemplo)", legalNotice: "", professionId: "", ctaLabel: "", ctaType: "link" as const, ctaUrl: "", signoff: "", instagram: "https://instagram.com/example", facebook: "https://facebook.com/example", linkedin: "", whatsapp: "https://wa.me/5511444443333", youtube: "", tiktok: "", x: "", github: "", behance: "", dribbble: "", photo: "", logo: "", color: "#1abc9c", template: "brand-desk" },
};
export const demo = demoDemos.modern;
export const emptySignature: SignatureData = {
  name: "", role: "", company: "", phone: "", email: "", website: "", address: "", cnpj: "",
  professionalRegistrationType: undefined, professionalRegistration: "", legalNotice: "",
  professionId: "", ctaLabel: "", ctaType: "link", ctaUrl: "", signoff: "",
  instagram: "", facebook: "", linkedin: "", whatsapp: "", youtube: "", tiktok: "", x: "", github: "", behance: "", dribbble: "", photo: "", logo: "", color: "#5b45db", template: "essential",
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
    professionId: data.professionId ?? "", signoff: data.signoff ?? "",
    // CTA mantido nos dados; renderização/exportação respeitam o plano (verificação existente).
    ctaLabel: data.ctaLabel ?? "", ctaType: data.ctaType ?? "link", ctaUrl: data.ctaUrl ?? "",
  };
}
