import type { ProfessionPack } from "./types";
import type { SignatureData } from "@/types/signature";

// Ordem/nicho prioritário (confirmado, provisório até revisão de produto): 1) Corretor de imóveis, 2) Advogado, 3) Saúde, 4) Freelancer/Designer.
const baseContacts = [
  { key: "phone", label: "Telefone", optional: true, mask: "phone-br", validation: "phone-br", placeholder: "+55 (11) 99999-0000" },
  { key: "whatsapp", label: "WhatsApp", optional: true, mask: "phone-br", validation: "phone-br", placeholder: "+55 (11) 99999-0000" },
  { key: "email", label: "E-mail", optional: true, validation: "email", placeholder: "nome@exemplo.com.br" },
  { key: "website", label: "Site", optional: true, validation: "url", placeholder: "https://exemplo.com.br" },
  { key: "address", label: "Endereço", optional: true },
] as const;

const baseIdentity = [
  { key: "name", label: "Nome completo", validation: "required", placeholder: "Seu nome" },
  { key: "role", label: "Cargo", optional: true, placeholder: "Seu cargo" },
  { key: "company", label: "Empresa", optional: true, placeholder: "Nome da empresa" },
] as const;

const disclaimer = "Texto-modelo. Revise com o conselho ou profissional da área antes de usar. Não garante conformidade legal ou regulatória.";

function ex(data: ProfessionPack["example"]): ProfessionPack["example"] {
  // Exemplos 100% fictícios, domínios .com.br de demonstração, sem marcas reais.
  return { phone: "", website: "", address: "São Paulo, SP", cnpj: "", professionalRegistration: "000000/SP (exemplo)", professionalRegistrationType: "", legalNotice: "", instagram: "", facebook: "", linkedin: "", whatsapp: "https://wa.me/5511999990000", youtube: "", tiktok: "", x: "", github: "", photo: "", logo: "", ...data } as ProfessionPack["example"];
}

