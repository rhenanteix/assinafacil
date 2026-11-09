export function professionPacksEnabled() {
  // Feature flag: ativa os pacotes por profissão (fluxo, galeria e páginas /modelos/[profissao]).
  // Mantenha desativado em produção até validação completa.
  return process.env.NEXT_PUBLIC_PROFESSION_PACKS === "1";
}
