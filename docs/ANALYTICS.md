# Analytics Web — Maily (AssinaFácil)

Este documento descreve a implementação de analytics/web analytics da plataforma, os eventos capturados, as propriedades de cada evento e como adicionar novos eventos.

## Visão geral

- Provedor: **PostHog** (cliente via `posthog-js` e servidor via `posthog-node`).
- Inicialização do cliente: `lib/posthog-client.ts` (chamada em `instrumentation-client.ts` e no `PostHogProvider`).
- Identificação do usuário: `components/shared/DashboardActions.tsx` (`posthog.identify` com `userId`, `email`, `name` após login).
- Page views automáticos: `components/shared/AnalyticsPageView.tsx` (renderizado no `app/layout.tsx`, abaixo do `PostHogProvider`).
- Events server-side: `lib/posthog-server.ts` (`captureServerEvent`) usado em rotas de API (checkout, webhook AbacatePay, registro).
- Logs estruturados (OpenTelemetry): `lib/posthog-logs.ts` (`emitPostHogLog`).

## Convenção de nomeação

Os eventos seguem o padrão **`categoria_acao`**, em inglês, para facilitar funis, retenção e dashboards no PostHog:

| Prefixo | Categoria | Exemplo |
|---------|-----------|---------|
| `page_` | Navegação / visualização de página | `page_viewed` |
| `nav_` | Navegação do header | `nav_link_clicked` |
| `cta_` | Chamadas para ação | `cta_clicked` |
| `hero_` | Hero da home | `hero_cta_clicked` |
| `section_` | Seções da home | `section_viewed` |
| `model_` | Modelos da galeria | `model_card_viewed` |
| `plan_` | Planos e preços | `plan_viewed` |
| `checkout_` | Checkout / pagamento | `checkout_started` |
| `editor_` | Editor de assinatura | `editor_opened` |
| `field_` | Campos do formulário | `field_edited` |
| `template_` | Trocas de template | `template_changed` |
| `image_` | Imagens (foto/logo) | `image_uploaded` |
| `primary_color_` | Cor da assinatura | `primary_color_changed` |
| `preview_` | Prévia ao vivo | `preview_opened` |
| `html_` | Exportação HTML | `html_copied` |
| `png_` | Exportação PNG | `png_downloaded` |
| `signature_` | Assinaturas (salvar/excluir) | `signature_saved` |
| `login_` / `register_` | Autenticação | `login_completed`, `register_completed` |
| `google_login_` | Login com Google | `google_login_started` |
| `email_verification_` | Confirmação de e-mail | `email_verification_completed` |
| `account_` | Conta | `account_logged_out` |
| `payment_` | Pagamentos (servidor/webhook) | `payment_completed` |
| `export_` | Exportações | `export_completed` |

## Onde cada evento é capturado

### Page views (toda a plataforma)

`page_viewed` dispara automaticamente em toda mudança de rota (App Router), incluindo a primeira página da visita. Propriedades: `path`, `title`, `query`, `internal_referer`, `signed_in`, `user_tier`.

Arquivo: `components/shared/AnalyticsPageView.tsx`.

### Header / navegação

| Evento | Onde | Propriedades |
|--------|------|--------------|
| `cta_clicked` | Logotipo do header | `cta_label`, `cta_location`, `destination` |
| `nav_link_clicked` | Links Sobre / Modelos / Planos / Empresas | `link`, `link_label` |
| `cta_clicked` | Botão "Minha conta" | `cta_label`, `cta_location`, `destination` |
| `language_changed` | Troca PT-BR <-> English | `from`, `to` |

Arquivo: `components/layout/Header.tsx`, `components/layout/LanguageSwitcher.tsx`.

### Página inicial (marketing)

| Evento | Onde | Propriedades |
|--------|------|--------------|
| `hero_cta_clicked` | Botão "Criar minha assinatura" (hero) | `cta_label`, `cta_location`, `destination` |
| `cta_clicked` | "Explorar modelos" (hero) | `cta_label`, `cta_location`, `destination` |
| `section_viewed` | Seções #sobre, #modelos, #planos, #empresas | `section`, `section_label` |
| `model_card_viewed` | Cada card da galeria de modelos | `model_id`, `model_label`, `tier` |
| `cta_clicked` | "Experimentar no gerador" / "Ver modelos exclusivos" | `cta_label`, `cta_location`, `destination` |
| `field_edited` | Input "Experimente com seu nome" (showcase) | `field` |

Arquivo: `app/(marketing)/page.tsx`, `components/marketing/ProductShowcase.tsx`.

### Preços e planos

| Evento | Onde | Propriedades |
|--------|------|--------------|
| `plan_viewed` | Cada card de plano (Free / Pro / Business) | `plan`, `plan_label`, `amount_cents`, `is_exclusive` |
| `checkout_button_clicked` | Botão de checkout do Pro / modelos exclusivos | `plan`, `plan_label`, `amount_cents`, `signed_in`, `destination` |
| `cta_clicked` | "Criar grátis" (Free) | `cta_label`, `cta_location`, `destination` |

Arquivo: `components/marketing/Offers.tsx`, `components/shared/CheckoutButton.tsx`.

### Editor / gerador

| Evento | Onde | Propriedades |
|--------|------|--------------|
| `editor_opened` | Abrir o editor | `signed_in`, `user_tier`, `editing_existing` |
| `field_edited` | Alteração de qualquer campo do formulário | `field`, `template` |
| `template_changed` | Troca de template | `from_template`, `to_template`, `premium_template` |
| `image_uploaded` | Envio de foto ou logo | `kind` ("photo" \| "logo") |
| `image_removed` | Remoção de foto ou logo | `kind` |
| `primary_color_changed` | Mudança da cor principal | `color` |
| `html_copied` | Copiar código HTML | `premium` |
| `png_downloaded` | Download PNG | `premium`, `free_export` |
| `signature_saved` | Salvar/atualizar assinatura | `created`, `template`, `premium` |
| `signature_delete_confirmed` | Confirmar exclusão | `signature_id`, `signature_name` |

