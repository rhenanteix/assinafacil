export type BlockType =
  | "identidade"
  | "divisor"
  | "dados"
  | "contatos"
  | "redes"
  | "botoes"
  | "banner"
  | "selos"
  | "galeria"
  | "aviso";

export type BlocoPosicao = "esquerda" | "topo" | "empilhada";

export interface BlocoIdentidade {
  tipo: "identidade";
  logo?: string;
  logoEscuro?: string;
  foto?: string;
  posicao: BlocoPosicao;
  fotoAnel?: string;
  largura?: number;
  altura?: number;
}

export interface BlocoDivisor {
  tipo: "divisor";
  orientacao: "vertical" | "horizontal" | "destaque";
  cor?: string;
  espessura?: number;
}

export interface BlocoDados {
  tipo: "dados";
  nome: string;
  credenciais?: string;
  cargo?: string;
  empresa?: string;
  linhaExtra?: string;
}

export interface BlocoContatoItem {
  chave: "telefone" | "whatsapp" | "email" | "site" | "endereco";
  valor: string;
  rotulo?: string;
}

export interface BlocoContatos {
  tipo: "contatos";
  rotulos: boolean;
  itens: BlocoContatoItem[];
}

export interface BlocoRedes {
  tipo: "redes";
  formato: "circular" | "quadrado";
}

export interface BlocoBotaoUm {
  tipo: "botoes";
  modo: "um";
  label: string;
  url: string;
  larguraTotal: boolean;
  preenchido: boolean;
}

export interface BlocoBotoesLadoALado {
  tipo: "botoes";
  modo: "dois-lado-a-lado";
  b1: { label: string; url: string; preenchido: boolean };
  b2: { label: string; url: string; preenchido: boolean };
}

export interface BlocoBotoesResposta {
  tipo: "botoes";
  modo: "dois-resposta";
  sim: { label: string; url: string };
  nao: { label: string; url: string };
}

export type BlocoBotoes = BlocoBotaoUm | BlocoBotoesLadoALado | BlocoBotoesResposta;

export interface BlocoBanner {
  tipo: "banner";
  variante: "texto" | "imagem";
  titulo?: string;
  subtitulo?: string;
  botao?: string;
  url?: string;
  imagem?: string;
  alt?: string;
  bgcolor?: string;
  corTexto?: string;
}

export interface BlocoSelos {
  tipo: "selos";
  itens: Array<{ imagem: string; url?: string; alt?: string }>;
}

export interface BlocoGaleria {
  tipo: "galeria";
  itens: Array<{ imagem: string; url?: string; alt?: string }>;
}

export interface BlocoAviso {
  tipo: "aviso";
  texto: string;
}

export type Bloco =
  | BlocoIdentidade
  | BlocoDivisor
  | BlocoDados
  | BlocoContatos
  | BlocoRedes
  | BlocoBotoes
  | BlocoBanner
  | BlocoSelos
  | BlocoGaleria
  | BlocoAviso;

export interface ModeloBlocos {
  id: string;
  label: string;
  pro: boolean;
  exclusive?: boolean;
  cor: string;
  serif?: boolean;
  blocos: Bloco[];
  compativel?: boolean;
  descricao?: string;
}

export const MAX_SELOS = 4;
export const MAX_GALERIA = 6;
export const MAX_HTML_KB = 20;
export const MAX_IMAGES_KB = 200;
