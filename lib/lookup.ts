// TODO [CONFIRMAR]: provedor de consulta CNPJ/CEP (BrasilAPI ou ViaCEP), limites de taxa e termos de uso.
// Valor provisório: BrasilAPI para CNPJ, ViaCEP para CEP. Ambos públicos e sem cadastro.
// Não enviar CNPJ/CEP para analytics nem logar valores brutos (LGPD).

type CnpjResult = {
  razao_social?: string;
  nome_fantasia?: string;
  logradouro?: string;
  bairro?: string;
  municipio?: string;
  uf?: string;
  telefone?: string;
  cep?: string;
} | null;

type CepResult = {
  logradouro?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
} | null;

const cache = new Map<string, { data: unknown; expiresAt: number }>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutos

function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry || entry.expiresAt < Date.now()) return null;
  return entry.data as T;
}

function setCached<T>(key: string, data: T) {
  cache.set(key, { data, expiresAt: Date.now() + CACHE_TTL_MS });
}

async function fetchWithTimeout(url: string, ms: number): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { signal: controller.signal, headers: { Accept: "application/json" } });
  } finally {
    clearTimeout(timer);
  }
}

export async function consultarCNPJ(cnpj: string): Promise<CnpjResult> {
  const digits = cnpj.replace(/\D/g, "");
  if (!digits || digits.length !== 14) return null;
  const cached = getCached<CnpjResult>(`cnpj:${digits}`);
  if (cached) return cached;
  try {
    // TODO [CONFIRMAR]: termos de uso e rate limit do provedor escolhido.
    const response = await fetchWithTimeout(`https://brasilapi.com.br/api/cnpj/v1/${digits}`, 8000);
    if (!response.ok) return null;
    const data = await response.json();
    const result: CnpjResult = {
      razao_social: data.razao_social ?? undefined,
      nome_fantasia: data.nome_fantasia ?? undefined,
      logradouro: data.logradouro ?? undefined,
      bairro: data.bairro ?? undefined,
      municipio: data.municipio ?? undefined,
      uf: data.uf ?? undefined,
      telefone: data.telefone ?? undefined,
      cep: data.cep ?? undefined,
    };
    setCached(`cnpj:${digits}`, result);
    return result;
  } catch {
    return null;
  }
}

export async function consultarCEP(cep: string): Promise<CepResult> {
  const digits = cep.replace(/\D/g, "");
  if (!digits || digits.length !== 8) return null;
  const cached = getCached<CepResult>(`cep:${digits}`);
  if (cached) return cached;
  try {
    // TODO [CONFIRMAR]: termos de uso e rate limit do provedor escolhido.
    const response = await fetchWithTimeout(`https://viacep.com.br/ws/${digits}/json/`, 8000);
    if (!response.ok) return null;
    const data = await response.json();
    if (data.erro) return null;
    const result: CepResult = {
      logradouro: data.logradouro ?? undefined,
      bairro: data.bairro ?? undefined,
      cidade: data.localidade ?? undefined,
      estado: data.uf ?? undefined,
    };
    setCached(`cep:${digits}`, result);
    return result;
  } catch {
    return null;
  }
}
