# AssinaFácil

Aplicação full-stack com 15 modelos. O Essencial Free mostra uma prévia PNG pública, tem layout e cor fixos e aceita somente nome, cargo, empresa, telefone e e-mail. Para salvar e gerar o download, o usuário confirma o e-mail. A exportação Free é um PNG rasterizado no servidor com marca AssinaFácil. O Pro libera os 12 modelos padrão adicionais, HTML, cores, foto, logo e redes sociais. Os dois modelos exclusivos são vendidos individualmente.


## Rodar localmente

Requisitos: Node.js 22+, npm e PostgreSQL (local, remoto ou via Docker Compose).

```sh
cp .env.example .env
openssl rand -base64 32
docker compose up -d --wait
npm ci
npm run db:migrate
npm run dev
```

Insira a saída do OpenSSL em `NEXTAUTH_SECRET` antes de iniciar. Abra http://localhost:3000. Use o PostgreSQL do Compose ou ajuste `DATABASE_URL` para sua instância. Se o Docker não oferecer `--wait`, aguarde o PostgreSQL aceitar conexões antes de migrar.

Rotas de interface: `/`, `/gerador`, `/precos`, `/login`, `/cadastro`, `/verificar-email`, `/dashboard`, `/checkout`.

## Integrações e ambiente

| Variável | Configuração |
| --- | --- |
| DATABASE_URL | PostgreSQL. Use conexão que permita migrations para `npm run db:migrate`. |
| NEXTAUTH_URL | Origem canônica. Exemplo local `http://localhost:3000`. Para checkout, use HTTPS público. |
| NEXTAUTH_SECRET | Segredo aleatório e distinto por ambiente. |
| GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET | Cliente OAuth Web. Autorize `<origem>/api/auth/callback/google`. Sem ambos, apenas e-mail e senha ficam disponíveis. O NextAuth mantém o método original se o mesmo e-mail já existir. |
| CLOUDINARY_URL | Credencial da conta no formato `cloudinary://API_KEY:API_SECRET@CLOUD_NAME`. Os arquivos enviados são públicos para exibição em clientes de e-mail. |
| MP_ACCESS_TOKEN | Access Token da aplicação Checkout Pro. |
| MP_WEBHOOK_SECRET | Assinatura secreta da configuração Webhooks do Mercado Pago. |
| NEXT_PUBLIC_SITE_URL | Origem HTTPS oficial para canonical, robots e sitemap. Sem configuração, robots bloqueia indexação do ambiente. |
| BUSINESS_CONTACT_EMAIL | E-mail comercial para pedidos de orçamento Business. O CTA abre um e-mail preenchido. |
| RESEND_API_KEY | Chave do Resend para envio dos links de confirmação de cadastro. |
| VERIFICATION_FROM_EMAIL | Remetente de um domínio verificado no Resend. Exemplo `AssinaFácil <acesso@seu-dominio.com.br>`. |
| MP_SANDBOX | Use `true` para sandbox e `false` em produção. |

### Pagamentos — AbacatePay v2

O checkout transparente fica em `/checkout?plan=lifetime` (Pro) ou usa `signature-luxe` / `brand-desk`. Pix e boleto ficam no próprio site. Cartão usa o iframe oficial `https://abacatepay.com/abacatepay.js`, somente quando existe a chave pública `pk_...` e a conta tem cartão transparente habilitado. Dados do cartão não passam pelo app. Valores continuam em BRL: Pro R$ 49,90; exclusivos R$ 24,90.

Configuração por ambiente:

- `ABACATEPAY_API_KEY`: chave v2 privada com `TRANSPARENT:CREATE` e `TRANSPARENT:READ`.
- `ABACATEPAY_PUBLIC_KEY`: chave pública `pk_...` do mesmo ambiente; opcional para Pix/boleto.
- `ABACATEPAY_WEBHOOK_SECRET`: segredo aleatório privado, compartilhado com o webhook.
- `ABACATEPAY_ENVIRONMENT`: `test` ou `production`, consistente com a chave. Use bancos separados. Pagamentos de teste não liberam acesso em produção.
- `NEXTAUTH_URL` e `NEXT_PUBLIC_SITE_URL`: `https://www.maily.com.br` em produção.
- `NEXTAUTH_SECRET` e um método de confirmação de conta funcional: Resend (`RESEND_API_KEY`, `VERIFICATION_FROM_EMAIL`) ou Google OAuth.

