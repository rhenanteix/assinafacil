import type { Bloco, BlocoBanner, BlocoBotoes, BlocoDivisor, BlocoSelos } from "./types";
import { getModeloBlocos } from "./registry";

const escape = (value: string) => value.replace(/[&<>"']/g, (char) =>
  ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char] ?? char)
  .replace(/[\u0080-\uFFFF]/g, (ch) => `&#${ch.charCodeAt(0)};`);

const entity = (value: string) => value
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;")
  .replace(/'/g, "&#39;")
  .replace(/á/g, "&aacute;").replace(/Á/g, "&Aacute;")
  .replace(/à/g, "&agrave;").replace(/À/g, "&Agrave;")
  .replace(/â/g, "&acirc;").replace(/Â/g, "&Acirc;")
  .replace(/ã/g, "&atilde;").replace(/Ã/g, "&Atilde;")
  .replace(/é/g, "&eacute;").replace(/É/g, "&Eacute;")
  .replace(/ê/g, "&ecirc;").replace(/Ê/g, "&Ecirc;")
  .replace(/í/g, "&iacute;").replace(/Í/g, "&Iacute;")
  .replace(/ó/g, "&oacute;").replace(/Ó/g, "&Oacute;")
  .replace(/ô/g, "&ocirc;").replace(/Ô/g, "&Ocirc;")
  .replace(/õ/g, "&otilde;").replace(/Õ/g, "&Otilde;")
  .replace(/ú/g, "&uacute;").replace(/Ú/g, "&Uacute;")
  .replace(/ç/g, "&ccedil;").replace(/Ç/g, "&Ccedil;")
  .replace(/–/g, "&#8211;").replace(/—/g, "&#8212;")
  .replace(/“/g, "&#8220;").replace(/”/g, "&#8221;")
  .replace(/‘/g, "&#8216;").replace(/’/g, "&#8217;")
  .replace(/…/g, "&#8230;");

const safeUrl = (value: string | undefined): string => {
  if (!value) return "";
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.href : "";
  } catch { return ""; }
};

const utmUrl = (href: string, data: any): string => {
  if (!data?.utm) return href;
  if (!href.startsWith("https://")) return href;
  if (href.startsWith("https://wa.me/")) return href;
  try {
    const url = new URL(href);
    const src = String(data.utmSource ?? "assinatura");
    const med = String(data.utmMedium ?? "email");
    if (src) url.searchParams.set("utm_source", src);
    if (med) url.searchParams.set("utm_medium", med);
    if (data.utmCampaign) url.searchParams.set("utm_campaign", String(data.utmCampaign));
    return url.href;
  } catch { return href; }
};

const isHttpsImage = (value: string | undefined): boolean => {
  if (!value) return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && /\.(png|jpe?g)(\?|$)/i.test(url.pathname);
  } catch { return false; }
};

const fontStack = (serif: boolean) => serif ? "Georgia,serif" : "Arial,sans-serif";

const imgTag = (src: string, alt: string, width: number, height: number): string => {
  const s = escape(src);
  const a = entity(alt || "Imagem");
  return `<img src="${s}" alt="${a}" width="${width}" height="${height}" style="display:block;border:0;width:${width}px;height:${height}px">`;
};

const linkTag = (href: string, text: string, color: string, underline = false): string => {
  const h = escape(href);
  const t = entity(text);
  const dec = underline ? "underline" : "none";
  return `<a href="${h}" style="color:${color};text-decoration:${dec};font-family:Arial,sans-serif">${t}</a>`;
};

const renderIdentidade = (b: any, data: any, cor: string, serif: boolean): string => {
  const logo = String(data.logo ?? b.logo ?? "");
  const foto = String(data.photo ?? b.foto ?? "");
  const anel = String(b.fotoAnel ?? data.cor ?? cor);
  const largura = Number(b.largura ?? (foto ? 96 : 120));
  const altura = Number(b.altura ?? (foto ? 96 : 40));

  if (foto && isHttpsImage(foto)) {
    const src = escape(foto);
    const a = entity(String(data.name ?? "Foto de perfil"));
    let inner = `<td style="padding:0"><div style="display:inline-block">${imgTag(src, a, largura, largura)}</div></td>`;
    if (anel) {
      inner = `<td style="padding:2px;background:${escape(anel)}"><div style="display:inline-block">${imgTag(src, a, largura - 4, largura - 4)}</div></td>`;
    }
    return `<td width="${largura + 10}" style="padding:10px 10px 10px 10px">${inner}</td>`;
  }
  if (logo && isHttpsImage(logo)) {
    return `<td width="${altura + 10}" style="padding:10px 10px 10px 0">${imgTag(escape(logo), entity("Logo da empresa"), altura, altura)}</td>`;
  }
  return "";
};

