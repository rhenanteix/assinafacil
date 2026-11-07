/**
 * Taxonomia de eventos de analytics do Maily (AssinaFácil).
 *
 * Convenção de nomeação: `categoria_acao` (ex: `page_viewed`, `cta_clicked`).
 * O prefixo agrupa eventos relacionados, facilitando funis e dashboards no PostHog.
 *
 * Todas as propriedades são opcionais. Enviar apenas o que fizer sentido no contexto,
 * evitando encher o evento com dados irrelevantes ou sensíveis (senhas, tokens, IP).
 * Valores sensíveis nunca são enviados.
 */

export type AnalyticsEventName =
  // --- Page views ------------------------------------------------------------
  | "page_viewed"

  // --- Navegação / Header ----------------------------------------------------
  | "nav_link_clicked"
  | "cta_clicked"
  | "language_changed"

  // --- Home (marketing) ------------------------------------------------------
  | "hero_cta_clicked"
  | "section_viewed"
  | "model_card_viewed"
  | "model_gallery_opened"

  // --- Preços e planos -------------------------------------------------------
  | "plan_viewed"
  | "plan_comparison_viewed"
  | "checkout_button_clicked"
  | "business_contact_clicked"

  // --- Editor / Gerador ------------------------------------------------------
  | "editor_opened"
  | "field_edited"
  | "template_changed"
  | "image_uploaded"
  | "image_removed"
  | "primary_color_changed"
  | "preview_opened"
  | "html_copied"
  | "png_downloaded"
  | "signature_saved"
  | "signature_delete_confirmed"

  // --- Autenticação ----------------------------------------------------------
  | "login_page_viewed"
  | "register_page_viewed"
  | "login_started"
  | "login_completed"
  | "login_failed"
  | "register_started"
  | "register_completed"
  | "google_login_started"
  | "google_login_completed"
  | "email_verification_page_viewed"
  | "email_verification_started"
  | "email_verification_completed"
  | "email_verification_failed"
  | "account_logged_out"

  // --- Pagamentos / Checkout -------------------------------------------------
  | "checkout_started"
  | "checkout_completed"
  | "checkout_failed"
  | "checkout_already_owned"
  | "payment_completed"
  | "payment_failed"
  | "payment_refunded"
  | "payment_disputed"

  // --- Exportação ------------------------------------------------------------
  | "export_started"
  | "export_completed"
  | "export_failed";

export interface AnalyticsProperties {
  [key: string]: boolean | number | string | null | undefined;
}

/**
 * Propriedades comuns de page view.
 */
export interface PageViewedProperties extends AnalyticsProperties {
  /** Caminho da rota (ex: /gerador). */
  path?: string;
  /** Título da página usado na aba do navegador / metadata. */
  title?: string;
  /** Query string da URL (ex: ?plan=lifetime). */
  query?: string;
  /** Referer interno: de qual página o usuário veio (quando disponível). */
  internal_referer?: string;
  /** Usuário está autenticado? */
  signed_in?: boolean;
  /** Plano do usuário: "free" | "pro" | "business". */
  user_tier?: "free" | "pro" | "business";
}

/**
 * nav_link_clicked: clique em link de navegação do header.
 */
export interface NavLinkClickedProperties extends AnalyticsProperties {
  link: string;
  link_label: string;
}

/**
 * cta_clicked: clique em botão de chamada para ação genérico.
 */
export interface CtaClickedProperties extends AnalyticsProperties {
  cta_label: string;
  cta_location: string;
  destination?: string;
}

/**
 * language_changed: troca de idioma (pt-BR <-> en).
 */
export interface LanguageChangedProperties extends AnalyticsProperties {
  from: string;
  to: string;
}

/**
 * section_viewed: usuário entrou na seção da home (id da âncora).
 */
export interface SectionViewedProperties extends AnalyticsProperties {
  section: string;
  section_label: string;
}

/**
 * model_card_viewed: visualização de card de modelo na galeria da home.
 */
export interface ModelCardViewedProperties extends AnalyticsProperties {
  model_id: string;
  model_label: string;
  tier: "free" | "pro" | "exclusive";
}

/**
 * plan_viewed: visualização de card de preço/plano.
 */
export interface PlanViewedProperties extends AnalyticsProperties {
  plan: string;
  plan_label: string;
  amount_cents: number;
  is_exclusive?: boolean;
}

/**
 * checkout_button_clicked: clique no botão de checkout de um plano.
 */
export interface CheckoutButtonClickedProperties extends AnalyticsProperties {
  plan: string;
  plan_label: string;
  amount_cents: number;
  signed_in: boolean;
  destination?: string;
}

/**
 * editor_opened: usuário abriu o editor de assinaturas.
 */