Execute `npm run db:migrate` **antes** de publicar. A migration adiciona campos ao pedido e uma tabela de eventos; preserva as compras antigas. Configure o webhook HTTPS final em `https://www.maily.com.br/api/payments/abacatepay/webhook` para `transparent.completed`, `transparent.refunded`, `transparent.disputed`, `transparent.lost`. O secret é configurado no cadastro do webhook; a AbacatePay o adiciona à query string automaticamente.

`npm run payments:webhook` cadastra o endpoint definido em `NEXTAUTH_URL`; exige também `WEBHOOK:CREATE` e `WEBHOOK:READ`. O script não duplica endpoints existentes. Confirme o secret e os eventos no painel se o endpoint já existir.

O servidor fixa preços e vincula cada cobrança ao pedido e ao usuário. Há bloqueio transacional por usuário, chave de tentativa e reaproveitamento de pedidos pendentes. Em timeout/erro ambíguo, o pedido fica `uncertain`: nunca há retentativa automática de cobrança. O webhook pode recuperar a cobrança pelo `metadata.orderId`. Para reconciliação operacional após confirmar o ID no painel, use `npm run payments:reconcile -- <orderId> <paymentId>`; a ferramenta confere vínculo, valor e ambiente antes de alterar o pedido.

Webhooks verificam secret privado e HMAC do corpo original, consultam a cobrança atual na API, conferem valor/ambiente/vínculo e registram o ID do evento em transação. Repetições e eventos atrasados não duplicam acesso nem desfazem reembolsos. Disputas suspendem acesso; a resolução favorável mais recente pode restabelecê-lo. A consulta autenticada de status limita leituras ao provedor a uma por dez segundos por pedido. Tokens reutilizáveis de cartão e documentos do pagador não são persistidos ou devolvidos ao navegador.

O endpoint legado `/api/payments/webhook` continua atendendo exclusivamente pedidos Mercado Pago. Mantenha suas credenciais antigas enquanto houver pagamentos que possam receber notificações. Novas compras usam apenas AbacatePay.

