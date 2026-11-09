// Biblioteca de textos-modelo editáveis para rodapé de assinatura.
// Cada aviso vem marcado como "texto-modelo: revise com o seu conselho ou profissional da área".
// Nunca promete conformidade legal ou regulatória. [CONFIRMAR: revisão por profissional de cada área antes de publicar]

export type AvisoModelo = {
  id: string;
  label: string;
  texto: string;
  profissoes?: string[]; // ids de profissões para as quais se aplica (vazio = geral)
};

const disclaimer = "\n\nTexto-modelo: revise com o seu conselho ou profissional da área antes de usar. Não garante conformidade legal ou regulatória.";

export const avisosModelo: AvisoModelo[] = [
  {
    id: "confidencialidade-geral",
    label: "Confidencialidade geral",
    texto: "Esta mensagem e seus anexos são destinados exclusivamente ao(a) destinatário(a) informado(a) e podem conter informações confidenciais ou privilegiadas. Se você recebeu esta mensagem por engano, favor notificar o remetente imediatamente e excluir o conteúdo." + disclaimer,
    profissoes: [],
  },
  {
    id: "lgpd",
    label: "LGPD - Proteção de dados pessoais",
    texto: "Seus dados pessoais são tratados em conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018). Para exercer seus direitos de acesso, correção ou exclusão, entre em contato pelo canal indicado nesta assinatura." + disclaimer,
    profissoes: [],
  },
  {
    id: "saude-emergencia",
    label: "Saúde - não use e-mail para emergências",
    texto: "Não utilize este e-mail para emergências ou casos urgentes. Em caso de urgência, procure atendimento presencial ou ligue para os serviços de emergência (190 ou 192)." + disclaimer,
    profissoes: ["saude"],
  },
  {
    id: "advocacia-sigilo",
    label: "Advocacia - sigilo profissional",
    texto: "Esta comunicação é protegida pelo sigilo profissional da advocacia e destina-se exclusivamente ao(a) seu(sua) destinatário(a). Qualquer reprodução ou divulgação não autorizada é vedada." + disclaimer,
    profissoes: ["advogado"],
  },
  {
    id: "contabilidade",
    label: "Contabilidade - informações fiscais",
    texto: "As informações contábeis e fiscais contidas nesta mensagem são de caráter confidencial e destinam-se exclusivamente ao(a) destinatário(a) indicado(a). Consulte seu contador antes de tomar decisões com base neste conteúdo." + disclaimer,
    profissoes: ["contabilidade"],
  },
  {
    id: "imobiliario",
    label: "Imobiliário - dados do imóvel e anunciante",
    texto: "As informações sobre imóveis, valores e disponibilidade estão sujeitas a alterações sem aviso prévio. Consulte o corretor responsável para confirmar dados antes de qualquer negociação." + disclaimer,
    profissoes: ["corretor-imoveis"],
  },
];

export function getAviso(id: string) {
  return avisosModelo.find(a => a.id === id) ?? null;
}

export function getAvisosParaProfissao(profissaoId: string) {
  return avisosModelo.filter(a => !a.profissoes || a.profissoes.length === 0 || a.profissoes.includes(profissaoId));
}