export interface EditorOpenedProperties extends AnalyticsProperties {
  signed_in: boolean;
  user_tier: "free" | "pro" | "business";
  editing_existing: boolean;
}

/**
 * field_edited: alteração de campo do formulário do editor.
 */
export interface FieldEditedProperties extends AnalyticsProperties {
  field: string;
  template?: string;
}

/**
 * template_changed: troca de template no seletor.
 */
export interface TemplateChangedProperties extends AnalyticsProperties {
  from_template?: string;
  to_template: string;
  premium_template: boolean;
}

/**
 * image_uploaded: envio de foto ou logo.
 */
export interface ImageUploadedProperties extends AnalyticsProperties {
  kind: "photo" | "logo";
}

/**
 * primary_color_changed: alteração da cor principal.
 */
export interface PrimaryColorChangedProperties extends AnalyticsProperties {
  color: string;
}

/**
 * preview_opened: foco na prévia ao vivo.
 */
export interface PreviewOpenedProperties extends AnalyticsProperties {
  premium: boolean;
  locked_template: boolean;
}

/**
 * html_copied: cópia do código HTML da assinatura.
 */
export interface HtmlCopiedProperties extends AnalyticsProperties {
  premium: boolean;
}

/**
 * png_downloaded: download da assinatura em PNG.
 */
export interface PngDownloadedProperties extends AnalyticsProperties {
  premium: boolean;
  free_export?: boolean;
}

/**
 * signature_saved: assinatura salva/atualizada no banco.
 */
export interface SignatureSavedProperties extends AnalyticsProperties {
  created: boolean;
  template: string;
  premium: boolean;
}

/**
 * signature_delete_confirmed: exclusão de assinatura confirmada pelo usuário.
 */
export interface SignatureDeletedProperties extends AnalyticsProperties {
  signature_id: string;
  signature_name: string;
}

/**
 * login_started / register_started: tentativa de autenticação iniciada.
 */
export interface AuthStartedProperties extends AnalyticsProperties {
  method: "credentials" | "google";
  destination?: string;
}

/**
 * login_completed / register_completed: autenticação concluída com sucesso.
 */
export interface AuthCompletedProperties extends AnalyticsProperties {
  method: "credentials" | "google";
  email_verified: boolean;
  destination?: string;
}

/**
 * login_failed / register_completed falhas.
 */
export interface AuthFailedProperties extends AnalyticsProperties {
  method: "credentials" | "google";
  reason: string;
}

/**
 * checkout_started: início de cobrança (server-side).
 */
export interface CheckoutStartedProperties extends AnalyticsProperties {
  plan: string;
  plan_label: string;
  amount_cents: number;
  payment_method: string;
  dev_mode: boolean;
}

/**
 * checkout_completed: pagamento aprovado e acesso liberado (server-side).
 */
export interface CheckoutCompletedProperties extends AnalyticsProperties {
  plan: string;
  plan_label: string;
  amount_cents: number;
  payment_method: string;
  order_id: string;
  dev_mode: boolean;
}

/**
 * payment_completed: confirmação de pagamento via webhook (server-side).
 */
export interface PaymentCompletedProperties extends AnalyticsProperties {
  plan: string;
  plan_label: string;
  amount_cents: number;
  payment_method: string;
  order_id: string;
  provider: string;
}

/**
 * export_started: início de exportação (HTML ou PNG).
 */
export interface ExportStartedProperties extends AnalyticsProperties {
  format: "html" | "png";
  premium: boolean;
}

/**
 * export_completed: exportação concluída.
 */
export interface ExportCompletedProperties extends AnalyticsProperties {
  format: "html" | "png";
  premium: boolean;
  signature_id?: string;
}

/**
 * export_failed: falha na exportação.
 */
export interface ExportFailedProperties extends AnalyticsProperties {
  format: "html" | "png";
  premium: boolean;
  error: string;
}

/**
 * Mapa estático de descrições legíveis de cada evento, usado em dashboards,
 * documentação e auditoria. Mantido sincronizado com AnalyticsEventName.
 */
