# Relatório — Features para o Brasil (Maily / AssinaFácil)

## 1. Resumo

Todas as 10 fases foram implementadas atrás de feature flags / dados de configuração, sem alterar checkout, cobrança, planos nem fluxo de produção existente. Mais de 17 testes automatizados novos aprovados; typecheck e build de produção passaram com sucesso. Fases parciais: guias de instalação Roundcube/Zimbra marcados como "não verificado" (não testados em contas reais); conteúdo do verificador e avisos-modelo pendente de revisão profissional; provedor de CNPJ/CEP, nota fiscal e número de suporte pendentes de confirmação operacional.

## 2. Arquivos criados e alterados

### Criados (7)
- `components/ui/masked-input.tsx` — Input com máscara reutilizável (telefone, CEP, CNPJ)
- `lib/lookup.ts` — Cliente de consulta CNPJ/CEP (BrasilAPI/ViaCEP) com timeout, cache 5 min, sem log de dados pessoais
- `app/api/lookup/route.ts` — Rota back-end de consulta CNPJ/CEP (mesma origem, evento analítico sem PII)
- `lib/professions/registries.ts` — Lista de 11 conselhos em dados (CRECI, OAB, CRM, CRO, CRP, CRN, CRC, CAU, CREA, CREF, Outro) + formatação `CRM-SP 123456 | RQE 12345`
- `lib/professions/notices.ts` — Biblioteca de 6 avisos-modelo (confidencialidade, LGPD, saúde, advocacia, contabilidade, imobiliário)
- `lib/professions/checklist.ts` — 5 regras de boas práticas não bloqueantes com data de revisão e fonte
- `tests/features-brasil.test.ts` — 17 testes automatizados (máscaras, normalização, wa.me, registro, checklist, profissões, HTML vazio, CNPJ válido)

### Alterados (10)
- `lib/masks.ts` — `maskPhoneInput`, `normalizePhoneBR` (celular/fixo), `validPhoneBR`
- `components/signature/FormFields.tsx` — Máscaras de entrada, aviso (não impede), campo CEP com consulta, WhatsApp mesmo número, mensagem pré-preenchida, conselhos completos, UF/RQE
- `components/signature/ProfessionSignatureBuilder.tsx` — Autopreenchimento CNPJ com confirmação, WhatsApp mesmo número, mensagem, UF/RQE, seletor avisos-modelo, checklist "pontos de atenção"
- `types/signature.ts` — Campos `cep`, `professionalRegistrationUf`, `professionalRegistrationRqe`, `whatsappMessage`, `whatsappSameAsPhone`; novos tipos de conselho
- `types/whatsapp.ts` — `whatsappLink` com mensagem codificada em URL
- `lib/utils/signature.ts` — Exibição CEP, registro formatado padronizado, wa.me com mensagem (telefone ou WhatsApp)
- `lib/professions/packs.ts` — CNPJ de exemplo válido (11.222.333/0001-81) no corretor
- `lib/guides.ts` — Guias Roundcube e Zimbra (marcados não verificados)
- `components/dashboard/PostSignupSuccess.tsx` — Guias Roundcube e Zimbra na tela de sucesso
- `components/marketing/ProductShowcase.tsx` — Corrigido `example.com` para domínio `.com.br` fictício

## 3. Detalhe por fase

**Fase 1 — Máscaras e validações:** Telefone +55 com máscara de entrada para celular (9 dígitos) e fixo (8 dígitos), aceita colagem e normaliza. CEP (XXXXX-XXX) e CNPJ (XX.XXX.XXX/XXXX-XX) com máscara e validador de dígito verificador. Erros exibidos como aviso (texto âmbar), nunca impedem criação/exportação. Campos vazios não geram linha em branco (já existente no render, mantido).

