<p align="center">
  <img src="mascote/Friendly%20Cat%20Mascot%20with%20Envelope-1.png" width="200" alt="Mascote do Maily, um gato com um envelope" />
</p>

<h1 align="center">Maily</h1>

<p align="center">
  Assinaturas de e-mail com a sua identidade.<br />
  Crie, personalize e exporte sua assinatura em português ou inglês.
</p>

<p align="center">
  <a href="https://www.maily.com.br">Site</a> ·
  <a href="#rodar-localmente">Instalação</a> ·
  <a href="#configuração">Configuração</a> ·
  <a href="#publicar-em-produção">Deploy</a> ·
  <a href="#verificações">Verificações</a>
</p>

## O projeto

O Maily é uma aplicação de criação de assinaturas de e-mail, com editor visual, prévia, conta de usuário e checkout integrado. São 15 modelos: um gratuito, 12 modelos adicionais do Pro e dois exclusivos vendidos separadamente.

O projeto nasceu como **AssinaFácil**. Esse nome ainda aparece no nome do pacote, em identificadores internos e em alguns recursos legados do repositório.

### O que você pode fazer

- Experimentar o modelo gratuito antes de criar uma conta.
- Salvar assinaturas e exportá-las depois de confirmar o e-mail.
- Personalizar modelos premium com cores, foto, logo e redes sociais.
- Exportar PNG ou HTML, conforme o acesso adquirido.
- Comprar pelo checkout transparente AbacatePay, com Pix e boleto; cartão depende de habilitação na conta e chave pública.
- Alternar entre **português do Brasil e inglês**, preservando os dados do editor. Os preços permanecem em reais.

### Planos e modelos

| Opção | O que inclui | Preço |
| --- | --- | --- |
| Essencial Free | Uma assinatura com layout e cor fixos; contatos, WhatsApp, registro profissional, CNPJ, endereço e aviso opcional; exportação HTML clicável e PNG com marca | Gratuito |
| Pro | 12 modelos padrão adicionais, personalização, imagens, redes sociais e exportação HTML/PNG | R$ 49,90, pagamento único |
| Signature Luxe | Modelo exclusivo, adquirido individualmente | R$ 24,90 |
| Brand Desk | Modelo exclusivo, adquirido individualmente | R$ 24,90 |
| Business | Serviço para equipes, sob orçamento e com entrega manual | Sob consulta |

Os valores são definidos no servidor em [lib/payments/plans.ts](lib/payments/plans.ts). Os planos mensal e anual permanecem no código para atender compras antigas.

## Como funciona

<p align="center">
  <img src="mascote/Violet-eyed%20cat%20mascot%20behind%20a%20laptop-2.png" width="220" alt="Mascote do Maily trabalhando em um notebook" />
</p>

1. A pessoa abre o gerador e preenche os dados da assinatura.
2. Cria uma conta e confirma o e-mail para salvar e exportar.
3. Usa o Essencial ou adquire acesso aos modelos premium.
4. Exporta a assinatura e a configura no cliente de e-mail.

O HTML usa tabelas e estilos inline. O PNG é uma imagem e **não preserva links clicáveis**. Clientes de e-mail podem bloquear imagens externas; por isso, fotos e logos precisam de URLs públicas acessíveis; os ícones sociais usam PNGs públicos em `/social`, com texto alternativo. Configure `NEXT_PUBLIC_SITE_URL` com a origem HTTPS de produção.

## Rodar localmente

**Requisitos:** Node.js 22 ou superior, npm e PostgreSQL. Docker Compose é opcional para iniciar o banco local.

```sh
npm ci
cp .env.example .env
openssl rand -base64 32
```

Coloque o segredo gerado em `NEXTAUTH_SECRET` e confira `DATABASE_URL` no `.env`. Não use o valor de exemplo como segredo real. Para usar o banco fornecido pelo projeto:

```sh
docker compose up -d --wait
npm run db:migrate
npm run dev
```