export const EVENT_DESCRIPTIONS: Record<AnalyticsEventName, string> = {
  page_viewed: "Visualização de página. Dispara sempre que o usuário navega para uma rota nova.",
  nav_link_clicked: "Clique em um link de navegação do header (Sobre, Modelos, Planos, Empresas, Minha conta).",
  cta_clicked: "Clique em um botão de chamada para ação (CTA) genérico.",
  language_changed: "Troca de idioma da interface (português <-> inglês).",
  hero_cta_clicked: "Clique no CTA principal da seção hero da home.",
  section_viewed: "Usuário visualizou uma seção da página inicial (âncora).",
  model_card_viewed: "Visualização de um card de modelo na galeria da home.",
  model_gallery_opened: "Abertura da galeria de modelos.",
  plan_viewed: "Visualização de um card de preço/plano na página de preços.",
  plan_comparison_viewed: "Visualização da tabela comparativa Free vs Pro.",
  checkout_button_clicked: "Clique no botão de checkout de um plano (leva ao login ou ao checkout).",
  business_contact_clicked: "Clique para solicitar contato do plano Business.",
  editor_opened: "Usuário abriu o editor de assinaturas (gerador).",
  field_edited: "Alteração de um campo do formulário do editor (nome, cargo, e-mail, etc.).",
  template_changed: "Troca de template no seletor de modelos do editor.",
  image_uploaded: "Envio de foto de perfil ou logo no editor.",
  image_removed: "Remoção de foto ou logo do editor.",
  primary_color_changed: "Alteração da cor principal da assinatura.",
  preview_opened: "Prévia ao vivo carregada/focada no editor.",
  html_copied: "Cópia do código HTML da assinatura para a área de transferência.",
  png_downloaded: "Download da assinatura em formato PNG.",
  signature_saved: "Assinatura salva ou atualizada no banco de dados.",
  signature_delete_confirmed: "Exclusão de assinatura confirmada pelo usuário.",
  login_page_viewed: "Visualização da página de login.",
  register_page_viewed: "Visualização da página de cadastro.",
  login_started: "Tentativa de login iniciada.",
  login_completed: "Login concluído com sucesso.",
  login_failed: "Falha no login (credenciais inválidas).",
  register_started: "Tentativa de cadastro iniciada.",
  register_completed: "Cadastro concluído (conta criada, e-mail de verificação enviado).",
  google_login_started: "Login com Google iniciado.",
  google_login_completed: "Login com Google concluído.",
  email_verification_page_viewed: "Visualização da página de confirmação de e-mail.",
  email_verification_started: "Solicitação de verificação de e-mail iniciada.",
  email_verification_completed: "E-mail confirmado com sucesso.",
  email_verification_failed: "Falha ao confirmar o e-mail (token inválido/expirado).",
  account_logged_out: "Logout da conta.",
  checkout_started: "Início de cobrança no checkout (servidor).",
  checkout_completed: "Pagamento aprovado e acesso liberado (servidor).",
  checkout_failed: "Falha ao iniciar o checkout (servidor).",
  checkout_already_owned: "Usuário já possui acesso ao plano selecionado.",
  payment_completed: "Confirmação de pagamento recebida via webhook (servidor).",
  payment_failed: "Falha de pagamento (servidor).",
  payment_refunded: "Reembolso de pagamento (servidor).",
  payment_disputed: "Disputa/contestação de pagamento (servidor).",
  export_started: "Início de exportação da assinatura (HTML ou PNG).",
  export_completed: "Exportação concluída com sucesso.",
  export_failed: "Falha ao exportar a assinatura.",
} as const;

/**
 * Nome amigável para agrupamento de eventos em relatórios.
 */
export const EVENT_GROUPS: Record<string, string> = {
  page_viewed: "Navegação",
  nav_link_clicked: "Navegação",
  cta_clicked: "Navegação",
  language_changed: "Navegação",
  hero_cta_clicked: "Marketing",
  section_viewed: "Marketing",
  model_card_viewed: "Marketing",
  model_gallery_opened: "Marketing",
  plan_viewed: "Preços",
  plan_comparison_viewed: "Preços",
  checkout_button_clicked: "Preços",
  business_contact_clicked: "Preços",
  editor_opened: "Editor",
  field_edited: "Editor",
  template_changed: "Editor",
  image_uploaded: "Editor",
  image_removed: "Editor",
  primary_color_changed: "Editor",
  preview_opened: "Editor",
  html_copied: "Editor",
  png_downloaded: "Editor",
  signature_saved: "Editor",
  signature_delete_confirmed: "Editor",
  login_page_viewed: "Autenticação",
  register_page_viewed: "Autenticação",
  login_started: "Autenticação",
  login_completed: "Autenticação",
  login_failed: "Autenticação",
  register_started: "Autenticação",
  register_completed: "Autenticação",
  google_login_started: "Autenticação",
  google_login_completed: "Autenticação",
  email_verification_page_viewed: "Autenticação",
  email_verification_started: "Autenticação",
  email_verification_completed: "Autenticação",
  email_verification_failed: "Autenticação",
  account_logged_out: "Autenticação",
  checkout_started: "Pagamentos",
  checkout_completed: "Pagamentos",
  checkout_failed: "Pagamentos",
  checkout_already_owned: "Pagamentos",
  payment_completed: "Pagamentos",
  payment_failed: "Pagamentos",
  payment_refunded: "Pagamentos",
  payment_disputed: "Pagamentos",
  export_started: "Exportação",
  export_completed: "Exportação",
  export_failed: "Exportação",
} as const;