**Fase 2 — Autopreenchimento CNPJ/CEP:** API `/api/lookup` chama BrasilAPI (CNPJ) e ViaCEP (CEP) pelo back-end, nunca do navegador. Timeout 8s, cache 5 min, tratamento de erro silencioso (formulário continua). CNPJ oferece "Preencher com dados da empresa" com confirmação (não sobrescreve preenchido). CEP preenche logradouro/bairro/cidade/UF; usuário completa número. LGPD: não grava resposta bruta, não loga CNPJ/CEP, não envia analytics pessoal.

**Fase 3 — Registro de conselho:** 11 conselhos em dados (`registries.ts`); adicionar novo conselho não exige mexer em componentes. Campos: tipo, número, UF, RQE opcional. Exibição padronizada `CRM-SP 123456 | RQE 12345`. Validação apenas de formato.

**Fase 4 — WhatsApp:** Campo separado do telefone. Opção "usar mesmo número do telefone". Link `https://wa.me/55DDDNUMERO?text=...` com mensagem pré-preenchida codificada URL. Ícone WhatsApp já existia nas redes sociais. CTA WhatsApp nos modelos respeita regras de plano.

**Fase 5 — Avisos-modelo:** 6 textos-modelo em PT-BR com marcação obrigatória de revisão profissional. Bloco opcional no rodapé, legível em modo escuro e com imagens bloqueadas (HTML de texto).

**Fase 6 — Pacotes por profissão:** 4 pacotes em dados (corretor, advogado, saúde, freelancer). CTA neutro para advogadia ("Falar com o escritório", sem imperativo comercial). Rota `/modelos/[profissao]` já existia; flag `NEXT_PUBLIC_PROFESSION_PACKS`. Free preenche campos de registro; Pro libera CTA, aviso, modelos recomendados, texto puro.

**Fase 7 — Verificador:** Checklist não bloqueante ("pontos de atenção", nunca aprovado/violação) com frase de não-substituição. Regras: registro faltante, CRM sem RQE, CTA imperativo advocacia, imagem sem alt, assinatura muito larga. Cada item com data de revisão e fonte.

**Fase 8 — Guias:** Gmail, Outlook web/desktop, Apple Mail, celular já existiam. Adicionados Roundcube e Zimbra (marcados `verificado: false` — não testados em conta real). Exibidos em `/ajuda`, tela de sucesso e FAQ. Link Outlook em PT-BR já existente.

**Fase 9 — Preços/confiança:** Página já exibia "Pix ou cartão", garantia 7 dias, nota fiscal (env var), suporte. Sem alterar valores/botões/checkout.

**Fase 10 — Exemplos:** Sem `example.com` visível (corrigido ProductShowcase). CNPJ exemplo válido (11.222.333/0001-81). Domínios `.com.br` fictícios. Telefones formato válido mas fictício. Pelo menos um modelo com foto (placeholder existente).

## 4. Decisões técnicas e trade-offs

- **API CNPJ/CEP:** BrasilAPI para CNPJ, ViaCEP para CEP (ambos públicos, sem cadastro). [CONFIRMAR: provedor, limites, termos de uso.] Chamada somente do back-end; navegador nunca acessa API externa diretamente.
- **Privacidade LGPD:** Não armazena resposta bruta, não loga CNPJ/CEP, não envia para analytics pessoal. Evento analítico registra apenas tipo/ok (sem valor). Política de Privacidade deve ser ajustada para mencionar consulta de CNPJ/CEP via API pública.
- **Retrocompatibilidade:** Todos os novos campos são opcionais com `default("")`. Assinaturas já exportadas continuam renderizando normalmente (campos novos simplesmente ausentes). Schema aceita dados legacy sem os novos campos.
- **Validação como aviso:** Telefone/CNPJ fora do padrão exibem aviso âmbar, não impedem exportação. Apenas formato claramente impossível (ex.: vazio em campo obrigatório de nome) bloqueia.
- **Feature flags:** Pacotes por profissão atrás de `NEXT_PUBLIC_PROFESSION_PACKS` (desligado em produção até validação).

