import { publicSiteUrl } from "@/lib/utils/site-url";
import { translator, type Locale } from "@/lib/i18n/shared";
import { whatsappUrl, whatsappLink } from "@/types/whatsapp";
import { renderSocialIcons } from "@/lib/signature/icons";
import { emptySignature, type SignatureData } from "@/types/signature";
import { formatarRegistro } from "@/lib/professions/registries";
import { renderBlocosHtml } from "@/lib/blocks/render";
import { getModeloBlocos, type Bloco } from "@/lib/blocks/registry";

const escape = (value: string) => value.replace(/[&<>"']/g, (char) =>
  ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char] ?? char)
  .replace(/[\u0080-\uFFFF]/g, (ch) => `&#${ch.charCodeAt(0)};`);
const safeUrl = (value: string) => {
  try { const url = new URL(value); return url.protocol === "https:" ? escape(url.href) : ""; }
  catch { return ""; }
};
const domainLabel = (value: string) => {
  try { return new URL(value).hostname.replace(/^www\./, ""); } catch { return value; }
};
const regTypeLabel = (type: SignatureData["professionalRegistrationType"] | undefined) => {
  switch (type) {
    case "CRECI": case "OAB": case "CRM": case "CRO": case "CRP": case "CRN": case "CRC": case "CNPJ": return type;
    default: return "";
  }
};
const picture = (url: string, alt: string, size: number, radius: string) => safeUrl(url) ?
  `<img src="${safeUrl(url)}" alt="${escape(alt)}" width="${size}" height="${size}" style="display:block;width:${size}px;height:${size}px;border-radius:${radius};border:0">` : "";

