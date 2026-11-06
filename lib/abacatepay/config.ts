export function paymentDevMode() {
  return process.env.ABACATEPAY_ENVIRONMENT === "test";
}
export function checkoutEnabled() {
  const mode = process.env.ABACATEPAY_ENVIRONMENT;
  return Boolean(process.env.ABACATEPAY_API_KEY && process.env.ABACATEPAY_WEBHOOK_SECRET &&
    (mode === "test" || mode === "production") &&
    (process.env.VERCEL_ENV !== "production" || mode === "production"));
}
export function cardPublicKey() {
  const key = process.env.ABACATEPAY_PUBLIC_KEY;
  return key?.startsWith("pk_") ? key : undefined;
}