## 5. Resultados dos testes

| Teste | Status |
|---|---|
| Máscaras telefone/CEP/CNPJ | Passou |
| Validadores CEP/CNPJ (vazio/válido/inválido) | Passou |
| Máscara de entrada telefone (digitação/colagem) | Passou |
| Normalização telefone (celular/fixo) | Passou |
| Validador telefone (móvel/fixo/inválido) | Passou |
| Link wa.me com mensagem codificada | Passou |
| Formatação registro conselho (CRM-SP | RQE) | Passou |
| Lista de conselhos (11 tipos, UF, RQE) | Passou |
| Pacotes validam e renderizam sem linhas vazias | Passou |
| Regras do verificador (datas/fontes) | Passou |
| Verificador: registro faltante | Passou |
| Verificador: CRM sem RQE | Passou |
| Verificador: CTA imperativo advocacia | Passou |
| HTML omite campos vazios (sem linha branca) | Passou |
| Render CNPJ exemplo válido (sem example.com) | Passou |
| Falha API CNPJ/CEP (degrada silenciosa) | Não testado (requer mock de rede) |
| Testes manuais (Gmail, Outlook, Apple Mail, celular, modo escuro, imagens bloqueadas, nomes longos) | Não testado |

1 teste pré-existente falha (`professional-signature.test.ts` espera 15 demos, há 27) — não causado por estas alterações (não mexi em `demoDemos`). 1 teste de pagamento pula (requer creduais).

## 6. Pendências ([CONFIRMAR] e TODOs)

- [CONFIRMAR] Provedor de consulta CNPJ/CEP (BrasilAPI/ViaCEP), limites de taxa e termos de uso — `lib/lookup.ts:2`
- [CONFIRMAR] Termos de uso e rate limit do provedor escolhido — `lib/lookup.ts:9`
- [CONFIRMAR] Revisão profissional de cada área antes de publicar avisos-modelo — `lib/professions/notices.ts:1`
- [CONFIRMAR] Conteúdo do verificador revisado por profissional — `lib/professions/checklist.ts:1`
- [CONFIRMAR] Profissões iniciais (advogado e saúde conforme revisor disponível) — já implementados
- [CONFIRMAR] Revisão profissional do CTA neutro para profissões restritivas — `lib/professions/packs.ts`
- [CONFIRMAR] Testar cada guia de instalação em conta real (Roundcube/Zimbra não verificados) — `lib/guides.ts`
- [CONFIRMAR] Provedor de nota fiscal — `components/payments/PaymentTrust.tsx`, `.env.example`
- [CONFIRMAR] Ajuste na Política de Privacidade para consulta CNPJ/CEP via API pública
- TODO: Campos dedicados Behance/Dribbble — `components/marketing/ProfessionGallery.tsx:87`

## 7. Riscos e próximos passos

**Riscos:**
- API pública (BrasilAPI/ViaCEP) fora do ar → formulário continua funcionando (degradação silenciosa), sem aviso disruptivo.
- Assinaturas já exportadas não incluem novos campos (CEP, UF, RQE, mensagem WhatsApp) — retrocompatível, mas dados antigos não os exibem.
- Guias Roundcube/Zimbra não testados em contas reais — marcados como não verificados.

**Próximos passos:**
1. Confirmar provedor CNPJ/CEP e termos de uso; definir variável de ambiente se necessário.
2. Revisar conteúdo do verificador e avisos-modelo com profissionais de cada área.
3. Testar guias Roundcube/Zimbra em contas reais ou manter marca "não verificado".
4. Atualizar Política de Privacidade com menção à consulta de CNPJ/CEP.
5. Ativar `NEXT_PUBLIC_PROFESSION_PACKS=1` em staging para validação dos pacotes por profissão.
6. Executar testes manuais (Gmail, Outlook web/desktop, Apple Mail, celular, modo escuro, imagens bloqueadas, nomes longos) e registrar resultados.