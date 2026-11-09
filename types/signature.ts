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
  { id: "corporativo-aviso", label: "Corporativo com aviso", pro: true },
  { id: "executivo-cta", label: "Executivo com CTA", pro: true },
  { id: "promocao", label: "Promoção", pro: true },
  { id: "evento", label: "Evento", pro: true },
  { id: "atendimento", label: "Atendimento", pro: true },
  { id: "vagas", label: "Vagas", pro: true },
  { id: "marca-empilhada", label: "Marca empilhada", pro: true },
  { id: "loja-local", label: "Loja local", pro: true },
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
export const professionalTypes = ["CRECI", "OAB", "CRM", "CRO", "CRP", "CRN", "CRC", "CAU", "CREA", "CREF", "OUTRO", "CNPJ"] as const;
export type ProfessionalType = typeof professionalTypes[number];
export const basicSignatureSchema = z.object({
  name: z.string().trim().min(1, "Informe seu nome").max(100),
  role: z.string().trim().max(100),
  company: z.string().trim().max(100),
  phone: z.string().trim().max(30).regex(/^[\d+().\s-]*$/, "Telefone inválido"),
  email: z.string().trim().max(254).email("E-mail inválido").or(z.literal("")),
  address: z.string().trim().max(200).default(""),
  cnpj: z.string().trim().max(18).default(""),
  cep: z.string().trim().max(10).default(""),
  professionalRegistrationType: z.union([z.enum(professionalTypes), z.literal("")]).optional(),
  professionalRegistration: z.string().trim().max(30).default(""),
  professionalRegistrationUf: z.string().trim().max(2).default(""),
  professionalRegistrationRqe: z.string().trim().max(20).default(""),
  legalNotice: z.string().trim().max(300).default(""),
  whatsapp: z.string().trim().max(500).default("").refine(value => whatsappUrl(value) !== null, "Informe o WhatsApp com código do país (ex.: +55 11 99999-0000) ou um link válido.").transform(value => whatsappUrl(value) ?? ""),
  whatsappMessage: z.string().trim().max(200).default(""),
  whatsappSameAsPhone: z.boolean().default(false),
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
  // Sistema de blocos (fase 1, feature-flagged). Quando preenchido, o renderizador
  // de blocos é usado em vez do layout legado. Modelo legado continua inalterado.
  templateBlocos: z.string().optional(),
  blocos: z.string().optional(), // JSON serializado dos blocos personalizados
  modoCompativel: z.boolean().default(false),
  logoEscuro: z.string().optional(), // variante de logo para fundo escuro
  // UTM automático (fase 5)
  utm: z.boolean().default(false),
  utmSource: z.string().default("assinatura"),
  utmMedium: z.string().default("email"),
  utmCampaign: z.string().max(120).default(""),
  // Banner de imagem / texto (fase 4)
  bannerImagem: z.string().optional(),
  bannerTitulo: z.string().max(120).default(""),
  bannerSubtitulo: z.string().max(200).default(""),
  bannerBotao: z.string().max(80).default(""),
  bannerUrl: link.optional().default(""),
  bannerAlt: z.string().max(120).default(""),
  // Selos e galeria (fase 4)
  selos: z.string().optional(), // JSON
  galeria: z.string().optional(), // JSON
  template: z.enum(["essential", "minimal", "modern", "classic", "color", "banner", "compact", "executive", "studio", "consulting", "sales", "monogram", "editorial", "tech", "finance", "education", "creative", "wellness", "developer", "architect", "growth", "property", "counsel", "clinic", "portfolio", "signature-luxe", "brand-desk", "corporativo-aviso", "executivo-cta", "promocao", "evento", "atendimento", "vagas", "marca-empilhada", "loja-local"]),
});
export type SignatureData = z.infer<typeof signatureSchema>;

