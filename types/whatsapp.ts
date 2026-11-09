/** Accept an international phone number or an official WhatsApp HTTPS link. */
export function whatsappUrl(value: string) {
  const input = value.trim();
  if (!input) return "";
  if (/^[+\d().\s-]+$/.test(input)) {
    const digits = input.replace(/\D/g, "");
    return /^[1-9]\d{9,14}$/.test(digits) ? `https://wa.me/${digits}` : null;
  }
  try {
    const url = new URL(input);
    if (url.protocol !== "https:" || url.username || url.password) return null;
    if (url.hostname === "wa.me" && /^\/[1-9]\d{9,14}$/.test(url.pathname)) return url.href;
    if (["api.whatsapp.com", "web.whatsapp.com"].includes(url.hostname) && url.pathname === "/send" && /^[1-9]\d{9,14}$/.test(url.searchParams.get("phone") ?? "")) return url.href;
  } catch { /* Invalid URL. */ }
  return null;
}

/** Gera link wa.me com número brasileiro normalizado e mensagem pré-preenchida codificada em URL. */
export function whatsappLink(numero: string, mensagem?: string) {
  const d = numero.replace(/\D/g, "");
  if (!/^[1-9]\d{9,14}$/.test(d)) return null;
  const base = `https://wa.me/${d}`;
  if (!mensagem?.trim()) return base;
  return `${base}?text=${encodeURIComponent(mensagem.trim())}`;
}