Abra **http://localhost:3000**. Se sua versão do Docker não aceitar `--wait`, aguarde o PostgreSQL iniciar antes de executar as migrations. Se usar outro banco, configure a conexão e pule o comando do Docker.

Credenciais locais podem ficar em `.env.local`, ignorado pelo Git. O Next.js carrega esse arquivo, mas o comando Prisma de migrations usa `.env` ou as variáveis do processo: confira a conexão antes de migrar para não atualizar outro banco.

Para concluir cadastro, confirmação e compra, configure também o Resend e o AbacatePay. Sem essas integrações, iniciar a aplicação não valida o fluxo completo.

## Configuração

Use [.env.example](.env.example) como referência. **Nunca publique arquivos `.env` ou chaves privadas.** Em produção, configure as variáveis no provedor de hospedagem; elas não são enviadas junto com o código.

### Aplicação e banco

| Variável | Uso |
| --- | --- |
| `DATABASE_URL` | Conexão PostgreSQL. A conexão usada nas migrations precisa permitir alterações no schema. |
| `NEXTAUTH_URL` | Origem da aplicação: `http://localhost:3000` localmente; `https://www.maily.com.br` em produção. |
| `NEXTAUTH_SECRET` | Segredo aleatório, distinto por ambiente. |
| `NEXT_PUBLIC_SITE_URL` | Origem pública para canonical, sitemap e recursos legados. Sem ela, robots bloqueia indexação. |
| `BUSINESS_CONTACT_EMAIL` | Destinatário das solicitações Business enviadas pelo Resend. |

### Confirmação de e-mail — Resend

| Variável | Uso |
| --- | --- |
| `RESEND_API_KEY` | Chave com permissão de envio para o domínio configurado. |
| `VERIFICATION_FROM_EMAIL` | Remetente de domínio verificado, por exemplo `Maily <acesso@maily.com.br>`. |

Verifique o domínio no painel do Resend antes de usar o remetente. Uma caixa Gmail não substitui essa verificação. A origem de `NEXTAUTH_URL` determina o endereço do link enviado: em produção ela não pode apontar para localhost.

O link expira em 24 horas, e apenas seu hash é armazenado. A confirmação exige uma ação na página para evitar consumo por pré-carregamento de e-mail. Há intervalo de um minuto entre pedidos de reenvio. Se o envio falhar, a conta continua criada e pode solicitar outro link depois do login. Em timeout, o token permanece válido caso a mensagem chegue posteriormente.

Google OAuth é opcional: configure `GOOGLE_CLIENT_ID` e `GOOGLE_CLIENT_SECRET`, com callback `<origem>/api/auth/callback/google`. Sem ambos, o app usa e-mail e senha. O login Google exige e-mail confirmado pelo provedor.

### Imagens — Cloudinary

Configure `CLOUDINARY_URL` no formato `cloudinary://API_KEY:API_SECRET@CLOUD_NAME` para uploads. Os arquivos são públicos para que possam ser exibidos nos clientes de e-mail. O endpoint aceita imagens de até 3 MB.

### Checkout — AbacatePay v2

| Variável | Uso |
| --- | --- |
| `ABACATEPAY_API_KEY` | Chave privada v2 com permissões `TRANSPARENT:CREATE` e `TRANSPARENT:READ`. |
| `ABACATEPAY_ENVIRONMENT` | `test` ou `production`, consistente com a chave. |
| `ABACATEPAY_WEBHOOK_SECRET` | Segredo privado compartilhado com o webhook. |
| `ABACATEPAY_PUBLIC_KEY` | Chave pública `pk_…` do mesmo ambiente, necessária apenas para cartão. |

Use bancos e credenciais separados para teste e produção. Pagamentos de teste não liberam acesso em produção. O checkout exige conta com e-mail confirmado.

Rotas de compra: `/checkout?plan=lifetime`, `/checkout?plan=signature-luxe` e `/checkout?plan=brand-desk`. O cartão só aparece quando a chave pública está configurada; a conta AbacatePay também precisa ter checkout transparente com cartão habilitado. A tokenização usa o iframe oficial, sem enviar dados brutos de cartão ao app.

