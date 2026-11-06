export function authDestination(value?: string | null) {
  return value === "gerador" || value === "precos" ? value : "dashboard";
}