export function renderSignature(data: SignatureData, pro: boolean, locale: Locale = "pt-BR", assetBase?: string) {
  const blocosRaw = data.templateBlocos || (data.blocos ? (() => { try { return JSON.parse(data.blocos); } catch { return null; } })() : null);
  if (Array.isArray(blocosRaw) && blocosRaw.length) {
    const modelo = getModeloBlocos(data.templateBlocos ?? "");
    const d: Record<string, unknown> = data as unknown as Record<string, unknown>;
    return renderBlocosHtml(
      { cor: modelo?.cor ?? data.color, serif: !!modelo?.serif, compativel: modelo?.compativel ?? data.modoCompativel },
      blocosRaw as Bloco[],
      d,
      locale,
    ).html;
  }
  data = { ...emptySignature, ...data };
  const t = translator(locale);
  const theme = /^#[0-9a-f]{6}$/i.test(data.color) ? data.color : "#5b45db";
  const [r, g, b] = (theme.slice(1).match(/../g) ?? []).map((n) => parseInt(n, 16));
  const linear = (n: number) => n / 255 <= .04045 ? n / 255 / 12.92 : ((n / 255 + .055) / 1.055) ** 2.4;
  const onTheme = .2126 * linear(r) + .7152 * linear(g) + .0722 * linear(b) > .179 ? "#111111" : "#ffffff";
  const name = escape(data.name.trim() || t("Seu nome"));
  const roleLine = data.role ? escape(data.role) : "";
  const companyLine = data.company ? escape(data.company) : "";
  const compact = data.template === "compact";
  const photoSize = compact ? 36 : 48;
  const photo = picture(data.photo, t("Foto de perfil"), photoSize, "50%");
  const initials = escape(data.name.trim().split(/\s+/).slice(0, 2).map(word => [...word][0] ?? "").join("").toUpperCase() || "M");
  const logo = picture(data.logo, t("Logo da empresa"), 30, "4px");
  const badge = `<span style="display:inline-block;text-align:center;width:${photoSize}px;line-height:${photoSize}px;border-radius:50%;color:${onTheme};background:${theme};font-size:${Math.round(photoSize * 0.3)}px;font-weight:bold">${initials}</span>`;
  const contact = (href: string, label: string) => href ? `<a href="${href}" style="color:#344054;text-decoration:none">${escape(label)}</a>` : "";
  const phone = data.phone.replace(/[^\d+]/g, "").replace(/(?!^)\+/g, "");
  const websiteLabel = data.website ? domainLabel(data.website) : t("Site");
  const websiteHref = safeUrl(data.website);

  const regType = regTypeLabel(data.professionalRegistrationType);
  const registroFormatado = data.professionalRegistration ? formatarRegistro(data.professionalRegistrationType ?? "", data.professionalRegistration, data.professionalRegistrationUf, data.professionalRegistrationRqe) : "";
  const professionalLine = [
    registroFormatado,
    data.cep ? `CEP: ${data.cep}` : "",
    data.cnpj && data.professionalRegistrationType !== "CNPJ" ? `CNPJ: ${data.cnpj}` : "",
    data.address,
  ].filter(Boolean).map(line => `<div style="font-size:12px;color:#475569;line-height:18px;word-wrap:break-word">${escape(line)}</div>`).join("");

  const items = [
    contact(phone ? "tel:" + phone : "", data.phone),
    contact(/^\S+@\S+\.\S+$/.test(data.email) ? "mailto:" + escape(encodeURIComponent(data.email).replace(/%40/g,"@")) : "", data.email),
    contact(websiteHref, websiteLabel),
  ].filter(Boolean);

  const social = pro ? renderSocialIcons(data, assetBase) : "";
  const accent = data.template === "color" || data.template === "studio" || data.template === "creative" || data.template === "growth" || data.template === "portfolio";
  const executive = data.template === "executive" || data.template === "finance" || data.template === "counsel";
  const studio = data.template === "studio" || data.template === "creative" || data.template === "developer";
  const editorial = data.template === "editorial" || data.template === "education" || data.template === "architect";
  const luxe = data.template === "signature-luxe";
  const brandDesk = data.template === "brand-desk";
  const consulting = data.template === "consulting" || data.template === "wellness" || data.template === "clinic";
  const monogram = data.template === "monogram" || data.template === "tech";
  const sales = data.template === "sales" || data.template === "growth" || data.template === "property";
  const serif = editorial || luxe || data.template === "architect";

  const showSide = data.template === "modern" || executive || monogram || luxe || data.template === "developer" ? photo || badge : photo;

  const banner = data.template === "banner" || brandDesk || data.template === "property" ? `<tr><td colspan="3" style="background:${theme};color:${onTheme};padding:7px 12px;font-weight:bold;font-size:12px">${escape(data.company || t("Vamos conversar?"))}</td></tr>` : "";
  const acquisitionUrl = new URL("/?utm_source=signature&utm_medium=email&utm_campaign=free", publicSiteUrl() ?? "https://maily.com.br").href;
  const watermark = pro ? "" : `<tr><td colspan="3" style="padding:6px 12px;font-size:10px;color:#526078"><a href="${acquisitionUrl}" target="_blank" rel="noopener noreferrer" style="color:#69519a;text-decoration:none;font-family:Arial,sans-serif;font-size:10px;">${escape(t("Criado com Maily"))} &#183; Crie sua assinatura</a></td></tr>`;
  const rule = data.template === "classic" || data.template === "executive" || data.template === "finance" || data.template === "counsel" || data.template === "clinic" || consulting || luxe ? `border-top:2px solid ${theme};` : "";
  const border = data.template === "minimal" || data.template === "modern" || data.template === "tech" || data.template === "developer" || data.template === "portfolio" ? `border-left:3px solid ${theme};` : "";
  const bg = luxe ? "#fff8eb" : studio ? "#f8f7ff" : brandDesk ? "#f1f5f9" : data.template === "wellness" || data.template === "clinic" ? "#f7fffb" : data.template === "education" ? "#fffbeb" : data.template === "property" ? "#f0f9ff" : "#ffffff";
  const label = consulting ? `<div style="font-size:9px;letter-spacing:1.5px;color:#475569;margin-bottom:5px">${escape(t("CONTATO PROFISSIONAL"))}</div>` : data.template === "developer" ? `<div style="font-size:10px;color:${theme};font-family:Arial,sans-serif;margin-bottom:4px">&lt;/&gt;</div>` : data.template === "education" ? `<div style="font-size:9px;letter-spacing:1px;color:${theme};margin-bottom:5px">${escape(t("EDUCAÇÃO"))}</div>` : "";

  const whatsappSource = data.whatsapp || (data.whatsappSameAsPhone && data.phone ? data.phone : "");
  const whatsapp = whatsappSource ? whatsappLink(whatsappSource, data.whatsappMessage) : null;
  const whatsappBtn = whatsapp && !pro ? `<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding-top:8px;font-family:Arial,sans-serif;font-size:12px;line-height:18px"><a href="${safeUrl(whatsapp)}" style="color:#087443;text-decoration:underline;font-weight:bold">${t("Conversar no WhatsApp")}</a></td></tr></table>` : "";

  const signoff = data.signoff.trim() ? `<div style="font-size:12px;margin-bottom:4px;color:#475569;overflow-wrap:anywhere">${escape(data.signoff)}</div>` : "";
  const legalLine = data.legalNotice ? `<div style="font-size:11px;margin-top:8px;color:#475569;line-height:16px;overflow-wrap:anywhere">${escape(data.legalNotice)}</div>` : "";
  const ctaHref = data.ctaType === "whatsapp" ? (whatsapp ? safeUrl(whatsapp) : "") : safeUrl(data.ctaUrl);
  const cta = pro && data.ctaLabel.trim() && ctaHref ? `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-top:8px"><tr><td style="border-radius:6px;background:${theme}"><a href="${ctaHref}" style="display:inline-block;padding:8px 12px;color:${onTheme};font-size:12px;font-weight:bold;text-decoration:none;font-family:Arial,sans-serif">${escape(data.ctaLabel)}</a></td></tr></table>` : "";

  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;max-width:480px;width:100%;font-family:${serif ? "Georgia,serif" : "Arial,sans-serif"};font-size:13px;background:${bg};color:#182139;${rule}${border}"><tbody>
    <tr>${showSide ? `<td width="${photoSize + 10}" valign="top" style="padding:10px 0 10px 10px">${showSide}</td>` : ""}
    <td valign="middle" style="padding:${compact ? 7 : 10}px">${accent ? `<div style="background:${theme};width:${studio ? 40 : 24}px;height:4px;margin-bottom:6px"></div>` : ""}${label}
    ${signoff}
    <div style="font-weight:bold;font-size:${compact ? 15 : 19}px;line-height:1.2;overflow-wrap:anywhere">${name}</div>
    ${roleLine ? `<div style="font-size:12px;margin-top:3px;overflow-wrap:anywhere">${roleLine}</div>` : ""}
    ${companyLine ? `<div style="font-size:11px;margin-top:1px;color:#475569;overflow-wrap:anywhere">${companyLine}</div>` : ""}
    ${professionalLine}
    ${items.length ? `<div style="margin-top:7px;line-height:1.6;font-size:12px;overflow-wrap:anywhere">${items.join("<br>")}</div>` : ""}
    ${cta}
    ${legalLine}
    ${social ? `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-top:6px"><tbody>${social}</tbody></table>` : ""}${whatsappBtn}</td>
    ${logo ? `<td width="40" valign="top" style="padding:10px 10px 10px 0">${logo}</td>` : ""}</tr>${banner}${watermark}</tbody></table>`;
}

export function renderSignatureText(data: SignatureData, pro: boolean, locale: Locale = "pt-BR") {
  const blocosRaw = data.templateBlocos || (data.blocos ? (() => { try { return JSON.parse(data.blocos); } catch { return null; } })() : null);
  if (Array.isArray(blocosRaw) && blocosRaw.length) {
    const modelo = getModeloBlocos(data.templateBlocos ?? "");
    const d: Record<string, unknown> = data as unknown as Record<string, unknown>;
    return renderBlocosHtml(
      { cor: modelo?.cor ?? data.color, serif: !!modelo?.serif, compativel: modelo?.compativel ?? data.modoCompativel },
      blocosRaw as Bloco[],
      d,
      locale,
    ).text;
  }
  data = { ...emptySignature, ...data };
  const t = translator(locale);
  const lines: string[] = [];
  if (data.signoff.trim()) lines.push(data.signoff.trim());
  lines.push(data.name.trim() || t("Seu nome"));
  if (data.role) lines.push(data.role);
  if (data.company) lines.push(data.company);
  const regType = regTypeLabel(data.professionalRegistrationType);
  const registroFormatado = data.professionalRegistration ? formatarRegistro(data.professionalRegistrationType ?? "", data.professionalRegistration, data.professionalRegistrationUf, data.professionalRegistrationRqe) : "";
  if (registroFormatado) lines.push(registroFormatado);
  if (data.cep) lines.push(`CEP: ${data.cep}`);
  if (data.cnpj && data.professionalRegistrationType !== "CNPJ") lines.push(`CNPJ: ${data.cnpj}`);
  if (data.address) lines.push(data.address);
  if (data.phone) lines.push(data.phone);
  if (data.email) lines.push(data.email);
  if (data.website) lines.push(data.website);
  const whatsappSource = data.whatsapp || (data.whatsappSameAsPhone && data.phone ? data.phone : "");
  const whatsapp = whatsappSource ? whatsappLink(whatsappSource, data.whatsappMessage) : null;
  if (whatsapp) lines.push(`WhatsApp: ${whatsapp}`);
  if (pro && data.ctaLabel.trim()) {
    const href = data.ctaType === "whatsapp" ? whatsapp : safeUrl(data.ctaUrl);
    if (href) lines.push(`${data.ctaLabel}: ${href}`);
  }
  if (data.legalNotice) lines.push("", data.legalNotice);
  if (!pro) lines.push("", `${t("Criado com Maily")} · Crie sua assinatura`);
  return lines.join("\n");
}