#### Webhook

Endpoint de produção:

```text
https://www.maily.com.br/api/payments/abacatepay/webhook
```

Inscreva os eventos `transparent.completed`, `transparent.refunded`, `transparent.disputed` e `transparent.lost`. Configure o segredo no cadastro do webhook; o provedor o envia na query string.

Com o endpoint publicado e as variáveis do ambiente de destino carregadas:

```sh
npm run payments:webhook
```

O script usa `NEXTAUTH_URL`, exige HTTPS público e permissões `WEBHOOK:CREATE` e `WEBHOOK:READ`. Não duplica um endpoint existente; nesse caso, confira seu segredo e suas inscrições no painel.

#### Consistência dos pagamentos

Os preços vêm do servidor. Cada cobrança é vinculada ao usuário e ao pedido; tentativas repetidas reutilizam pedidos pendentes. O webhook valida segredo e HMAC, consulta o estado atual da cobrança e confere valor, ambiente e vínculo antes de liberar acesso. Eventos são registrados em transação para lidar com repetições.

Reembolsos e disputas atualizam o acesso. Um erro de rede ambíguo mantém o pedido como `uncertain`, sem criar automaticamente uma nova cobrança. Após confirmar o identificador no painel, reconcilie com:

```sh
npm run payments:reconcile -- <orderId> <paymentId>
```

O comando confere vínculo, valor e ambiente antes de alterar o pedido. Execute-o com a conexão e as credenciais do ambiente correspondente.

O endpoint legado `/api/payments/webhook` atende pedidos Mercado Pago. Preserve `MP_ACCESS_TOKEN`, `MP_WEBHOOK_SECRET` e a configuração `MP_SANDBOX` enquanto houver compras antigas que possam receber notificações. Novas compras usam AbacatePay.

## Publicar em produção

<p align="center">
  <img src="mascote/Joyful%20leaping%20cat%20delivering%20an%20envelope-3.png" width="200" alt="Mascote do Maily entregando um envelope" />
</p>

Na Vercel, importe a raiz do projeto com preset **Next.js** e Node.js 22+. O `vercel.json` usa `node scripts/vercel-build.mjs`: em produção, aplica migrations antes do build e interrompe o deploy se elas falharem. Em preview, executa apenas o build.

1. Configure as variáveis no ambiente **Production**, incluindo Resend, AbacatePay e banco.
2. Defina `NEXTAUTH_URL` e `NEXT_PUBLIC_SITE_URL` como `https://www.maily.com.br`.
3. Confira que `DATABASE_URL` aponta para o **banco de produção** e permite migrations. O build da Vercel executa `npm run db:migrate` automaticamente apenas quando `VERCEL_ENV=production`. O comando local `npm run build` continua sem alterar o banco.
4. Publique o código e confira se o domínio atende a nova versão.
5. Cadastre ou confira o webhook AbacatePay para o domínio final.
6. Valide cadastro, recebimento do e-mail, confirmação, login e exportação Free.
7. Valide o pagamento e a liberação do acesso, incluindo recebimento do webhook.

**Build aprovado não significa integração validada em produção.** Chave aceita pela API não comprova criação de cobrança, entrega de e-mail ou processamento de webhook. A habilitação de cartão também depende do provedor.

As migrations preservam registros existentes. Inclua a pasta `prisma/migrations` no deploy; aplicar uma migration no banco local não atualiza o banco de produção.

## Arquitetura

| Camada | Tecnologias e responsabilidade |
| --- | --- |
| Interface | Next.js 15 App Router, React 19, TypeScript e Tailwind CSS |
| Editor | React Hook Form, Zod e Framer Motion |
| Autenticação | NextAuth, senha com bcrypt e confirmação via Resend |
| Persistência | Prisma e PostgreSQL; permissões conferidas no servidor |
| Pagamentos | AbacatePay v2, conciliação de pedidos e eventos autenticados |
| Exportação | PNG Free e HTML Free/Pro no servidor; PNG premium no navegador |
| Imagens | Cloudinary para uploads e arquivos locais para ícones e mascote |

