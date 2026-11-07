export async function sendTransactionalEmail(input: { to: string; subject: string; text: string; key: string }) {
  const { RESEND_API_KEY, VERIFICATION_FROM_EMAIL } = process.env;
  if (!RESEND_API_KEY || !VERIFICATION_FROM_EMAIL) throw new Error("Email unavailable");
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST", signal: AbortSignal.timeout(20000),
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json", "Idempotency-Key": input.key },
    body: JSON.stringify({ from: VERIFICATION_FROM_EMAIL, to: [input.to], subject: input.subject, text: input.text }),
  });
  const result = await response.json().catch(() => null);
  if (!response.ok || !result?.id) throw new Error("Email not confirmed");
  return String(result.id);
}
