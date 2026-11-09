export const guides = {
  "assinatura-de-email-para-corretor": {
    title: "Assinatura de e-mail para corretor de imóveis",
    description: "Crie sua assinatura com CRECI, WhatsApp, imobiliária e endereço. Escolha o que mostrar e exporte em HTML ou PNG.",
    sections: [
      ["Seu próximo contato pode virar uma visita", "Apresente nome, função e imobiliária com clareza. Acrescente seu registro CRECI, a cidade em que atua e um WhatsApp com código do país. Evite sobrecarregar o rodapé com vários telefones."],
      ["Exemplo fictício, com contexto brasileiro", "Marina Costa · Corretora de imóveis · Horizonte Imóveis · São Paulo/SP. No gerador, selecione CRECI e preencha seu registro real. Use apenas marcas, fotos e dados que você tem autorização para divulgar."],
      ["Comece grátis; personalize com o Pro", "WhatsApp, CRECI, OAB, CRM, CRC, CNPJ, endereço e aviso legal são campos opcionais disponíveis também no Free. O Pro acrescenta cores, foto, logo, redes sociais e 12 modelos, incluindo um modelo com banner, sem marca Maily."],
      ["Links ou imagem?", "Use HTML para o cliente clicar nos contatos. PNG é uma imagem: os contatos não ficam clicáveis individualmente. Faça um envio de teste no aplicativo que você usa antes de começar."],
    ], sources: [] as { label: string; url: string }[],
  },
  "como-colocar-assinatura-no-gmail": {
    title: "Como colocar assinatura no Gmail",
    description: "Passo a passo para instalar sua assinatura no Gmail pelo computador e conferir o comportamento no celular.",
    sections: [
      ["1. Crie e copie sua assinatura", "Preencha os dados no gerador e clique em Copiar HTML. Se o navegador copiar código em vez da assinatura formatada, abra o arquivo HTML no navegador e copie o conteúdo visual."],
      ["2. Abra as configurações do Gmail", "No computador, abra a engrenagem, escolha Ver todas as configurações e procure Assinatura na aba Geral. Crie uma assinatura e cole o conteúdo formatado no editor."],
      ["3. Escolha quando ela aparece", "Selecione a assinatura padrão para novas mensagens e respostas. Salve as alterações no fim da página. Para usar PNG, insira o arquivo pelo botão de imagem do editor."],
      ["4. Confira no celular e em modo escuro", "Envie uma mensagem para outra conta. Abra no computador e no celular; confira tamanho, contraste e links. O aplicativo Gmail tem uma configuração de assinatura móvel separada, que pode substituir a versão da web e ter limitações de formatação."],
    ], sources: [{ label: "Ajuda oficial do Gmail", url: "https://support.google.com/mail/answer/8395?hl=pt-BR" }],
  },
  "assinatura-no-outlook": {
    title: "Como colocar assinatura no Outlook",
    description: "Instalação no Outlook web, novo Outlook e Outlook clássico para desktop, com cuidados para imagens e celular.",
    sections: [
      ["Outlook web e novo Outlook", "Abra Configurações → Contas → Assinaturas. Crie uma assinatura, cole o conteúdo formatado copiado do gerador e salve. Defina os padrões para novas mensagens e respostas."],
      ["Outlook clássico no Windows", "Abra uma nova mensagem. Na guia Mensagem, escolha Assinatura → Assinaturas. Selecione a conta, crie uma assinatura e cole no editor. Configure os padrões e teste em uma nova mensagem."],
      ["Quando preferir PNG", "Se o editor alterar o HTML, experimente inserir o PNG pelo botão de imagem. Isso preserva o desenho como imagem, mas elimina links individuais e pode exigir que o destinatário autorize a exibição de imagens."],
      ["Celular e modo escuro", "Confira as configurações de assinatura de cada conta no aplicativo. Não presuma que a assinatura do desktop será sincronizada. Faça envios reais: Outlook clássico, web e celular podem renderizar o mesmo HTML de formas diferentes, especialmente no modo escuro."],
    ], sources: [{ label: "Microsoft: Outlook web em português", url: "https://support.microsoft.com/pt-br/outlook/officeweb/create-a-signature-and-automatic-reply" }, { label: "Microsoft: assinatura no Outlook desktop", url: "https://support.microsoft.com/pt-br/topic/criar-uma-assinatura-de-email-no-outlook-0f6ec33a-94dc-c87b-ad05-3bd04e89f51c" }],
  },
  "assinatura-no-roundcube": {
    title: "Como colocar assinatura no Roundcube",
    description: "Passo a passo para instalar sua assinatura no Roundcube, webmail comum em hospedagens brasileiras.",
    verificado: false,
    sections: [
      ["1. Crie e copie sua assinatura", "Preencha os dados no gerador e clique em Copiar HTML. Abra o arquivo HTML no navegador e copie o conteúdo formatado."],
      ["2. Abra as configurações do Roundcube", "No Roundcube, abra o menu de configurações (engrenagem) e escolha Identidades. Selecione sua conta de e-mail."],
      ["3. Cole a assinatura", "No campo Assinatura, cole o conteúdo formatado. Se preferir PNG, use o botão de imagem para inserir o arquivo baixado."],
      ["4. Salve e teste", "Salve as alterações e envie uma mensagem de teste para conferir a exibição, incluindo modo escuro e imagens bloqueadas."],
    ], sources: [],
  },
  "assinatura-no-zimbra": {
    title: "Como colocar assinatura no Zimbra",
    description: "Passo a passo para instalar sua assinatura no Zimbra, webmail usado em hospedagens e provedores brasileiros.",
    verificado: false,
    sections: [
      ["1. Crie e copie sua assinatura", "Preencha os dados no gerador e clique em Copiar HTML. Abra o arquivo HTML no navegador e copie o conteúdo formatado."],
      ["2. Abra as preferências do Zimbra", "No Zimbra, vá em Preferências → E-mail → Assinatura."],
      ["3. Crie a assinatura", "Clique em Nova assinatura, dê um nome e cole o conteúdo formatado no editor. Marque como assinatura padrão se desejar."],
      ["4. Salve e teste", "Salve e envie uma mensagem de teste para conferir a exibição, incluindo modo escuro e imagens bloqueadas."],
    ], sources: [],
  },
} as const;
export type GuideSlug = keyof typeof guides;
