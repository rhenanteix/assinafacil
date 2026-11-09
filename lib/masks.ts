export function digits(value: string) { return value.replace(/\D/g, ""); }

export function maskPhoneBR(value: string) {
  const d = digits(value).replace(/^55/, "").slice(0, 11);
  if (!d) return "";
  const dd = d.slice(0, 2);
  const rest = d.slice(2);
  if (d.length <= 2) return `+55 (${dd}`;
  if (d.length <= 6) return `+55 (${dd}) ${rest}`;
  if (d.length <= 10) return `+55 (${dd}) ${rest.slice(0, 4)}-${rest.slice(4)}`;
  return `+55 (${dd}) ${rest.slice(0, 5)}-${rest.slice(5)}`;
}

export function maskCEP(value: string) {
  const d = digits(value).slice(0, 8);
  return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d;
}

export function maskCNPJ(value: string) {
  const d = digits(value).slice(0, 14);
  if (d.length <= 2) return d;
  if (d.length <= 5) return `${d.slice(0, 2)}.${d.slice(2)}`;
  if (d.length <= 8) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5)}`;
  if (d.length <= 12) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8)}`;
  return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}`;
}

export function validCEP(value: string) { return !value || /^\d{5}-?\d{3}$/.test(value.trim()); }

export function validCNPJ(value: string) {
  const d = digits(value);
  if (!d) return true;
  if (d.length !== 14 || /^(\d)\1+$/.test(d)) return false;
  const calc = (len: number) => {
    let sum = 0, pos = len - 7;
    for (let i = len; i >= 1; i--) { sum += Number(d[len - i]) * pos--; if (pos < 2) pos = 9; }
    const res = sum % 11;
    return res < 2 ? 0 : 11 - res;
  };
  return calc(12) === Number(d[12]) && calc(13) === Number(d[13]);
}

export function maskPhoneInput(value: string) {
  const d = digits(value).replace(/^55/, "").slice(0, 11);
  if (!d) return "";
  const dd = d.slice(0, 2);
  const rest = d.slice(2);
  if (d.length <= 2) return `+55 (${dd}`;
  if (d.length <= 6) return `+55 (${dd}) ${rest}`;
  if (d.length <= 10) return `+55 (${dd}) ${rest.slice(0, 4)}-${rest.slice(4)}`;
  return `+55 (${dd}) ${rest.slice(0, 5)}-${rest.slice(5)}`;
}

export function normalizePhoneBR(value: string) {
  const d = digits(value).replace(/^55/, "");
  if (!d) return { kind: "", ddd: "", number: "", formatted: "" };
  const dd = d.slice(0, 2);
  const rest = d.slice(2);
  const isMobile = rest.length === 9 && rest.startsWith("9");
  const kind = isMobile ? "celular" : "fixo";
  const formatted = maskPhoneBR(value);
  return { kind, ddd: dd, number: rest, formatted };
}

export function validPhoneBR(value: string) {
  if (!value.trim()) return true;
  const d = digits(value).replace(/^55/, "");
  if (d.length < 10 || d.length > 11) return false;
  const dd = d.slice(0, 2);
  const rest = d.slice(2);
  if (!/^[1-9][0-9]$/.test(dd)) return false;
  if (rest.length === 9) return rest.startsWith("9");
  if (rest.length === 8) return /^[2-5]/.test(rest);
  return false;
}