Documentação utilizada: [checkout transparente](https://docs.abacatepay.com/pages/transparents/reference), [cartão](https://docs.abacatepay.com/pages/transparents/card), [script do cartão](https://docs.abacatepay.com/pages/transparents/abacatepay-js), [segurança dos webhooks](https://docs.abacatepay.com/pages/webhooks/security), [eventos](https://docs.abacatepay.com/pages/webhooks/events/transparent).

### Business

Serviço sob orçamento com entrega manual. O site apresenta o processo de briefing, aprovação de piloto e produção em lote. Configure o contato comercial para habilitar a solicitação.

### Vercel

Importe a raiz do projeto com o preset Next.js e Node.js 22 ou superior. Configure as variáveis no painel, com uma origem canônica e um PostgreSQL para cada ambiente. Execute `npm ci` e `npm run db:migrate` em CI ou em uma sessão autorizada antes do deploy. O build utiliza `npm run build`. Atualize os callbacks de Google e Mercado Pago com a URL pública do ambiente.

## Cadastro e confirmação

O cadastro por senha cria a conta e solicita um link de confirmação com validade de 24 horas, enviado pelo Resend. O banco guarda o hash do token. A confirmação consome o token em transação, e novos envios ficam limitados a um por minuto por conta. O link abre uma página com botão para confirmar, evitando o consumo por pré-carregamento de e-mail. Se o envio estiver indisponível, a conta continua criada e o usuário pode entrar e pedir outro link. Configure Resend e o remetente para concluir o fluxo por senha.

O login Google exige o e-mail confirmado pelo provedor. Contas antigas por senha também precisam confirmar o e-mail. As permissões são lidas do banco a cada operação de gravação ou exportação. O rascunho fica no `sessionStorage` da mesma aba. Ao iniciar o cadastro, uma cópia em `localStorage` com validade de uma hora permite retomar os dados se a confirmação abrir em outra aba. Ambas são removidas após salvar ou sair da conta. Dados de senha nunca fazem parte do rascunho.

## Free, premium e exportação

- O Essencial usa `sharp` no servidor para compor o PNG com texto quebrado automaticamente e uma moldura fixa. As fontes DejaVu e suas licenças estão incluídas em `assets/fonts` e no tracing de funções da Vercel. Os dados do usuário são escapados, e a prévia recebe apenas bytes PNG.
- A prévia Free é pública para a pessoa experimentar. Como qualquer imagem exibida na web, ela pode ser salva ou capturada pelo navegador. O botão de download do produto exige cadastro confirmado, salva a assinatura e registra a primeira exportação na conta.
- O endpoint de exportação HTML exige uma sessão verificada e um modelo desbloqueado. Ocultar o botão na interface é acompanhado pela checagem no servidor.
- Cores, imagens e links enviados por uma conta Free são descartados antes da persistência do Essencial. O bloqueio transacional mantém o limite de uma assinatura mesmo com requisições simultâneas.
- O HTML premium usa tabelas e estilos inline. Os ícones são imagens PNG com links absolutos e nomes acessíveis. O PNG premium é rasterizado no navegador após nova validação da permissão. O PNG não mantém links clicáveis.
- Os campos sociais têm valores padrão para ler registros anteriores à inclusão das novas redes.
- Depois da expiração de um Pro antigo, a conta pode visualizar os dados na versão Essencial e escolher se deseja salvar essa substituição.

## Redes sociais

Instagram, Facebook, LinkedIn, WhatsApp, YouTube, TikTok, X e GitHub aparecem somente quando preenchidos com links HTTPS da rede correspondente. Os PNGs locais ficam em `public/social`, com licença e atribuição Font Awesome Free incluídas. Configure `NEXT_PUBLIC_SITE_URL` com a origem pública antes de gerar assinaturas reais, para que os ícones sejam carregados pelos clientes de e-mail. Eles podem bloquear imagens externas conforme as configurações de privacidade.

Regenerar os ícones e exemplos locais:

```sh
node scripts/generate-social-icons.mjs
node --import tsx examples/generate.ts
```

## Arquitetura

- App Router e Server Components para páginas e leitura inicial. React Hook Form, Zod e Framer Motion no editor.
- Route Handlers, NextAuth, Prisma e PostgreSQL para conta, permissões, persistência e compras. Mutações validam origem e autorização no servidor.
- `User.createdAt` registra novos cadastros. `emailVerified` identifica confirmação, `firstFreeExportAt` registra a primeira exportação Free e `Order` registra o pagamento e a aprovação. Contas anteriores à migração mantêm data de cadastro desconhecida em `createdAt`.
- Execute as migrations em ambientes já existentes. O SQL adicional usa `ALTER TABLE` e preserva os registros.

### API

| Método | Caminho | Função |
| --- | --- | --- |
| GET, POST | /api/auth/[...nextauth] | Sessão, OAuth e credenciais |
| POST | /api/register | Cadastro com hash bcrypt e envio de confirmação |
| POST | /api/auth/resend-verification | Reenviar link para a conta autenticada |
| POST | /api/auth/verify-email | Consumir token de confirmação |
| POST | /api/preview | Prévia Free pública em PNG |
| POST | /api/signatures/preview | Prévia HTML premium autorizada |
| POST | /api/signatures/export | PNG Free autenticado ou HTML premium |
| GET, POST | /api/signatures | Listar ou criar assinaturas do usuário |
| PATCH, DELETE | /api/signatures/:id | Editar ou excluir assinatura do usuário |
| POST | /api/upload | Upload autenticado de imagem de até 3 MB |
| POST | /api/payments/checkout | Criar/reutilizar cobrança transparente autenticada |
| GET | /api/payments/orders/:id | Consultar pagamento do usuário autenticado |
| POST | /api/payments/abacatepay/webhook | Validar e reconciliar eventos AbacatePay |
| POST | /api/payments/webhook | Processar evento assinado do Mercado Pago |

## Árvore completa

Veja [ARVORE.txt](ARVORE.txt).

## Verificações

```sh
npx prisma validate
npm run typecheck
npm test
npm run build
```
