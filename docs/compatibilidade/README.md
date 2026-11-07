# Testes reais por modelo

`matriz.csv` contém 180 combinações de 15 modelos, 6 clientes e modo claro/escuro. Todos estão **pendentes**: não há acesso autenticado aos clientes necessários nem evidência de envio/recebimento para aprová-los. Testes de HTML/PNG e screenshots do site não substituem esses testes.

`fixtures/` contém HTML exportado com dados fictícios, sem envio de e-mail. A execução de `node --import tsx scripts/compatibility-fixtures.ts` regenera a matriz como pendente; arquive resultados preenchidos antes de regenerar.

Para cada caso:

1. Instalar o HTML no cliente indicado e registrar versão do app/SO.
2. Enviar a uma caixa de teste autorizada e abrir a mensagem recebida.
3. Conferir nomes longos, linhas, logo/foto, links, imagens bloqueadas, respostas e encaminhamentos.
4. Repetir nos modos claro e escuro; em telas móveis, verificar largura.
5. Salvar screenshot e, quando possível, `.eml` sem dados reais. Registrar data, evidência e resultado: pass/fail/partial.
6. Testar também PNG separadamente, lembrando que ele não tem links individuais.
7. Somente então atualizar a página pública `/compatibilidade` com resultados e limitações.