const renderDivisor = (b: any, cor: string): string => {
  const c = escape(b.cor ?? cor);
  const esp = b.espessura ?? (b.orientacao === "destaque" ? 4 : 2);
  if (b.orientacao === "vertical") {
    return `<td width="12" style="padding:0"><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="12"><tbody><tr><td height="${esp}" style="background:${c};font-size:1px;line-height:1px"></td></tr></tbody></table></td>`;
  }
  return `<tr><td colspan="3" style="padding:8px 0"><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"><tbody><tr><td height="${esp}" style="background:${c};font-size:1px;line-height:1px"></td></tr></tbody></table></td></tr>`;
};

const renderDados = (b: any, data: any, cor: string, serif: boolean): string => {
  const nome = entity(String(data.name ?? b.nome ?? ""));
  const credenciais = entity(String(data.professionalRegistrationType ?? b.credenciais ?? ""));
  const cargo = entity(String(data.role ?? b.cargo ?? ""));
  const empresa = entity(String(data.company ?? b.empresa ?? ""));
  const linhaExtra = entity(String(b.linhaExtra ?? ""));
  const rows: string[] = [];
  if (nome) rows.push(`<div style="font-weight:bold;font-size:19px;line-height:23px;overflow-wrap:anywhere">${nome}${credenciais ? ` <span style="font-weight:normal;font-size:13px;line-height:16px">${credenciais}</span>` : ""}</div>`);
  if (cargo) rows.push(`<div style="font-size:12px;line-height:15px;margin-top:3px;overflow-wrap:anywhere">${cargo}</div>`);
  if (empresa) rows.push(`<div style="font-size:11px;line-height:14px;margin-top:1px;color:#475569;overflow-wrap:anywhere">${empresa}</div>`);
  if (linhaExtra) rows.push(`<div style="font-size:11px;line-height:14px;margin-top:4px;color:${escape(cor)};overflow-wrap:anywhere">${linhaExtra}</div>`);
  if (!rows.length) return "";
  return `<td style="padding:10px 0 10px 10px">${rows.join("")}</td>`;
};

const contatoHref = (chave: string, valor: string, data: any): string => {
  const v = valor.trim();
  if (!v) return "";
  if (chave === "telefone") return "tel:" + v.replace(/[^\d+]/g, "").replace(/(?!^)\+/g, "");
  if (chave === "whatsapp") {
    const w = v.startsWith("http") ? v : "https://wa.me/" + v.replace(/\D/g, "");
    return safeUrl(w) || "";
  }
  if (chave === "email") return "mailto:" + v;
  if (chave === "site" || chave === "endereco") return utmUrl(safeUrl(v) || "", data) || "";
  return "";
};

const renderContatos = (b: any, data: any, cor: string): string => {
  const rotulosMap: Record<string, string> = { telefone: "Tel", whatsapp: "WhatsApp", email: "E-mail", site: "Site", endereco: "End." };
  const valores: Record<string, string> = {
    telefone: String(data.phone ?? ""),
    whatsapp: String(data.whatsapp ?? ""),
    email: String(data.email ?? ""),
    site: String(data.website ?? ""),
    endereco: String(data.address ?? ""),
  };
  const itens: any[] = b.itens && b.itens.length ? b.itens : Object.entries(valores).filter(([, v]) => !!v).map(([chave, v]) => ({ chave, valor: v, rotulo: rotulosMap[chave] }));
  const lines: string[] = [];
  for (const item of itens) {
    if (!item.valor) continue;
    const href = contatoHref(item.chave, item.valor, data);
    if (!href) continue;
    const label = b.rotulos ? `${entity(item.rotulo ?? rotulosMap[item.chave])}: ` : "";
    const txt = entity(item.valor);
    lines.push(`<div style="font-size:12px;line-height:16px;overflow-wrap:anywhere">${label}${linkTag(href, txt, "#344054")}</div>`);
  }
  if (!lines.length) return "";
  return `<td style="padding:10px 0 10px 10px">${lines.join("")}</td>`;
};