```text
app/                 Páginas e Route Handlers
components/          Editor, autenticação, checkout e interface
lib/auth/            Fluxos de conta e confirmação
lib/i18n/            Traduções, locale e providers
lib/abacatepay/       Cliente e segurança do provedor
lib/payments/        Planos, validação e estados de pagamento
lib/prisma/          Banco e regras de acesso
prisma/              Schema e migrations
scripts/             Configuração e reconciliação operacional
public/mascote/      Imagens usadas pela aplicação
mascote/             Artes do mascote usadas neste README
tests/               Testes de exportação, tradução e pagamentos
```

Veja também [ARVORE.txt](ARVORE.txt).

### Regras de acesso e exportação

A prévia Free é pública e pode ser salva como qualquer imagem exibida no navegador. O botão de exportação do produto exige conta confirmada, salva a assinatura e registra a primeira exportação. A conta Free mantém uma assinatura; campos premium são descartados no servidor.

O PNG Free é composto no servidor com `sharp`, fontes DejaVu e seus arquivos de licença em `assets/fonts`. O HTML Free/Pro usa tabelas e estilos inline; a exportação verifica novamente as permissões. Dados do usuário são escapados.

O rascunho do editor fica no `sessionStorage`. Ao iniciar cadastro, uma cópia em `localStorage`, válida por uma hora, permite retomar o trabalho em outra aba. As cópias são removidas ao salvar ou sair; senhas não fazem parte do rascunho.

Instagram, Facebook, LinkedIn, WhatsApp, YouTube, TikTok, X e GitHub aparecem quando preenchidos com URLs HTTPS válidas da rede. Os arquivos legados em `public/social` mantêm licença e atribuição Font Awesome Free. Novas exportações usam links textuais para não depender dessas imagens. Para regenerar recursos locais:

```sh
node scripts/generate-social-icons.mjs
node --import tsx examples/generate.ts
```

### API

| Método | Caminho | Função |
| --- | --- | --- |
| GET, POST | /api/auth/[...nextauth] | Sessão, OAuth e credenciais |
| POST | /api/register | Cadastro com hash bcrypt e envio de confirmação |
| POST | /api/auth/resend-verification | Reenviar link para a conta autenticada |
| POST | /api/auth/verify-email | Consumir token de confirmação |
| POST | /api/preview | Prévia Free pública em PNG |
| POST | /api/signatures/preview | Prévia HTML premium autorizada |
| POST | /api/signatures/export | PNG Free ou HTML Free/Pro autenticados |
| GET, POST | /api/signatures | Listar ou criar assinaturas do usuário |
| PATCH, DELETE | /api/signatures/:id | Editar ou excluir assinatura do usuário |
| POST | /api/upload | Upload autenticado de imagem de até 3 MB |
| POST | /api/payments/checkout | Criar/reutilizar cobrança transparente autenticada |
| GET | /api/payments/orders/:id | Consultar pagamento do usuário autenticado |
| POST | /api/payments/abacatepay/webhook | Validar e reconciliar eventos AbacatePay |
| POST | /api/payments/webhook | Processar evento assinado do Mercado Pago |

## Verificações

```sh
npx prisma validate
npm run typecheck
npm test
npm run build
```

Para executar apenas os testes de pagamento e tradução:

```sh
node --import tsx --test tests/payments.test.ts tests/i18n.test.ts
```

O teste de integração de pagamentos é opcional e fica ignorado sem `PAYMENT_TEST_DATABASE_URL`. Ele exige um banco descartável chamado `payment_test`, em `127.0.0.1:55432`, com as migrations aplicadas. Usa PostgreSQL real e respostas simuladas do provedor; não efetua cobranças reais. Nunca aponte testes para o banco de produção.

## Problemas comuns

