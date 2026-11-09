import type { Bloco, ModeloBlocos } from "./types";
export type { Bloco };

// TODO [CONFIRMAR]: nomes finais dos 8 estilos em PT-BR. Valores provisórios abaixo.
const CORP_COM_AVISO = "corporativo-aviso";
const EXEC_CTA = "executivo-cta";
const PROMOCAO = "promocao";
const EVENTO = "evento";
const ATENDIMENTO = "atendimento";
const VAGAS = "vagas";
const MARCA_EMPINHADA = "marca-empilhada";
const LOJA_LOCAL = "loja-local";

const T = "#1a3a5a"; // azul marinho corporativo
const P = "#0e7490"; // azul promoção
const V = "#27ae60"; // verde vagas
const L = "#c0392b"; // vermelho loja

export const modelBlocos: ModeloBlocos[] = [
  {
    id: CORP_COM_AVISO,
    label: "Corporativo com aviso", // TODO [CONFIRMAR] nome final
    pro: true,
    cor: T,
    descricao: "Logo à esquerda, divisor vertical, nome e cargo, contatos com rótulo, linha horizontal e aviso legal.",
    blocos: [
      { tipo: "identidade", logo: undefined, foto: undefined, posicao: "esquerda" },
      { tipo: "divisor", orientacao: "vertical", cor: T },
      { tipo: "dados", nome: "", cargo: "", empresa: "", credenciais: undefined },
      { tipo: "divisor", orientacao: "horizontal", cor: T, espessura: 2 },
      { tipo: "contatos", rotulos: true, itens: [] },
      { tipo: "divisor", orientacao: "horizontal", cor: T, espessura: 1 },
      { tipo: "aviso", texto: "" },
    ],
  },
  {
    id: EXEC_CTA,
    label: "Executivo com CTA", // TODO [CONFIRMAR] nome final
    pro: true,
    cor: T,
    descricao: "Foto circular com anel de cor, linha de área de atuação, contatos com rótulo, botão largo e selos opcionais.",
    blocos: [
      { tipo: "identidade", foto: undefined, posicao: "empilhada", fotoAnel: T },
      { tipo: "dados", nome: "", cargo: "", empresa: "", linhaExtra: undefined },
      { tipo: "contatos", rotulos: true, itens: [] },
      { tipo: "botoes", modo: "um", label: "Agendar reunião", url: "", larguraTotal: true, preenchido: true },
      { tipo: "selos", itens: [] },
    ],
  },
  {
    id: PROMOCAO,
    label: "Promoção", // TODO [CONFIRMAR] nome final
    pro: true,
    cor: P,
    descricao: "Logo, divisor, contatos, linha e banner grande com botão.",
    blocos: [
      { tipo: "identidade", logo: undefined, foto: undefined, posicao: "esquerda" },
      { tipo: "divisor", orientacao: "vertical", cor: P },
      { tipo: "dados", nome: "", cargo: "", empresa: "" },
      { tipo: "contatos", rotulos: false, itens: [] },
      { tipo: "divisor", orientacao: "horizontal", cor: P },
      { tipo: "banner", variante: "texto", titulo: "", subtitulo: "", botao: "", url: "", bgcolor: P },
    ],
  },
  {
    id: EVENTO,
    label: "Evento", // TODO [CONFIRMAR] nome final
    pro: true,
    cor: P,
    descricao: "Banner com data, local, estande e palestra, mais dois botões.",
    blocos: [
      { tipo: "banner", variante: "texto", titulo: "", subtitulo: "", botao: "", url: "", bgcolor: P },
      { tipo: "dados", nome: "", cargo: "", empresa: "" },
      { tipo: "contatos", rotulos: true, itens: [] },
      { tipo: "botoes", modo: "dois-lado-a-lado",
        b1: { label: "Agendar reunião", url: "", preenchido: true },
        b2: { label: "Adicionar ao calendário", url: "", preenchido: false } },
    ],
  },
  {
    id: ATENDIMENTO,
    label: "Atendimento", // TODO [CONFIRMAR] nome final
    pro: true,
    cor: T,
    descricao: "Linha de protocolo e horário de atendimento (Brasília), contatos e dois botões de resposta.",
    blocos: [
      { tipo: "dados", nome: "", cargo: "", empresa: "", linhaExtra: undefined },
      { tipo: "contatos", rotulos: true, itens: [] },
      { tipo: "divisor", orientacao: "horizontal", cor: T },
      { tipo: "botoes", modo: "dois-resposta",
        sim: { label: "Resolvi", url: "" },
        nao: { label: "Preciso de ajuda", url: "" } },
    ],
  },
  {
    id: VAGAS,
    label: "Vagas", // TODO [CONFIRMAR] nome final
    pro: true,
    cor: V,
    descricao: "Logo, contatos, banner Estamos contratando, botão Ver vagas e selos opcionais.",
    blocos: [
      { tipo: "identidade", logo: undefined, foto: undefined, posicao: "esquerda" },
      { tipo: "dados", nome: "", cargo: "", empresa: "" },
      { tipo: "contatos", rotulos: true, itens: [] },
      { tipo: "banner", variante: "texto", titulo: "Estamos contratando", subtitulo: "", botao: "Ver vagas", url: "", bgcolor: V },
      { tipo: "selos", itens: [] },
    ],
  },
  {
    id: MARCA_EMPINHADA,
    label: "Marca empilhada", // TODO [CONFIRMAR] nome final
    pro: true,
    cor: T,
    descricao: "Logo no topo, dados empilhados, redes circulares e botão em pílula.",
    blocos: [
      { tipo: "identidade", logo: undefined, foto: undefined, posicao: "topo" },
      { tipo: "dados", nome: "", cargo: "", empresa: "" },
      { tipo: "redes", formato: "circular" },
      { tipo: "botoes", modo: "um", label: "", url: "", larguraTotal: false, preenchido: true },
    ],
  },
  {
    id: LOJA_LOCAL,
    label: "Loja local", // TODO [CONFIRMAR] nome final
    pro: true,
    cor: L,
    descricao: "Foto circular, nome em maiúsculas, linha de destaque, endereço, WhatsApp, redes e tira de miniaturas.",
    blocos: [
      { tipo: "identidade", foto: undefined, posicao: "esquerda" },
      { tipo: "dados", nome: "", cargo: "", empresa: "", linhaExtra: undefined },
      { tipo: "divisor", orientacao: "destaque", cor: L },
      { tipo: "contatos", rotulos: true, itens: [] },
      { tipo: "redes", formato: "circular" },
      { tipo: "galeria", itens: [] },
    ],
  },
] as const;

export function getModeloBlocos(id: string) {
  return modelBlocos.find(m => m.id === id) ?? null;
}

export function listModelosBlocos() {
  return modelBlocos;
}

export type ModeloBlocosId = (typeof modelBlocos)[number]["id"];