const renderRedes = (b: any, data: any, cor: string): string => {
  const socialNetworks = [
    { key: "instagram", label: "Instagram" },
    { key: "facebook", label: "Facebook" },
    { key: "linkedin", label: "LinkedIn" },
    { key: "whatsapp", label: "WhatsApp" },
    { key: "youtube", label: "YouTube" },
    { key: "tiktok", label: "TikTok" },
    { key: "x", label: "X" },
    { key: "github", label: "GitHub" },
  ];
  const cells: string[] = [];
  for (const network of socialNetworks) {
    const value = String(data[network.key] ?? "");
    if (!value) continue;
    const href = safeUrl(value);
    if (!href) continue;
    const c = escape(cor);
    const t = entity(network.label);
    const h = escape(utmUrl(href, data));
    const size = 24;
    const letra = network.key.charAt(0).toUpperCase();
    if (b.formato === "circular") {
      cells.push(`<td style="padding:0 6px 0 0"><a href="${h}" aria-label="${t}" style="display:inline-block;width:${size}px;height:${size}px;line-height:${size}px;text-align:center;border-radius:50%;background:${c};color:#fff;font:700 10px Arial,sans-serif;text-decoration:none">${letra}</a></td>`);
    } else {
      cells.push(`<td style="padding:0 6px 0 0"><a href="${h}" aria-label="${t}" style="display:inline-block;width:${size}px;height:${size}px;line-height:${size}px;text-align:center;background:${c};color:#fff;font:700 10px Arial,sans-serif;text-decoration:none">${letra}</a></td>`);
    }
  }
  if (!cells.length) return "";
  return `<td style="padding:10px 0 10px 10px"><table role="presentation" cellpadding="0" cellspacing="0" border="0"><tbody><tr>${cells.join("")}</tr></tbody></table></td>`;
};

const botaoTag = (label: string, url: string, cor: string, textoCor: string, larguraTotal: boolean, preenchido: boolean, contornado: boolean): string => {
  const l = entity(label);
  const h = escape(url);
  const bg = preenchido ? escape(cor) : "transparent";
  const border = contornado ? `border:1.5px solid ${escape(cor)};` : "";
  const color = preenchido ? textoCor : escape(cor);
  const pad = larguraTotal ? "padding:10px 20px" : "padding:8px 16px";
  const radius = preenchido || contornado ? "border-radius:4px;" : "";
  const display = larguraTotal ? "display:block;width:100%;text-align:center" : "display:inline-block";
  return `<td style="padding:4px"><table role="presentation" cellpadding="0" cellspacing="0" border="0"><tbody><tr><td style="${pad};${radius}background:${bg}"><a href="${h}" style="color:${color};font-weight:bold;font-size:12px;line-height:15px;font-family:Arial,sans-serif;text-decoration:none;${display};${border}">${l}</a></td></tr></tbody></table></td>`;
};

const renderBotoes = (b: any, data: any, cor: string): string => {
  const textoCor = "#ffffff";
  const cells: string[] = [];
  if (b.modo === "um") {
    const label = entity(b.label ?? String(data.ctaLabel ?? ""));
    const url = utmUrl(safeUrl(b.url ?? data.ctaUrl ?? ""), data);
    if (!label || !url) return "";
    cells.push(botaoTag(label, url, cor, textoCor, b.larguraTotal, b.preenchido, false));
  } else if (b.modo === "dois-lado-a-lado") {
    const l1 = entity(b.b1.label ?? ""); const u1 = utmUrl(safeUrl(b.b1.url ?? ""), data);
    const l2 = entity(b.b2.label ?? ""); const u2 = utmUrl(safeUrl(b.b2.url ?? ""), data);
    if (l1 && u1) cells.push(botaoTag(l1, u1, cor, textoCor, true, b.b1.preenchido, false));
    if (l2 && u2) cells.push(botaoTag(l2, u2, cor, textoCor, true, b.b2.preenchido, true));
  } else if (b.modo === "dois-resposta") {
    const ls = entity(b.sim.label ?? "Resolvi"); const us = utmUrl(safeUrl(b.sim.url ?? ""), data);
    const ln = entity(b.nao.label ?? "Preciso de ajuda"); const un = utmUrl(safeUrl(b.nao.url ?? ""), data);
    if (ls && us) cells.push(botaoTag(ls, us, cor, textoCor, true, true, false));
    if (ln && un) cells.push(botaoTag(ln, un, cor, textoCor, true, false, true));
  }
  if (!cells.length) return "";
  return `<td style="padding:10px 0 10px 10px"><table role="presentation" cellpadding="0" cellspacing="0" border="0"><tbody><tr>${cells.join("")}</tr></tbody></table></td>`;
};

