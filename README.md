# PDF em Texto Corrido

Ferramenta pessoal: envie um PDF, o texto é extraído e reorganizado em
formato corrido (parágrafos fluidos, sem as quebras de linha do layout
original), e um novo PDF é gerado para download.

## Como funciona (sem login, sem histórico)

- Não há banco de dados, não há autenticação, não há cookies de sessão.
- O arquivo enviado é processado inteiramente em memória, dentro da mesma
  requisição, e descartado assim que a resposta é enviada. Nada fica salvo
  no servidor.
- Ao recarregar a página ou sair e voltar, não existe nenhum estado
  anterior: o fluxo começa do zero a cada visita.

## Rodando localmente

```bash
npm install
npm run dev
```

Acesse http://localhost:3000

## Deploy no Vercel

1. Suba este repositório no GitHub.
2. No Vercel, clique em "New Project" e importe o repositório.
3. Não é necessário configurar nenhuma variável de ambiente.
4. Deploy — o Vercel detecta o Next.js automaticamente.

## Limitações conhecidas

- PDFs escaneados (imagem, sem texto selecionável) não têm texto extraído
  — seria necessário OCR, que não está incluído aqui.
- A separação de parágrafos é feita por heurística (linhas em branco,
  hifenização, pontuação final). Para PDFs com layout muito irregular
  (colunas, tabelas), o resultado pode precisar de ajuste manual.
- O PDF gerado é texto simples (fonte única, sem preservar imagens,
  cabeçalhos/rodapés ou formatação do original).
