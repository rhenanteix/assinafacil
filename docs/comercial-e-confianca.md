# Oferta, confiança e validação — 07/11/2026

## Business aprovado pelo responsável

R$ 89,90 inicial + R$ 9,90/mês por empresa, equipe sem limite de pessoas. Oferta publicada nos preços e no formulário. A contratação continua pelo comercial: **não foi implementada cobrança recorrente automática** nem um checkout Business. Confirmar condições de cancelamento, ativação e faturamento na contratação. O painel atual organiza assinaturas numa conta; “equipe sem limite” não representa convites, múltiplos logins ou colaboração em tempo real.

Discord será o canal de suporte, mas ainda não existe servidor/link. O site mantém o contato real `ajuda@maily.com.br` até ele estar disponível. Não foi inventado um prazo de resposta ou emissão de nota fiscal.

## Canal comercial verificado

Em 07/11/2026, com autorização explícita, foi enviado **um único teste** por POST no `/api/business` local. Remetente: `Maily <acesso@maily.com.br>`. Destino: `ajuda@maily.com.br`. Resposta: HTTP 201, `{"ok":true}`. O código só retorna esse resultado após resposta positiva do Resend com identificador de mensagem. Isso comprova aceitação pelo provedor, **não leitura nem entrega na caixa de entrada**. Confirmar recebimento com o responsável pela caixa.

## Pendências de publicação

- Informar razão social/nome e documento do responsável: `LEGAL_ENTITY_NAME`, `LEGAL_ENTITY_DOCUMENT`.
- Confirmar política de nota fiscal: `INVOICE_POLICY`. Recibo não é nota fiscal.
- Informar prazo real de primeira resposta: `SUPPORT_RESPONSE_TIME`.
- Criar e fornecer o convite do Discord; até lá, e-mail é o único contato publicado.
- Revisar os textos jurídicos com a operação real, especialmente retenção, transferências internacionais e bases legais de analytics. Uma página de privacidade por si só não comprova conformidade LGPD.

## E-mails transacionais

Confirmação de cadastro já existente via Resend. Recuperação de senha adicionada: resposta genérica contra enumeração, limites por IP/e-mail no banco, token aleatório com hash, validade de 30 minutos, uso único e invalidação de sessões por versão. Tokens ficam no fragmento do link e o analytics não inicializa nessa página.

Recibo de compra real aprovada: integração AbacatePay e webhook legado, com registro de envio no banco. Falha de e-mail não revoga pagamento. Retentativa ao reconciliar/consultar pedido; bloqueio concorrente de 2 minutos e chave de idempotência Resend. Não há fila/cron automático novo. Tentativas com mais de 23 horas precisam de conferência manual, porque a janela de deduplicação do provedor é de 24 horas. Pagamentos `devMode` não enviam recibo. Alterar destinatário/remetente durante uma tentativa pode provocar conflito de payload da chave; verificar antes de reprocessar.

Recuperação significa recuperação de **acesso à conta**. Campanha de recuperação de checkout abandonado não foi implementada.

## Funil

Eventos: `landing_visited`, `generator_visited`, `pricing_visited`, `checkout_visited`, `signature_copied`, `signature_downloaded`, `signature_saved`, além dos eventos existentes de cadastro, checkout e `payment_completed`. Cópia/exportação são capturadas após sucesso. Não incluem dados preenchidos na assinatura. Compras usam evento de servidor; filtrar `dev_mode=false`. PostHog precisa estar configurado e acessível; bloqueadores podem impedir eventos de navegador. Não foi criado um dashboard remoto nem comprovada a ingestão dos novos eventos em produção.

## Referências verificadas

- CDC, art. 49: https://www.planalto.gov.br/ccivil_03/leis/l8078compilado.htm
- Direitos dos titulares — ANPD: https://www.gov.br/anpd/pt-br/assuntos/titular-de-dados/direito-dos-titulares
- Gmail: https://support.google.com/mail/answer/8395?hl=pt-BR
- Outlook web: https://support.microsoft.com/pt-br/outlook/officeweb/create-a-signature-and-automatic-reply
- Outlook clássico: https://support.microsoft.com/pt-br/topic/criar-uma-assinatura-de-email-no-outlook-0f6ec33a-94dc-c87b-ad05-3bd04e89f51c
- Resend, deduplicação de 24 horas: https://resend.com/changelog/idempotency-keys

## Verificação local concluída

- Chrome automatizado: preços, termos, privacidade, ajuda, guia Outlook, compatibilidade e recuperação retornaram HTTP 200.
- Dashboard autenticado: um único footer; sem overflow horizontal em 1440 px e 390 px; nenhum erro JavaScript registrado. Screenshots locais em `/tmp/maily-dashboard-desktop.png` e `/tmp/maily-dashboard-mobile.png`.
- Migração `20261107010000_transactional_email` aplicada ao PostgreSQL local.
- Testes de envio usam transporte simulado, sem novas mensagens reais. O único envio real foi o teste Business autorizado acima.