const renderBanner = (b: any, data: any, cor: string): string => {
  const bg = escape(b.bgcolor ?? cor);
  const txt = b.corTexto ? escape(b.corTexto) : "#ffffff";
  const titulo = entity(b.titulo ?? String(data.bannerTitulo ?? ""));
  const subtitulo = entity(b.subtitulo ?? String(data.bannerSubtitulo ?? ""));
  const botao = entity(b.botao ?? String(data.bannerBotao ?? ""));
  const url = utmUrl(safeUrl(b.url ?? data.bannerUrl ?? ""), data);
  if (b.variante === "imagem") {
    const imagem = b.imagem ?? String(data.bannerImagem ?? "");
    const alt = entity(b.alt ?? String(data.bannerAlt ?? "Banner"));
    if (!isHttpsImage(imagem)) return "";
    let content = imgTag(escape(imagem), alt, 600, 200);
    if (botao && url) content += `<div style="padding:10px 0">${linkTag(url, botao, txt, false)}</div>`;
    return `<tr><td style="padding:0;background:${bg};color:${txt}">${content}</td></tr>`;
  }
  let content = "";
  if (titulo) content += `<div style="font-weight:bold;font-size:16px;line-height:20px;color:${txt};overflow-wrap:anywhere">${titulo}</div>`;
  if (subtitulo) content += `<div style="font-size:13px;line-height:17px;color:${txt};margin-top:4px;overflow-wrap:anywhere">${subtitulo}</div>`;
  if (botao && url) content += `<div style="padding-top:8px">${linkTag(url, botao, txt, false)}</div>`;
  if (!content) return "";
  return `<tr><td style="padding:16px 12px;background:${bg};color:${txt}">${content}</td></tr>`;
};

const renderSelos = (b: any, data: any): string => {
  const itens: any[] = (b.itens || []).slice(0, 4);
  if (!itens.length) return "";
  const cells: string[] = [];
  for (const item of itens) {
    if (!isHttpsImage(item.imagem)) continue;
    const href = utmUrl(safeUrl(item.url), data);
    const alt = entity(item.alt ?? "Selo");
    const tag = imgTag(escape(item.imagem), alt, 64, 64);
    const cell = href ? `<td style="padding:0 6px 0 0"><a href="${escape(href)}" style="text-decoration:none">${tag}</a></td>` : `<td style="padding:0 6px 0 0">${tag}</td>`;
    cells.push(cell);
  }
  if (!cells.length) return "";
  return `<td style="padding:10px 0 10px 10px"><table role="presentation" cellpadding="0" cellspacing="0" border="0"><tbody><tr>${cells.join("")}</tr></tbody></table></td>`;
};

const renderGaleria = (b: any, data: any): string => {
  const itens: any[] = (b.itens || []).slice(0, 6);
  if (!itens.length) return "";
  const cells: string[] = [];
  for (const item of itens) {
    if (!isHttpsImage(item.imagem)) continue;
    const href = utmUrl(safeUrl(item.url), data);
    const alt = entity(item.alt ?? "Miniatura");
    const tag = imgTag(escape(item.imagem), alt, 80, 80);
    const cell = href ? `<td style="padding:0 4px 0 0"><a href="${escape(href)}" style="text-decoration:none">${tag}</a></td>` : `<td style="padding:0 4px 0 0">${tag}</td>`;
    cells.push(cell);
  }
  if (!cells.length) return "";
  return `<td style="padding:10px 0 10px 10px"><table role="presentation" cellpadding="0" cellspacing="0" border="0"><tbody><tr>${cells.join("")}</tr></tbody></table></td>`;
};

const renderAviso = (b: any, data: any): string => {
  const texto = entity(b.texto ?? String(data.legalNotice ?? ""));
  if (!texto) return "";
  return `<tr><td style="padding:10px 0;font-size:11px;line-height:15px;color:#475569;overflow-wrap:anywhere">${texto}</td></tr>`;
};

