import assert from "node:assert/strict";
import test from "node:test";
import { renderSignature } from "@/lib/utils/signature";
import { demoDemos, emptySignature, type SignatureData } from "@/types/signature";
import { listModelosBlocos, type Bloco } from "@/lib/blocks/registry";
import { renderBlocosHtml } from "@/lib/blocks/render";

const MAX_HTML_KB = 20;

const fullData: SignatureData = {
  ...emptySignature,
  name: "Ana Silva",
  role: "Advogada",
  company: "Silva & Associados",
  phone: "+55 11 99999-0000",
  email: "ana@silvaadv.com.br",
  website: "https://silvaadv.com.br",
  address: "São Paulo, SP",
  cnpj: "",
  cep: "01310-100",
  professionalRegistrationType: "OAB",
  professionalRegistration: "000000/SP",
  professionalRegistrationUf: "SP",
  legalNotice: "Texto de aviso legal da empresa.",
  whatsapp: "https://wa.me/5511999990000",
  instagram: "https://instagram.com/example",
  facebook: "https://facebook.com/example",
  linkedin: "https://linkedin.com/in/example",
  color: "#1a3a5a",
  template: "essential",
};

const blocosComImagens: Bloco[] = [
  { tipo: "identidade", logo: "https://res.cloudinary.com/demo/image/upload/logo.png", foto: "https://res.cloudinary.com/demo/image/upload/foto.png", posicao: "esquerda", fotoAnel: "#1a3a5a" },
  { tipo: "divisor", orientacao: "vertical", cor: "#1a3a5a" },
  { tipo: "dados", nome: "Ana Silva", cargo: "Advogada", empresa: "Silva & Associados", credenciais: "OAB", linhaExtra: "Direito civil" },
  { tipo: "contatos", rotulos: true, itens: [
    { chave: "telefone", valor: "+55 11 99999-0000", rotulo: "Tel" },
    { chave: "whatsapp", valor: "https://wa.me/5511999990000", rotulo: "WhatsApp" },
    { chave: "email", valor: "ana@silvaadv.com.br", rotulo: "E-mail" },
    { chave: "site", valor: "https://silvaadv.com.br", rotulo: "Site" },
    { chave: "endereco", valor: "São Paulo, SP", rotulo: "End." },
  ]},
  { tipo: "redes", formato: "circular" },
  { tipo: "botoes", modo: "um", label: "Agendar reunião", url: "https://silvaadv.com.br/agendar", larguraTotal: true, preenchido: true },
  { tipo: "banner", variante: "texto", titulo: "Promoção", subtitulo: "Desconto especial", botao: "Saiba mais", url: "https://silvaadv.com.br/promo", bgcolor: "#1a3a5a" },
  { tipo: "banner", variante: "imagem", imagem: "https://res.cloudinary.com/demo/image/upload/banner.png", alt: "Banner promocional", bgcolor: "#1a3a5a" },
  { tipo: "selos", itens: [
    { imagem: "https://res.cloudinary.com/demo/image/upload/selo1.png", url: "https://silvaadv.com.br/selo1", alt: "Selo 1" },
    { imagem: "https://res.cloudinary.com/demo/image/upload/selo2.png", alt: "Selo 2" },
  ]},
  { tipo: "galeria", itens: [
    { imagem: "https://res.cloudinary.com/demo/image/upload/gal1.png", url: "https://silvaadv.com.br/gal1", alt: "Miniatura 1" },
    { imagem: "https://res.cloudinary.com/demo/image/upload/gal2.png", alt: "Miniatura 2" },
  ]},
  { tipo: "aviso", texto: "Texto-modelo: revise com o seu conselho ou profissional da área." },
];

function blocosParaDados(blocos: Bloco[]): Record<string, unknown> {
  const d: Record<string, unknown> = { ...fullData };
  d.blocos = JSON.stringify(blocos);
  d.templateBlocos = "corporativo-aviso";
  return d;
}