const demoBase = {
  phone: "", email: "", website: "", address: "", cnpj: "", cep: "",
  professionalRegistrationType: "", professionalRegistration: "", professionalRegistrationUf: "", professionalRegistrationRqe: "", legalNotice: "",
  professionId: "", ctaLabel: "", ctaType: "link" as const, ctaUrl: "", signoff: "",
  instagram: "", facebook: "", linkedin: "", whatsapp: "", whatsappMessage: "", whatsappSameAsPhone: false, youtube: "", tiktok: "", x: "", github: "", behance: "", dribbble: "", photo: "", logo: "",
  templateBlocos: undefined, blocos: undefined, modoCompativel: false, logoEscuro: undefined,
  utm: false, utmSource: "assinatura", utmMedium: "email", utmCampaign: "",
  bannerImagem: undefined, bannerTitulo: "", bannerSubtitulo: "", bannerBotao: "", bannerUrl: "", bannerAlt: "",
  selos: undefined, galeria: undefined,
} as const;
const mk = (template: SignatureData["template"], name: string, role: string, company: string, color: string, extras: Partial<SignatureData> = {}): SignatureData =>
  ({ ...demoBase, name, role, company, color, template, ...extras } as SignatureData);

export const demoDemos: Record<SignatureData["template"], SignatureData> = {
  essential: mk("essential", "Ana Silva", "Advogada", "Silva & Associados", "#1a3a5a", { email: "ana@silvaadv.com.br", professionalRegistrationType: "OAB", professionalRegistration: "000000/SP (exemplo)", instagram: "https://instagram.com/example", facebook: "https://facebook.com/example", whatsapp: "https://wa.me/5511988887777" }),
  minimal: mk("minimal", "Carlos Mendes", "Corretor de Imóveis", "Imóveis Brasil", "#0e7490", { email: "carlos@imoveisbrasil.com.br", professionalRegistrationType: "CRECI", professionalRegistration: "000000/SP (exemplo)", instagram: "https://instagram.com/example", whatsapp: "https://wa.me/5511977776666" }),
  modern: mk("modern", "Fernanda Lima", "Consultora de Negócios", "Lima Consultoria", "#5b45db", { email: "fernanda@limaconsultoria.com.br", instagram: "https://instagram.com/example", facebook: "https://facebook.com/example", whatsapp: "https://wa.me/5511966665555" }),
  classic: mk("classic", "Dr. Roberto Santos", "Médico Cardiologista", "Clínica Coração São Paulo", "#2c3e50", { email: "roberto@clinica.com.br", professionalRegistrationType: "CRM", professionalRegistration: "000000/SP (exemplo)", whatsapp: "https://wa.me/5511955554444" }),
  color: mk("color", "Juliana Pereira", "Consultora de Marketing", "Pereira Marketing", "#e74c3c", { email: "juliana@pereiramkt.com.br", instagram: "https://instagram.com/example", facebook: "https://facebook.com/example", whatsapp: "https://wa.me/5511944443333" }),
  banner: mk("banner", "Ricardo Alves", "Advogado Trabalhista", "Alves Advogados", "#8e44ad", { email: "ricardo@alvesadv.com.br", professionalRegistrationType: "OAB", professionalRegistration: "000000/SP (exemplo)", whatsapp: "https://wa.me/5511933332222" }),
  compact: mk("compact", "Patrícia Rocha", "Corretora de Imóveis", "Rocha Imóveis", "#16a085", { email: "patricia@rochaimoveis.com.br", professionalRegistrationType: "CRECI", professionalRegistration: "000000/SP (exemplo)", instagram: "https://instagram.com/example", facebook: "https://facebook.com/example", whatsapp: "https://wa.me/5511922221111" }),
  executive: mk("executive", "Dr. Marcos Teixeira", "Médico Ortopedista", "Teixeira Ortopedia", "#2980b9", { email: "marcos@teixeiraorto.com.br", professionalRegistrationType: "CRM", professionalRegistration: "000000/SP (exemplo)", whatsapp: "https://wa.me/5511911110000" }),
  studio: mk("studio", "Lucas Ferreira", "Designer de Produto", "Estúdio Horizonte", "#5b45db", { email: "lucas@estudiohorizonte.com.br", instagram: "https://instagram.com/example", facebook: "https://facebook.com/example", whatsapp: "https://wa.me/5511900009999" }),
  consulting: mk("consulting", "Mariana Gomes", "Consultora Financeira", "Gomes Consultoria", "#c0392b", { email: "mariana@gomesconsultoria.com.br", whatsapp: "https://wa.me/5511899998888" }),
  sales: mk("sales", "Bruno Costa", "Corretor de Imóveis", "Costa Imóveis", "#27ae60", { email: "bruno@costaimoveis.com.br", professionalRegistrationType: "CRECI", professionalRegistration: "000000/SP (exemplo)", instagram: "https://instagram.com/example", facebook: "https://facebook.com/example", whatsapp: "https://wa.me/5511888887777" }),
  monogram: mk("monogram", "Sofia Andrade", "Advogada Civil", "Andrade Advogados", "#34495e", { email: "sofia@andradeadv.com.br", professionalRegistrationType: "OAB", professionalRegistration: "000000/SP (exemplo)", whatsapp: "https://wa.me/5511777776666" }),
  editorial: mk("editorial", "Felipe Nunes", "Médico Pediatra", "Clínica Nunes Pediatria", "#7f8c8d", { email: "felipe@nunespediatria.com.br", professionalRegistrationType: "CRM", professionalRegistration: "000000/SP (exemplo)", instagram: "https://instagram.com/example", facebook: "https://facebook.com/example", whatsapp: "https://wa.me/5511666665555" }),
  tech: mk("tech", "Renata Farias", "Engenheira de Software", "Nuvem Exemplo Tecnologia", "#2563eb", { email: "renata@exemplo-tech.com.br", website: "https://exemplo-tech.com.br", linkedin: "https://linkedin.com/in/exemplo", whatsapp: "https://wa.me/5511990010001", x: "https://x.com/exemplo", github: "https://github.com/exemplo" }),
  finance: mk("finance", "Eduardo Martins", "Consultor Financeiro", "Martins Planejamento", "#0f766e", { email: "eduardo@exemplo-financas.com.br", website: "https://exemplo-financas.com.br", professionalRegistrationType: "CRC", professionalRegistration: "000000/SP (exemplo)", linkedin: "https://linkedin.com/in/exemplo", whatsapp: "https://wa.me/5511990010002" }),
  education: mk("education", "Prof. Helena Duarte", "Coordenadora Pedagógica", "Instituto Exemplo Saber", "#ca8a04", { email: "helena@exemplo-educacao.com.br", website: "https://exemplo-educacao.com.br", instagram: "https://instagram.com/exemplo", linkedin: "https://linkedin.com/in/exemplo", whatsapp: "https://wa.me/5511990010003" }),
  creative: mk("creative", "Lívia Barros", "Diretora de Arte", "Barros Criação", "#db2777", { email: "livia@exemplo-criativo.com.br", website: "https://exemplo-criativo.com.br", instagram: "https://instagram.com/exemplo", whatsapp: "https://wa.me/5511990010004", behance: "https://behance.net/exemplo", dribbble: "https://dribbble.com/exemplo" }),
  wellness: mk("wellness", "Paula Rezende", "Nutricionista", "Espaço Exemplo Bem-estar", "#059669", { email: "paula@exemplo-bemestar.com.br", website: "https://exemplo-bemestar.com.br", professionalRegistrationType: "CRN", professionalRegistration: "000000/SP (exemplo)", instagram: "https://instagram.com/exemplo", whatsapp: "https://wa.me/5511990010005" }),
  developer: mk("developer", "Thiago Lopes", "Desenvolvedor Full Stack", "Lopes Software", "#4f46e5", { email: "thiago@exemplo-dev.com.br", website: "https://exemplo-dev.com.br", linkedin: "https://linkedin.com/in/exemplo", whatsapp: "https://wa.me/5511990010006", x: "https://x.com/exemplo", github: "https://github.com/exemplo" }),
  architect: mk("architect", "Isabela Tavares", "Arquiteta", "Tavares Arquitetura", "#78716c", { email: "isabela@exemplo-arquitetura.com.br", website: "https://exemplo-arquitetura.com.br", instagram: "https://instagram.com/exemplo", whatsapp: "https://wa.me/5511990010007" }),
  growth: mk("growth", "Diego Pacheco", "Especialista em Marketing", "Pacheco Growth", "#ea580c", { email: "diego@exemplo-marketing.com.br", website: "https://exemplo-marketing.com.br", instagram: "https://instagram.com/exemplo", linkedin: "https://linkedin.com/in/exemplo", whatsapp: "https://wa.me/5511990010008" }),
  property: mk("property", "André Moreira", "Consultor Imobiliário", "Moreira Negócios Imobiliários", "#0e7490", { email: "andre@exemplo-imobiliario.com.br", website: "https://exemplo-imobiliario.com.br", professionalRegistrationType: "CRECI", professionalRegistration: "000000/SP (exemplo)", instagram: "https://instagram.com/exemplo", whatsapp: "https://wa.me/5511990010009" }),
  counsel: mk("counsel", "Larissa Campos", "Advogada", "Campos Advocacia", "#1e3a5f", { email: "larissa@exemplo-juridico2.com.br", website: "https://exemplo-juridico2.com.br", professionalRegistrationType: "OAB", professionalRegistration: "000000/SP (exemplo)", linkedin: "https://linkedin.com/in/exemplo", whatsapp: "https://wa.me/5511990010010" }),
  clinic: mk("clinic", "Dr. Vinícius Prado", "Clínico Geral", "Clínica Exemplo Cuidar", "#0284c7", { email: "vinicius@exemplo-clinica.com.br", website: "https://exemplo-clinica.com.br", professionalRegistrationType: "CRM", professionalRegistration: "000000/SP (exemplo)", instagram: "https://instagram.com/exemplo", whatsapp: "https://wa.me/5511990010011" }),
  portfolio: mk("portfolio", "Natália Freire", "Designer de Marcas", "Freire Design", "#7c3aed", { email: "natalia@exemplo-portfolio.com.br", website: "https://portfolio.exemplo.com.br", instagram: "https://instagram.com/exemplo", whatsapp: "https://wa.me/5511990010012", behance: "https://behance.net/exemplo", dribbble: "https://dribbble.com/exemplo" }),
  "signature-luxe": mk("signature-luxe", "Gustavo Ribeiro", "Consultor Executivo", "Ribeiro Consultoria", "#7d3c98", { email: "gustavo@ribeiroconsultoria.com.br", instagram: "https://instagram.com/example", whatsapp: "https://wa.me/5511555554444" }),
  "brand-desk": mk("brand-desk", "Alessandra Moura", "Contadora", "Moura Contabilidade", "#1abc9c", { email: "alessandra@mouraseguros.com.br", professionalRegistrationType: "CRC", professionalRegistration: "000000/SP (exemplo)", instagram: "https://instagram.com/example", facebook: "https://facebook.com/example", whatsapp: "https://wa.me/5511444443333" }),
  "corporativo-aviso": mk("corporativo-aviso", "Ana Silva", "Advogada", "Silva & Associados", "#1a3a5a", { email: "ana@silvaadv.com.br", professionalRegistrationType: "OAB", professionalRegistration: "000000/SP (exemplo)", whatsapp: "https://wa.me/5511988887777" }),
  "executivo-cta": mk("executivo-cta", "Dr. Marcos Teixeira", "Médico Ortopedista", "Teixeira Ortopedia", "#2980b9", { email: "marcos@teixeiraorto.com.br", professionalRegistrationType: "CRM", professionalRegistration: "000000/SP (exemplo)", whatsapp: "https://wa.me/5511911110000" }),
  promocao: mk("promocao", "Juliana Pereira", "Consultora de Marketing", "Pereira Marketing", "#e74c3c", { email: "juliana@pereiramkt.com.br", instagram: "https://instagram.com/example", facebook: "https://facebook.com/example", whatsapp: "https://wa.me/5511944443333" }),
  evento: mk("evento", "Ricardo Alves", "Advogado Trabalhista", "Alves Advogados", "#8e44ad", { email: "ricardo@alvesadv.com.br", professionalRegistrationType: "OAB", professionalRegistration: "000000/SP (exemplo)", whatsapp: "https://wa.me/5511933332222" }),
  atendimento: mk("atendimento", "Paula Rezende", "Nutricionista", "Espaço Exemplo Bem-estar", "#059669", { email: "paula@exemplo-bemestar.com.br", website: "https://exemplo-bemestar.com.br", professionalRegistrationType: "CRN", professionalRegistration: "000000/SP (exemplo)", instagram: "https://instagram.com/exemplo", whatsapp: "https://wa.me/5511990010005" }),
  vagas: mk("vagas", "Bruno Costa", "Corretor de Imóveis", "Costa Imóveis", "#27ae60", { email: "bruno@costaimoveis.com.br", professionalRegistrationType: "CRECI", professionalRegistration: "000000/SP (exemplo)", instagram: "https://instagram.com/example", facebook: "https://facebook.com/example", whatsapp: "https://wa.me/5511888887777" }),
  "marca-empilhada": mk("marca-empilhada", "Lucas Ferreira", "Designer de Produto", "Estúdio Horizonte", "#5b45db", { email: "lucas@estudiohorizonte.com.br", instagram: "https://instagram.com/example", facebook: "https://facebook.com/example", whatsapp: "https://wa.me/5511900009999" }),
  "loja-local": mk("loja-local", "André Moreira", "Consultor Imobiliário", "Moreira Negócios Imobiliários", "#0e7490", { email: "andre@exemplo-imobiliario.com.br", website: "https://exemplo-imobiliario.com.br", professionalRegistrationType: "CRECI", professionalRegistration: "000000/SP (exemplo)", instagram: "https://instagram.com/exemplo", whatsapp: "https://wa.me/5511990010009" }),
};
export const demo = demoDemos.modern;
export const emptySignature: SignatureData = {
  name: "", role: "", company: "", phone: "", email: "", website: "", address: "", cnpj: "", cep: "",
  professionalRegistrationType: undefined, professionalRegistration: "", professionalRegistrationUf: "", professionalRegistrationRqe: "", legalNotice: "",
  professionId: "", ctaLabel: "", ctaType: "link", ctaUrl: "", signoff: "",
  instagram: "", facebook: "", linkedin: "", whatsapp: "", whatsappMessage: "", whatsappSameAsPhone: false, youtube: "", tiktok: "", x: "", github: "", behance: "", dribbble: "", photo: "", logo: "", color: "#5b45db", template: "essential",
  templateBlocos: undefined, blocos: undefined, modoCompativel: false, logoEscuro: undefined,
  utm: false, utmSource: "assinatura", utmMedium: "email", utmCampaign: "",
  bannerImagem: undefined, bannerTitulo: "", bannerSubtitulo: "", bannerBotao: "", bannerUrl: "", bannerAlt: "",
  selos: undefined, galeria: undefined,
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
    address: data.address, cnpj: data.cnpj, cep: data.cep,
    professionalRegistrationType: data.professionalRegistrationType, professionalRegistration: data.professionalRegistration, professionalRegistrationUf: data.professionalRegistrationUf ?? "", professionalRegistrationRqe: data.professionalRegistrationRqe ?? "", legalNotice: data.legalNotice,
    professionId: data.professionId ?? "", signoff: data.signoff ?? "",
    // CTA mantido nos dados; renderização/exportação respeitam o plano (verificação existente).
    ctaLabel: data.ctaLabel ?? "", ctaType: data.ctaType ?? "link", ctaUrl: data.ctaUrl ?? "",
    whatsappMessage: data.whatsappMessage ?? "",
    whatsappSameAsPhone: data.whatsappSameAsPhone ?? false,
  };
}