export function renderBloco(b: any, data: any, cor: string, serif: boolean): string {
  switch (b.tipo) {
    case "identidade": return renderIdentidade(b, data, cor, serif);
    case "divisor": return renderDivisor(b, cor);
    case "dados": return renderDados(b, data, cor, serif);
    case "contatos": return renderContatos(b, data, cor);
    case "redes": return renderRedes(b, data, cor);
    case "botoes": return renderBotoes(b, data, cor);
    case "banner": return renderBanner(b, data, cor);
    case "selos": return renderSelos(b, data);
    case "galeria": return renderGaleria(b, data);
    case "aviso": return renderAviso(b, data);
  }
  return "";
}

export function renderModoCompativel(blocos: any[]): any[] {
  return blocos.filter(b => {
    if (b.tipo === "banner" && b.variante === "imagem") return false;
    if (b.tipo === "galeria") return false;
    if (b.tipo === "selos") return false;
    if (b.tipo === "botoes" && b.modo === "dois-lado-a-lado") return false;
    return true;
  });
}

export function renderBlocosHtml(modelo: { cor: string; serif?: boolean; compativel?: boolean }, blocos: any[], data: any, locale = "pt-BR"): { html: string; text: string } {
  const cor = modelo.cor ?? "#5b45db";
  const serif = !!modelo.serif;
  const ativos = modelo.compativel ? renderModoCompativel(blocos) : blocos;

  const rows: string[] = [];
  let pendenteLadoLado = false;

  for (const b of ativos) {
    const rendered = renderBloco(b, data, cor, serif);
    if (!rendered) continue;
    if (b.tipo === "identidade") {
      pendenteLadoLado = true;
      rows.push(`<tr>${rendered}`);
    } else if (pendenteLadoLado && b.tipo === "divisor" && b.orientacao === "vertical") {
      rows[rows.length - 1] += rendered;
    } else if (pendenteLadoLado && b.tipo === "dados") {
      rows[rows.length - 1] += rendered + "</tr>";
      pendenteLadoLado = false;
    } else {
      if (pendenteLadoLado) { rows[rows.length - 1] += "</tr>"; pendenteLadoLado = false; }
      if (b.tipo === "divisor" && b.orientacao !== "vertical") {
        rows.push(rendered);
      } else {
        rows.push(`<tr>${rendered}</tr>`);
      }
    }
  }
  if (pendenteLadoLado) rows[rows.length - 1] += "</tr>";

  const corpo = rows.join("");
  const html = `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;max-width:600px;width:100%;font-family:${fontStack(serif)};font-size:13px;line-height:18px;background:#ffffff;color:#182139"><tbody>${corpo}</tbody></table>`;

  const text = renderBlocosText(ativos, data, locale);
  return { html, text };
}

function renderBlocosText(blocos: any[], data: any, locale: string): string {
  const lines: string[] = [];
  for (const b of blocos) {
    if (b.tipo === "dados") {
      if (data.name) lines.push(String(data.name));
      if (data.role) lines.push(String(data.role));
      if (data.company) lines.push(String(data.company));
    }
    if (b.tipo === "contatos") {
      for (const item of (b.itens || [])) {
        if (item.valor) lines.push(`${item.rotulo ?? item.chave}: ${item.valor}`);
      }
    }
    if (b.tipo === "aviso") {
      const texto = b.texto ?? String(data.legalNotice ?? "");
      if (texto) lines.push("", texto);
    }
    if (b.tipo === "banner" && b.variante === "texto") {
      if (b.titulo) lines.push("", b.titulo);
      if (b.subtitulo) lines.push(b.subtitulo);
      if (b.botao && b.url) lines.push(`${b.botao}: ${b.url}`);
    }
    if (b.tipo === "botoes") {
      if (b.modo === "um") { if (b.label && b.url) lines.push(`${b.label}: ${b.url}`); }
      if (b.modo === "dois-lado-a-lado") {
        if (b.b1.label && b.b1.url) lines.push(`${b.b1.label}: ${b.b1.url}`);
        if (b.b2.label && b.b2.url) lines.push(`${b.b2.label}: ${b.b2.url}`);
      }
      if (b.modo === "dois-resposta") {
        if (b.sim.label && b.sim.url) lines.push(`${b.sim.label}: ${b.sim.url}`);
        if (b.nao.label && b.nao.url) lines.push(`${b.nao.label}: ${b.nao.url}`);
      }
    }
  }
  if (data.whatsapp) lines.push(`WhatsApp: ${data.whatsapp}`);
  if (data.email) lines.push(`E-mail: ${data.email}`);
  if (data.website) lines.push(`Site: ${data.website}`);
  return lines.join("\n");
}
