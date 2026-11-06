import { translator, type Locale } from "@/lib/i18n/shared";
import { whatsappUrl } from "@/types/whatsapp";
import { renderSocialIcons } from "@/lib/signature/icons";
import { emptySignature, type SignatureData } from "@/types/signature";

const escape = (value: string) => value.replace(/[&<>"']/g, (char) =>
  ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char] ?? char);
const safeUrl = (value: string) => {
  try { const url = new URL(value); return url.protocol === "https:" ? escape(url.href) : ""; }
  catch { return ""; }
};
const domainLabel = (value: string) => {
  try { return new URL(value).hostname.replace(/^www\./, ""); } catch { return value; }
};
const regTypeLabel = (type: SignatureData["professionalRegistrationType"] | undefined) => {
  switch (type) {
    case "CRECI": return "CRECI";
    case "OAB": return "OAB";
    case "CRM": return "CRM";
    case "CRC": return "CRC";
    case "CNPJ": return "CNPJ";
    default: return "";
  }
};
const picture = (url: string, alt: string, size: number, radius: string) => safeUrl(url) ?
  `<img src="${safeUrl(url)}" alt="${escape(alt)}" width="${size}" height="${size}" style="display:block;width:${size}px;height:${size}px;border-radius:${radius};border:0">` : "";

export function renderSignature(data: SignatureData, pro: boolean, locale: Locale = "pt-BR", assetBase?: string) {
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
  const professionalLine = [
    data.professionalRegistration ? [regType, data.professionalRegistration].filter(Boolean).join(": ") : "",
    data.cnpj && data.professionalRegistrationType !== "CNPJ" ? `CNPJ: ${data.cnpj}` : "",
    data.address,
  ].filter(Boolean).map(line => `<div style="font-size:12px;color:#475569;line-height:18px;word-wrap:break-word">${escape(line)}</div>`).join("");

  const items = [
    contact(phone ? "tel:" + phone : "", data.phone),
    contact(/^\S+@\S+\.\S+$/.test(data.email) ? "mailto:" + escape(encodeURIComponent(data.email).replace(/%40/g,"@")) : "", data.email),
    contact(websiteHref, websiteLabel),
  ].filter(Boolean);

  const social = pro ? renderSocialIcons(data, assetBase) : "";
  const accent = data.template === "color" || data.template === "studio";
  const executive = data.template === "executive";
  const studio = data.template === "studio";
  const editorial = data.template === "editorial";
  const luxe = data.template === "signature-luxe";
  const brandDesk = data.template === "brand-desk";
  const consulting = data.template === "consulting";
  const monogram = data.template === "monogram";
  const sales = data.template === "sales";

  const showSide = data.template === "modern" || executive || monogram || luxe ? photo || badge : photo;

  const banner = data.template === "banner" || brandDesk ? `<tr><td colspan="3" style="background:${theme};color:${onTheme};padding:7px 12px;font-weight:bold;font-size:12px">${escape(data.company || t("Vamos conversar?"))}</td></tr>` : "";
  const watermark = pro ? "" : `<tr><td colspan="3" style="padding:6px 12px;font-size:10px;color:#526078">${t("Criado com Maily")}</td></tr>`;
  const rule = data.template === "classic" || data.template === "executive" || consulting || luxe ? `border-top:2px solid ${theme};` : "";
  const border = data.template === "minimal" || data.template === "modern" ? `border-left:2px solid ${theme};` : "";

  const whatsapp = whatsappUrl(data.whatsapp);
  const whatsappBtn = whatsapp && !pro ? `<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding-top:8px;font-family:Arial,sans-serif;font-size:12px;line-height:18px"><a href="${safeUrl(whatsapp)}" style="color:#087443;text-decoration:underline;font-weight:bold">${t("Conversar no WhatsApp")}</a></td></tr></table>` : "";

  const legalLine = data.legalNotice ? `<div style="font-size:11px;margin-top:8px;color:#475569;line-height:16px;overflow-wrap:anywhere">${escape(data.legalNotice)}</div>` : "";

  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;max-width:480px;width:100%;font-family:${editorial || luxe ? "Georgia,serif" : "Arial,sans-serif"};font-size:13px;background:${luxe ? "#fff8eb" : studio ? "#f4f2ff" : brandDesk ? "#f1f5f9" : "#ffffff"};color:#182139;${rule}${border}"><tbody>
    <tr>${showSide ? `<td width="${photoSize + 10}" valign="top" style="padding:10px 0 10px 10px">${showSide}</td>` : ""}
    <td valign="middle" style="padding:${compact ? 7 : 10}px">${accent ? `<div style="background:${theme};width:${studio ? 40 : 24}px;height:4px;margin-bottom:6px"></div>` : ""}${consulting ? `<div style="font-size:9px;letter-spacing:1.5px;color:#475569;margin-bottom:5px">${t("CONTATO PROFISSIONAL")}</div>` : ""}
    <div style="font-weight:bold;font-size:${compact ? 15 : 19}px;line-height:1.2;overflow-wrap:anywhere">${name}</div>
    ${roleLine ? `<div style="font-size:12px;margin-top:3px;overflow-wrap:anywhere">${roleLine}</div>` : ""}
    ${companyLine ? `<div style="font-size:11px;margin-top:1px;color:#475569;overflow-wrap:anywhere">${companyLine}</div>` : ""}
    ${professionalLine}
    ${items.length ? `<div style="margin-top:7px;line-height:1.6;font-size:12px;overflow-wrap:anywhere">${items.join("<br>")}</div>` : ""}
    ${legalLine}
    ${social ? `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-top:6px"><tbody>${social}</tbody></table>` : ""}${whatsappBtn}</td>
    ${logo ? `<td width="40" valign="top" style="padding:10px 10px 10px 0">${logo}</td>` : ""}</tr>${banner}${watermark}</tbody></table>`;
}
