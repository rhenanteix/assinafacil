export function checkoutEnabled() {
  return Boolean(process.env.MP_ACCESS_TOKEN && process.env.MP_WEBHOOK_SECRET && process.env.NEXTAUTH_URL?.startsWith("https://"));
}
