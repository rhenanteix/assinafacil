# Dashboard, onboarding e Business

O primeiro acesso de uma conta confirmada sem assinaturas passa pelo onboarding em `/dashboard`, inclusive quando o destino de cadastro era `/gerador`. Os rascunhos do gerador são recuperados; o progresso do onboarding é guardado na sessão do navegador. A conclusão salva a identidade na conta e abre o editor para criar a primeira assinatura. Contas com assinaturas existentes podem abrir o fluxo em **Minha identidade**.

## Banco

Aplicar `npm run db:migrate` antes de disponibilizar esta versão. A migração `20261107000000_workspace` adiciona somente `User.workspace` (JSONB opcional). Não altera assinaturas existentes. Gerar o cliente com `npx prisma generate` em instalações que não executem o postinstall.

## Business

O Business é anunciado por R$ 89,90 inicial + R$ 9,90/mês por empresa, com equipe sem limite. A contratação continua comercial; o checkout existente não ganhou SKU nem cobrança recorrente automática. O acesso Business reconhece um registro em `Order` com `plan = business`, `status = approved` e `expiresAt` futuro, respeitando a mesma separação entre pagamentos reais e de teste dos demais planos. A criação desse registro deve fazer parte da operação comercial já autorizada; esta mudança não transforma pedidos pendentes ou compras Pro em Business.

Pastas são privadas à conta, não representam convites ou compartilhamento com outros usuários. Cada pasta define nome, cor e modelo inicial. Novas assinaturas abertas dentro da pasta herdam esse estilo e a identidade da empresa. Mover uma assinatura existente muda sua organização, preservando seu conteúdo. O servidor verifica o plano e a propriedade da pasta em cada gravação.

## Imagens e cores

O upload utiliza a integração Cloudinary existente e seu limite de 3 MB. A extração de cor acontece no navegador a partir da imagem original: pixels transparentes e quase neutros são ignorados. A cor é uma sugestão editável; logos monocromáticas mantêm a cor selecionada. Free mantém as restrições existentes de template, imagens, cores e redes sociais.

## Validação

`npm run typecheck`, `npm test` e `npm run build`. Os testes de workspace cobrem propriedade das pastas e acesso Business. Validar visualmente no navegador o 404, os quatro passos do onboarding, envio de logo, retomada após recarregar, criação e movimentação entre áreas, além dos layouts mobile e desktop. Essa validação visual não foi automatizada nesta implementação.