| Sintoma | O que verificar |
| --- | --- |
| `Order.devMode does not exist` | Aplique `npm run db:migrate` no mesmo banco usado pelo app. |
| Confirmação retorna 503 | Confira Resend, domínio, remetente e os logs `[verification]` no servidor. Reinicie o servidor local após alterar variáveis. |
| Link de confirmação aponta para localhost | Corrija `NEXTAUTH_URL` no ambiente que envia o e-mail. |
| Checkout indisponível | Confira chave privada, segredo do webhook e ambiente explícito `test` ou `production`. |
| Cartão não aparece | Configure a chave pública `pk_…` e confirme a habilitação na conta AbacatePay. |
| Pagamento sem acesso liberado | Confira pedido, ambiente, webhook e logs; use reconciliação após identificar a cobrança. |
| Ícones não aparecem no e-mail | Confira `NEXT_PUBLIC_SITE_URL` e bloqueio de imagens externas no cliente. |

## Referências

- [Resend: domínio verificado](https://resend.com/docs/dashboard/domains/introduction)
- [AbacatePay: checkout transparente](https://docs.abacatepay.com/pages/transparents/reference)
- [AbacatePay: cartão](https://docs.abacatepay.com/pages/transparents/card) e [script de tokenização](https://docs.abacatepay.com/pages/transparents/abacatepay-js)
- [AbacatePay: segurança dos webhooks](https://docs.abacatepay.com/pages/webhooks/security) e [eventos](https://docs.abacatepay.com/pages/webhooks/events/transparent)


## Assinaturas profissionais e compatibilidade

Os 15 exemplos usam perfis fictícios por profissão. O editor aceita registro profissional
(CRECI, OAB, CRM, CRC), CNPJ, endereço, aviso legal opcional e WhatsApp com código do país
ou link oficial. Os campos novos têm valores padrão para preservar assinaturas antigas.
Nenhum registro profissional ou CNPJ é autenticado pela aplicação.

No Free, os dados profissionais e o WhatsApp aparecem no PNG como texto. No HTML,
o domínio do site e os contatos são links. Redes sociais usam nomes em texto clicável,
sem depender de SVG, base64 ou imagens no domínio Maily. Isso não corrige exportações
já instaladas: é necessário exportar e instalar novamente a assinatura.

Fotos enviadas são convertidas em PNG 256 × 256, com recorte central e máscara circular
aplicados aos pixels. Logos são ajustados proporcionalmente em tela transparente.
Imagens antigas devem ser reenviadas para receber esse tratamento. O limite é 3 MB;
o processamento remove metadados e limita a decodificação a 25 milhões de pixels.
Fotos e logos continuam no Cloudinary e podem ser bloqueados pelo cliente de e-mail.

A exportação usa tabelas, estilos inline, fontes de sistema, dimensões de imagem e
links textuais. Não depende de `object-fit` ou SVG embutido. Isso reduz diferenças,
mas não garante aparência idêntica em Gmail, Outlook clássico, Apple Mail, modo escuro
ou versões móveis. Valide um envio real nos clientes usados pela sua equipe.

### Contato Business

`POST /api/business` envia a solicitação pelo Resend, com `reply_to` apontando para o
solicitante e destino fixo no servidor em `BUSINESS_CONTACT_EMAIL`. O endereço comercial
confirmado é `ajuda@maily.com.br`; configure essa variável também na Vercel em Production.
São necessários `RESEND_API_KEY`, `VERIFICATION_FROM_EMAIL` e PostgreSQL com as migrations.

O endpoint valida origem, tamanho e campos; usa campo antispam e limite no banco
(uma solicitação por minuto por IP/e-mail e 30 solicitações por hora no total).
O controle temporário reutiliza `VerificationToken` com prefixo `business:` e expiração,
sem mudar tokens de confirmação de contas. A interface só confirma sucesso quando
Resend aceita o envio. Aceitação não comprova entrega na caixa postal: consulte os
registros do Resend em caso de ausência. Testes automatizados simulam o provedor e
não enviam mensagens reais.

O primeiro HTML Free exportado também registra `firstFreeExportAt`, permitindo acompanhar a adoção do Free. Isso não representa analytics de cliques nas assinaturas.