function proibidoHtml(html: string): string[] {
  const problemas: string[] = [];
  if (/<style\b/i.test(html)) problemas.push("<style>");
  if (/<script\b/i.test(html)) problemas.push("<script>");
  if (/<svg\b/i.test(html)) problemas.push("<svg>");
  if (/background-image\s*:/i.test(html)) problemas.push("background-image");
  if (/display\s*:\s*flex/i.test(html)) problemas.push("display:flex");
  if (/display\s*:\s*grid/i.test(html)) problemas.push("display:grid");
  if (/position\s*:\s*(absolute|relative|fixed|sticky)/i.test(html)) problemas.push("position");
  if (/float\s*:\s*(left|right)/i.test(html)) problemas.push("float");
  if (/<!--\[if/i.test(html)) problemas.push("comentário condicional");
  if (/<vml|<v:/i.test(html)) problemas.push("VML");
  // padding em <a>
  const aTags = html.match(/<a\b[^>]*>/gi) ?? [];
  for (const a of aTags) {
    if (/padding\s*:/i.test(a)) problemas.push(`padding em <a>: ${a.slice(0, 80)}`);
  }
  return problemas;
}

function imagensSemDimensoes(html: string): string[] {
  const problemas: string[] = [];
  const imgTags = html.match(/<img\b[^>]*>/gi) ?? [];
  for (const img of imgTags) {
    if (!/width\s*=\s*"\d+"/i.test(img)) problemas.push(`img sem width: ${img.slice(0, 80)}`);
    if (!/height\s*=\s*"\d+"/i.test(img)) problemas.push(`img sem height: ${img.slice(0, 80)}`);
    if (!/alt\s*=/i.test(img)) problemas.push(`img sem alt: ${img.slice(0, 80)}`);
  }
  return problemas;
}

function caracteresNaoAsciiSemEntidade(html: string): string[] {
  const problemas: string[] = [];
  // Remove entidades HTML (&...; ou &#...;) e verifica se resta caractere não ASCII cru.
  const semEntidades = html.replace(/&[#a-zA-Z0-9]+;/g, "");
  const naoAscii = semEntidades.match(/[\u0080-\uFFFF]/g) ?? [];
  for (const ch of naoAscii) {
    problemas.push(`caractere não ASCII sem entidade: ${ch} (U+${ch.charCodeAt(0).toString(16)})`);
  }
  return problemas;
}

test("compat lint: modelos legacy passam nas regras de compatibilidade", () => {
  for (const [id, demo] of Object.entries(demoDemos)) {
    const html = renderSignature(demo, true, "pt-BR");
    const problemas = [...proibidoHtml(html), ...imagensSemDimensoes(html), ...caracteresNaoAsciiSemEntidade(html)];
    const kb = new TextEncoder().encode(html).length / 1024;
    if (kb > MAX_HTML_KB) problemas.push(`HTML excede ${MAX_HTML_KB} KB (${kb.toFixed(1)} KB)`);
    assert.deepEqual(problemas, [], `Modelo ${id} falhou no compat lint: ${problemas.join(", ")}`);
  }
});

test("compat lint: modelos de blocos passam nas regras de compatibilidade", () => {
  const dados = blocosParaDados(blocosComImagens);
  const html = renderSignature(dados as unknown as SignatureData, true, "pt-BR");
  const problemas = [...proibidoHtml(html), ...imagensSemDimensoes(html), ...caracteresNaoAsciiSemEntidade(html)];
  const kb = new TextEncoder().encode(html).length / 1024;
  if (kb > MAX_HTML_KB) problemas.push(`HTML excede ${MAX_HTML_KB} KB (${kb.toFixed(1)} KB)`);
  assert.deepEqual(problemas, [], `Blocos falharam no compat lint: ${problemas.join(", ")}`);
});

test("compat lint: modo compatível remove banner de imagem, galeria, selos e dois botões lado a lado", () => {
  const dados = blocosParaDados(blocosComImagens);
  const { html } = renderBlocosHtml(
    { cor: "#1a3a5a", serif: false, compativel: true },
    blocosComImagens,
    dados,
    "pt-BR",
  );
  assert.doesNotMatch(html, /banner\.png/);
  assert.doesNotMatch(html, /gal1\.png|gal2\.png/);
  assert.doesNotMatch(html, /selo1\.png|selo2\.png/);
  // modo compatível não deve ter dois botões lado a lado (o preset corporativo-aviso não tem, mas validamos o filtro)
  assert.doesNotMatch(html, /dois-lado-a-lado/);
});

test("compat lint: caracteres acentuados são entidades", () => {
  const dados: Record<string, unknown> = { ...fullData, name: "José da Silva", company: "Café & Cia Ltda", address: "Rua das Flores, São Paulo – SP" };
  const html = renderSignature(dados as unknown as SignatureData, true, "pt-BR");
  const problemas = caracteresNaoAsciiSemEntidade(html);
  assert.deepEqual(problemas, [], `Caracteres não entidades: ${problemas.join(", ")}`);
});