Arquivo: `components/signature/SignatureBuilder.tsx`, `components/shared/DashboardActions.tsx`.

### Dashboard

| Evento | Onde | Propriedades |
|--------|------|--------------|
| `cta_clicked` | "Conhecer o Pro", "Editar", "Nova assinatura" | `cta_label`, `cta_location`, `destination` |
| `account_logged_out` | Botão "Sair" | — |
| `signature_delete_confirmed` | Excluir assinatura | `signature_id`, `signature_name` |

Arquivo: `app/(dashboard)/dashboard/page.tsx`, `components/shared/DashboardActions.tsx`.

### Autenticação

| Evento | Onde | Propriedades |
|--------|------|--------------|
| `register_started` | Início de cadastro | `method`, `destination` |
| `register_completed` | Conta criada | `method`, `email_verified`, `destination`, `verification_sent` |
| `login_started` | Início de login | `method`, `destination` |
| `login_completed` | Login com sucesso | `method`, `email_verified`, `destination` |
| `login_failed` | Login falhou | `method`, `reason` |
| `google_login_started` | Login com Google | `method`, `destination` |

Arquivo: `components/shared/AuthForm.tsx`.

### Pagamentos e checkout (servidor)

| Evento | Onde | Propriedades |
|--------|------|--------------|
| `checkout_started` | Início de cobrança (API checkout) | `plan`, `plan_label`, `amount_cents`, `payment_method`, `dev_mode` |
| `checkout_failed` | Falha ao criar cobrança | `plan`, `payment_method`, `amount_cents`, `dev_mode`, `failure_type` |
| `checkout_already_owned` | Usuário já tem o plano | `plan`, `payment_method`, `amount_cents`, `dev_mode` |
| `payment_completed` | Webhook AbacatePay aprovado | `plan`, `plan_label`, `amount_cents`, `payment_method`, `order_id`, `dev_mode` |
| `payment_refunded` | Webhook AbacatePay reembolsado | `plan`, `plan_label`, `amount_cents`, `payment_method`, `order_id`, `dev_mode` |
| `payment_disputed` | Webhook AbacatePay disputado | `plan`, `plan_label`, `amount_cents`, `payment_method`, `order_id`, `dev_mode` |
| `payment_failed` | Webhook AbacatePay perdido/falhou | `plan`, `plan_label`, `amount_cents`, `payment_method`, `order_id`, `dev_mode`, `reason` |
| `account_registered` | API de registro | `verification_sent` |

Arquivo: `app/api/payments/checkout/route.ts`, `app/api/payments/abacatepay/webhook/route.ts`, `app/api/register/route.ts`.

## Como usar os helpers (cliente)

```tsx
import { track, trackPageView, identifyUser, resetUser } from "@/lib/posthog-client";

// Evento genérico
track("cta_clicked", { cta_label: "Criar minha assinatura", cta_location: "hero" });

// Page view com propriedades ricas
trackPageView({ path: "/gerador", title: "Gerador", signed_in: true, user_tier: "pro" });

// Identificar usuário (após login)
identifyUser(userId, { email, name });

// Resetar identidade (logout)
resetUser();
```

Apenas chame `track` no cliente. O helper nunca lança exceções visíveis ao usuário: se o PostHog não estiver inicializado, o evento é ignorado silenciosamente.

## Propriedades que NUNCA devem ser enviadas

Não enviar dados sensíveis ou identificadores diretos além do consentido:
- senhas, tokens de sessão, chaves de API, webhook secrets
- endereço IP (o PostHog coleta automaticamente, não envie manualmente)
- conteúdo completo de assinaturas ou dados pessoais detalhados (nome/e-mail apenas no `identify`)

## Como adicionar um novo evento

1. Adicione o nome à união `AnalyticsEventName` em `lib/analytics/events.ts`.
2. Adicione a descrição em `EVENT_DESCRIPTIONS` e o grupo em `EVENT_GROUPS` (mesmo arquivo).
3. (Opcional) Crie uma interface de propriedades estendendo `AnalyticsProperties` para tipagem.
4. Chame `track("nome_do_evento", { ...propriedades })` no local desejado.
5. Documente o evento neste arquivo (`docs/ANALYTICS.md`).

## Configuração de ambiente

Variáveis necessárias (veja `.env.example`):

| Variável | Obrigatório | Uso |
|----------|-------------|-----|
| `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN` | Sim | Token do projeto PostHog |
| `NEXT_PUBLIC_POSTHOG_HOST` | Sim | Host do PostHog (ex: `https://us.posthog.com`) |

Em desenvolvimento, a ausência dessas variáveis exibe erro no console (cliente) ou lança erro (servidor via `instrumentation.ts`) para que eventos não sejam perdidos silenciosamente.

Em produção, configure as variáveis no provedor de hospedagem (Vercel). O `next.config.ts` já reescreve `/ingest/*` para o PostHog, evitando bloqueios de ad-blocker e problemas de CORS.

## Verificações

```sh
npm run typecheck   # valida tipos dos eventos e propriedades
npm run build       # build de produção
npm test            # testes da aplicação
```

## Privacidade

O PostHog captura automaticamente page views, page leave e exceções (conforme `capture_pageview`, `capture_pageleave`, `capture_exceptions` em `lib/posthog-client.ts`). Eventos customizados são enviados apenas nas interações listadas acima. Nenhum dado sensível é rastreado.
