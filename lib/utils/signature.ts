import { translator, type Locale } from "@/lib/i18n/shared";
import { renderSocialIcons } from "@/lib/signature/icons";
import type { SignatureData } from "@/types/signature";

const escape = (value: string) => value.replace(/[&<>"']/g, (char) =>
  ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char] ?? char);
const safeUrl = (value: string) => {
  try { const url = new URL(value); return url.protocol === "https:" ? escape(url.href) : ""; }
  catch { return ""; }
};

export function renderSignature(data: SignatureData, pro: boolean, locale: Locale = "pt-BR") {
  const t = translator(locale);
  const theme = /^#[0-9a-f]{6}$/i.test(data.color) ? data.color : "#5b45db";
  const [r, g, b] = (theme.slice(1).match(/../g) ?? []).map((n) => parseInt(n, 16));
  const linear = (n: number) => n / 255 <= .04045 ? n / 255 / 12.92 : ((n / 255 + .055) / 1.055) ** 2.4;
  const onTheme = .2126 * linear(r) + .7152 * linear(g) + .0722 * linear(b) > .179 ? "#111111" : "#ffffff";
  const name = escape(data.name.trim() || t("Seu nome"));
  const subtitle = [data.role, data.company].filter(Boolean).map(escape).join(" · ");
  const picture = (url: string, alt: string, size: number, radius: string) => safeUrl(url) ?
    `<img src="${safeUrl(url)}" alt="${alt}" width="${size}" height="${size}" style="display:block;width:${size}px;height:${size}px;object-fit:${radius === "50%" ? "cover" : "contain"};border-radius:${radius};border:0">` : "";
  const compact = data.template === "compact";
  const photo = picture(data.photo, t("Foto de perfil"), compact ? 36 : 64, "50%");
  const initials = escape(data.name.trim().split(/\s+/).slice(0, 2).map(word => [...word][0] ?? "").join("").toUpperCase() || "AF");
  const logo = picture(data.logo, t("Logo da empresa"), 36, "4px");
  const badge = `<span style="display:inline-block;text-align:center;width:64px;line-height:64px;border-radius:50%;color:${onTheme};background:${theme};font-size:20px;font-weight:bold">${initials}</span>`;
  const contact = (href: string, label: string) => href ? `<a href="${href}" style="color:#344054;text-decoration:underline">${escape(label)}</a>` : "";
  const phone = data.phone.replace(/[^\d+]/g, "").replace(/(?!^)\+/g, "");
  const items = [
    contact(phone ? "tel:" + phone : "", data.phone),
    contact(/^\S+@\S+\.\S+$/.test(data.email) ? "mailto:" + escape(encodeURIComponent(data.email).replace(/%40/g,"@")) : "", data.email),
    contact(safeUrl(data.website), t("Site")),
  ].filter(Boolean);
  const social = pro ? renderSocialIcons(data) : "";
  const accent = data.template === "color" || data.template === "studio";
  const executive = data.template === "executive";
  const studio = data.template === "studio";
  const details = `<div style="font-weight:bold;font-size:${compact ? 16 : 22}px;line-height:1.2;overflow-wrap:anywhere">${name}</div>
    ${subtitle ? `<div style="font-size:13px;margin-top:5px;overflow-wrap:anywhere">${subtitle}</div>` : ""}
    ${items.length ? `<div style="margin-top:10px;line-height:1.7;font-size:12px;overflow-wrap:anywhere">${items.join(compact ? " · " : "<br>")}</div>` : ""}`;
  const editorial = data.template === "editorial";
  const luxe = data.template === "signature-luxe";
  const brandDesk = data.template === "brand-desk";
  const sales = data.template === "sales";
  const consulting = data.template === "consulting";
  const monogram = data.template === "monogram";
  const side = data.template === "modern" || executive || monogram || luxe ? photo || badge : photo;
  const banner = data.template === "banner" || brandDesk ? `<tr><td colspan="3" style="background:${theme};color:${onTheme};padding:8px 12px;font-weight:bold">${escape(data.company || t("Vamos conversar?"))}</td></tr>` : "";
  const watermark = pro ? "" : `<tr><td colspan="3" style="padding:7px 12px;font-size:10px;color:#526078">${t("Criado com AssinaFácil")}</td></tr>`;
  const rule = data.template === "classic" || data.template === "executive" || consulting || luxe ? `border-top:3px solid ${theme};` : "";
  const border = data.template === "minimal" || data.template === "modern" ? `border-left:3px solid ${theme};` : "";
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:separate;max-width:100%;font-family:${editorial || luxe ? "Georgia,serif" : "Arial,sans-serif"};font-size:13px;background:${luxe ? "#fff8eb" : studio ? "#f4f2ff" : brandDesk ? "#f1f5f9" : "#ffffff"};color:#182139;${rule}${border}"><tbody>
    <tr>${side ? `<td valign="top" style="padding:12px 0 12px 12px">${side}</td>` : ""}
    <td valign="middle" style="padding:${compact ? 8 : 12}px">${accent ? `<div style="background:${theme};width:${studio ? 48 : 30}px;height:5px;margin-bottom:8px"></div>` : ""}${consulting ? `<div style="font-size:10px;letter-spacing:2px;color:#475569;margin-bottom:6px">${t("CONTATO PROFISSIONAL")}</div>` : ""}${details}${social ? `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-top:8px"><tbody><tr>${social}</tr></tbody></table>` : ""}${sales && phone ? `<a href="https://wa.me/${phone.replace(/\D/g, "")}" style="display:inline-block;margin-top:10px;padding:6px 10px;background:${theme};color:${onTheme};text-decoration:none;border-radius:4px">${t("Conversar no WhatsApp")}</a>` : ""}</td>
    ${logo ? `<td valign="top" style="padding:12px 12px 12px 0">${logo}</td>` : ""}</tr>${banner}${watermark}</tbody></table>`;
}
