// Lista de conselhos profissionais em dados. Adicionar um conselho novo não exige mexer em componentes.
// Cada item: id (chave técnica), label (exibição), ufObrigatoria, rqe (se o conselho usa RQE), exemplo.
export type ConselhoProfissional = {
  id: string;
  label: string;
  ufObrigatoria: boolean;
  rqe: boolean;
  exemplo: string;
};

export const conselhosProfissionais: ConselhoProfissional[] = [
  { id: "CRECI", label: "CRECI", ufObrigatoria: true, rqe: false, exemplo: "123456/SP" },
  { id: "OAB", label: "OAB", ufObrigatoria: true, rqe: false, exemplo: "123.456/SP" },
  { id: "CRM", label: "CRM", ufObrigatoria: true, rqe: true, exemplo: "123456/SP" },
  { id: "CRO", label: "CRO", ufObrigatoria: true, rqe: false, exemplo: "12345/SP" },
  { id: "CRP", label: "CRP", ufObrigatoria: true, rqe: false, exemplo: "12/123456" },
  { id: "CRN", label: "CRN", ufObrigatoria: true, rqe: false, exemplo: "12345/SP" },
  { id: "CRC", label: "CRC", ufObrigatoria: true, rqe: false, exemplo: "123.456-7/SP" },
  { id: "CAU", label: "CAU", ufObrigatoria: true, rqe: false, exemplo: "A123456-7" },
  { id: "CREA", label: "CREA", ufObrigatoria: true, rqe: false, exemplo: "123456/SP" },
  { id: "CREF", label: "CREF", ufObrigatoria: true, rqe: false, exemplo: "123456-G/SP" },
  { id: "OUTRO", label: "Outro", ufObrigatoria: false, rqe: false, exemplo: "123456" },
];

export function getConselho(id: string) {
  return conselhosProfissionais.find(c => c.id === id) ?? null;
}

// Exibição padronizada: "CRM-SP 123456 | RQE 12345"
export function formatarRegistro(conselhoId: string, numero: string, uf: string, rqe?: string) {
  const conselho = getConselho(conselhoId);
  if (!conselho) return numero;
  const sufixo = conselho.ufObrigatoria && uf ? `-${uf.toUpperCase()}` : "";
  const parte = `${conselho.label}${sufixo} ${numero}`;
  if (conselho.rqe && rqe) return `${parte} | RQE ${rqe}`;
  return parte;
}

export const ufsBrasileiras = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MG", "MS", "MT",
  "PA", "PB", "PA", "PE", "PI", "PR", "RJ", "RN", "RS", "RO", "RR", "SC", "SE", "SP", "TO",
].sort((a, b) => a.localeCompare(b));