export const professionPacks: ProfessionPack[] = [
  {
    id: "corretor-imoveis",
    name: "Corretor de imóveis",
    nameEn: "Real estate agent",
    slug: "corretor-de-imoveis",
    fields: [
      ...baseIdentity,
      { key: "professionalRegistration", label: "CRECI", optional: true, registrationTypes: ["CRECI"], placeholder: "000000/SP" },
      ...baseContacts,
    ],
    cta: { label: "Agendar visita", labelEn: "Schedule a visit", type: "whatsapp" },
    notice: { text: "", editable: true },
    recommendedModels: ["sales", "property", "compact", "essential"] as SignatureData["template"][],
    example: ex({ name: "Marina Costa", role: "Corretora de imóveis", company: "Horizonte Negócios Imobiliários", email: "marina@exemplo-imoveis.com.br", professionalRegistrationType: "CRECI", template: "sales", color: "#087c66", cnpj: "11.222.333/0001-81" }),
    seo: {
      forWho: "Para corretores e consultores imobiliários que querem apresentar CRECI, contato e imobiliária com clareza em cada e-mail.",
      whyItWorks: "Reúne identificação profissional e canais de contato em um formato legível, com espaço para o CTA de visita.",
      forWhoEn: "For real estate agents who want clear professional identification and contact channels in every email.",
      whyItWorksEn: "Combines professional ID and contact channels in a readable layout with room for a visit CTA.",
    },
  },
  {
    id: "advogado",
    name: "Advogado",
    nameEn: "Lawyer",
    slug: "advogado",
    fields: [
      ...baseIdentity,
      { key: "professionalRegistration", label: "OAB/UF", optional: true, registrationTypes: ["OAB"], placeholder: "000000/SP" },
      ...baseContacts,
    ],
    cta: { label: "Falar com o escritório", labelEn: "Contact the office", type: "link" },
    notice: { text: "Aviso de confidencialidade: esta mensagem e seus anexos podem conter informações confidenciais destinadas exclusivamente ao destinatário. " + disclaimer, editable: true },
    recommendedModels: ["counsel", "monogram", "classic", "essential"] as SignatureData["template"][],
    example: ex({ name: "Rafael Nogueira", role: "Advogado", company: "Nogueira Assessoria Jurídica", email: "rafael@exemplo-juridico.com.br", professionalRegistrationType: "OAB", template: "monogram", color: "#34495e", legalNotice: "Aviso de confidencialidade: mensagem destinada ao destinatário. Texto-modelo, revise com o conselho ou profissional da área." }),
    seo: {
      forWho: "Para advogados e escritórios que precisam exibir OAB/UF e dados de contato com apresentação sóbria.",
      whyItWorks: "Destaca identificação profissional e inclui aviso-modelo editável, sem prometer conformidade automática.",
      forWhoEn: "For lawyers and firms that need a sober presentation of OAB/UF and contact details.",
      whyItWorksEn: "Highlights professional identification and includes an editable model notice without claiming automatic compliance.",
    },
  },
  {
    id: "saude",
    name: "Saúde",
    nameEn: "Healthcare",
    slug: "saude",
    fields: [
      ...baseIdentity,
      { key: "professionalRegistration", label: "Registro profissional (CRM/CRO/CRP/CRN)", optional: true, registrationTypes: ["CRM", "CRO", "CRP", "CRN"], placeholder: "000000/SP" },
      ...baseContacts,
    ],
    cta: { label: "Agendar consulta", labelEn: "Book an appointment", type: "whatsapp" },
    notice: { text: "Não use e-mail para emergências. Em caso de urgência, procure atendimento presencial ou ligue para os serviços de emergência. " + disclaimer, editable: true },
    recommendedModels: ["clinic", "wellness", "executive", "essential"] as SignatureData["template"][],
    example: ex({ name: "Dra. Camila Azevedo", role: "Médica", company: "Clínica Exemplo Vida", email: "camila@exemplo-saude.com.br", professionalRegistrationType: "CRM", template: "executive", color: "#2980b9", legalNotice: "Não use e-mail para emergências. Texto-modelo, revise com o conselho ou profissional da área." }),
    seo: {
      forWho: "Para profissionais de saúde que desejam compartilhar registro, contato e orientação básica de canal.",
      whyItWorks: "Organiza dados essenciais e traz aviso-modelo sobre uso do e-mail, sem substituir orientação profissional.",
      forWhoEn: "For healthcare professionals who want to share registration, contact details, and basic channel guidance.",
      whyItWorksEn: "Organizes key details and includes a model notice about email use, without replacing professional guidance.",
    },
  },
  {
    id: "freelancer-designer",
    name: "Freelancer/Designer",
    nameEn: "Freelancer/Designer",
    slug: "freelancer-designer",
    fields: [
      ...baseIdentity,
      { key: "website", label: "Portfólio", optional: true, validation: "url", placeholder: "https://portfolio.exemplo.com.br" },
      { key: "behance", label: "Behance", optional: true, validation: "url", placeholder: "https://behance.net/" },
      { key: "dribbble", label: "Dribbble", optional: true, validation: "url", placeholder: "https://dribbble.com/" },
      { key: "instagram", label: "Instagram", optional: true, validation: "url", placeholder: "https://instagram.com/" },
      ...baseContacts.filter(f => f.key !== "website"),
    ],
    cta: { label: "Ver portfólio", labelEn: "View portfolio", type: "link" },
    notice: { text: "", editable: true },
    recommendedModels: ["portfolio", "creative", "studio", "essential"] as SignatureData["template"][],
    example: ex({ name: "Beatriz Lins", role: "Designer freelancer", company: "Ateliê Lins Design", email: "beatriz@exemplo-design.com.br", website: "https://portfolio.exemplo.com.br", instagram: "https://instagram.com/exemplo", template: "studio", color: "#5b45db" }),
    seo: {
      forWho: "Para freelancers e designers que querem divulgar portfólio e canais profissionais em propostas e atendimentos.",
      whyItWorks: "Prioriza links de trabalho e contato com visual limpo, facilitando o próximo passo do cliente.",
      forWhoEn: "For freelancers and designers who want to share portfolio and professional channels.",
      whyItWorksEn: "Prioritizes work links and contact details in a clean layout that supports the next client step.",
    },
  },
];

export function getProfessionBySlug(slug: string) {
  return professionPacks.find(p => p.slug === slug);
}
export function getProfessionById(id: string) {
  return professionPacks.find(p => p.id === id);
}
