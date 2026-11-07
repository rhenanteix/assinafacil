// Publish commercial promises only when the operator has configured them.
export function commercialInfo() {
  const validEmail = (value?: string) => value && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? value : undefined;

  return {
    supportEmail: validEmail(process.env.SUPPORT_EMAIL) ?? validEmail(process.env.BUSINESS_CONTACT_EMAIL),
    businessEmail: validEmail(process.env.BUSINESS_CONTACT_EMAIL),
    supportResponse: process.env.SUPPORT_RESPONSE_TIME,
    invoice: process.env.INVOICE_POLICY,
    legalName: process.env.LEGAL_ENTITY_NAME,
    legalDocument: process.env.LEGAL_ENTITY_DOCUMENT,
    businessBase: { cents: 8990, monthlyCents: 990, team: "Equipe sem limite de pessoas" },
  };
}
