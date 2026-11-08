// Checklist de boas práticas por profissão, em dados.
// Exibido como "pontos de atenção" não bloqueantes (nunca "aprovado" ou "violação").
// Cada item tem data de revisão e fonte, para atualização futura. [CONFIRMAR: conteúdo revisado por profissional]

export type RegraChecklist = {
  id: string;
  label: string;
  profissoes: string[]; // ids de profissões para as quais se aplica
  avaliar: (data: any) => { ok: boolean; motivo: string };
  dataRevisao: string;
  fonte: string;
};

const guiiaDisclaimer = "Guia de boas práticas, não substitui a orientação do seu conselho.";

const exigeRegistro = ["advogado", "corretor-imoveis", "saude"];

export const regrasChecklist: RegraChecklist[] = [
  {
    id: "registro-profissional-faltante",
    label: "Registro profissional não informado",
    profissoes: exigeRegistro,
    avaliar: (data) => {
      const reg = data.professionalRegistration?.trim();
      const tipo = data.professionalRegistrationType;
      const ok = Boolean(reg && tipo);
      return { ok, motivo: ok ? "Registro profissional informado." : "Informe o registro profissional (conselho e número)." };
    },
    dataRevisao: "2026-11-01",
    fonte: "Orientações gerais de conselhos profissionais.",
  },
  {
    id: "crm-sem-rqe",
    label: "CRM informado sem RQE",
    profissoes: ["saude"],
    avaliar: (data) => {
      const tipo = data.professionalRegistrationType;
      const rqe = data.professionalRegistrationRqe?.trim();
      const ok = tipo !== "CRM" || Boolean(rqe);
      return { ok, motivo: ok ? "RQE informado para o CRM." : "Informe o RQE (Registro de Qualificação de Especialista) ao usar CRM." };
    },
    dataRevisao: "2026-11-01",
    fonte: "CFM - Resoluções sobre qualificação de especialista.",
  },
  {
    id: "cta-imperativo-advocacia",
    label: "CTA com apelo comercial imperativo (advocacia)",
    profissoes: ["advogado"],
    avaliar: (data) => {
      const label = (data.ctaLabel || "").toLowerCase();
      const imperativos = ["ligue já", "contrate agora", "compre agora", "chame já", "fale já"];
      const ok = !imperativos.some(p => label.includes(p));
      return { ok, motivo: ok ? "CTA sem apelo comercial imperativo." : "Evite expressões imperativas comerciais no CTA (ex.: 'ligue já', 'contrate agora')." };
    },
    dataRevisao: "2026-11-01",
    fonte: "Estatuto da Advocacia e OAB - publicidade jurídica.",
  },
  {
    id: "imagem-sem-alt",
    label: "Foto ou logo sem descrição alternativa",
    profissoes: exigindoTodos(),
    avaliar: (data) => {
      const ok = !data.photo && !data.logo;
      return { ok, motivo: ok ? "Sem imagem ou imagem com descrição." : "Adicione descrição alternativa (alt) à foto ou logo para acessibilidade." };
    },
    dataRevisao: "2026-11-01",
    fonte: "W3C - Web Content Accessibility Guidelines (WCAG) 2.1.",
  },
  {
    id: "assinatura-muito-larga",
    label: "Assinatura com muitos campos",
    profissoes: exigindoTodos(),
    avaliar: (data) => {
      const preenchidos = ["name","role","company","phone","email","address","cnpj","cep","whatsapp","website","professionalRegistration","legalNotice","signoff","instagram","facebook","linkedin"].filter(k => (data as any)[k]?.trim()).length;
      const ok = preenchidos <= 8;
      return { ok, motivo: ok ? "Quantidade adequada de campos." : "Considere reduzir o número de campos para manter a assinatura enxuta." };
    },
    dataRevisao: "2026-11-01",
    fonte: "Boas práticas de assinatura de e-mail corporativa.",
  },
];

function exigindoTodos() {
  return ["advogado", "corretor-imoveis", "saude", "freelancer-designer"];
}

export function getRegrasParaProfissao(profissaoId: string) {
  return regrasChecklist.filter(r => r.profissoes.includes(profissaoId));
}

export function avaliarRegras(profissaoId: string, data: any) {
  return getRegrasParaProfissao(profissaoId).map(r => ({ ...r, resultado: r.avaliar(data) }));
}

export const textoGuia = guiiaDisclaimer;
