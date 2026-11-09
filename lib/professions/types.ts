import type { SignatureData } from "@/types/signature";

export type ProfessionCtaType = "link" | "whatsapp";
export type ProfessionFieldKey =
  | keyof Pick<SignatureData, "name" | "role" | "company" | "phone" | "whatsapp" | "email" | "website" | "address" | "cnpj" | "professionalRegistration" | "legalNotice">
  | "portfolio" | "behance" | "dribbble" | "instagram";

export type ProfessionField = {
  key: ProfessionFieldKey;
  label: string;
  labelEn?: string;
  optional?: boolean;
  placeholder?: string;
  mask?: "phone-br" | "cep" | "cnpj";
  validation?: "required" | "phone-br" | "cep" | "cnpj" | "url" | "email";
  registrationTypes?: string[];
};

export type ProfessionPack = {
  id: string;
  name: string;
  nameEn?: string;
  slug: string;
  fields: ProfessionField[];
  cta: { label: string; labelEn?: string; type: ProfessionCtaType };
  notice: { text: string; textEn?: string; editable: boolean };
  recommendedModels: SignatureData["template"][];
  example: Partial<SignatureData> & Pick<SignatureData, "name" | "role" | "company" | "email" | "template" | "color">;
  seo: { forWho: string; whyItWorks: string; forWhoEn?: string; whyItWorksEn?: string };
};
