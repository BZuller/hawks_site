# Ato Local no catálogo da Hawks BI

- id: inf-550-ato-local-catalogo-hawks
- products: [hawks, atolocal]
- type: improvement
- editorial_status: pendente
- availability: implementado
- integrated_at: pendente
- released_at: pendente
- issue: https://linear.app/infra-hawks/issue/INF-550
- pull_request: pendente
- commit: pendente
- published_url: pendente
- published_at: pendente
- weekly_post: pendente

## O que mudou

A página inicial e o catálogo do site da Hawks BI passam a apresentar o Ato Local by Hawks BI como boletim independente de Gravataí. A página do produto descreve o Diário Oficial, as sessões da Câmara e a consulta pelo WhatsApp. Os links apontam para a página pública do boletim.

## Por que ajuda e como usar

A seção de produtos identifica a Hawks BI como operadora do boletim e oferece um caminho direto para conhecer o Ato Local.

## Evidências e limitações

- Base `bb7bb0a` de `origin/master`, em worktree isolada `codex/inf-550-ato-local-produtos`.
- Node 22.23.1. Build, tipos, SEO de 14 rotas, feed, nove testes de contato, integridade Hawks e detector Impeccable passaram.
- Prévia local conferida no navegador em 1280, 768 e 390 px, com quatro, duas e uma coluna. Link direto, abertura da página por teclado, foco visível e movimento reduzido conferidos.
- Wordmark derivado da marca existente do Ato Local. O catálogo, o sitemap, os metadados e o feed filtrado são gerados pela mesma fonte. O feed começa vazio.
- Site institucional em prévia local. Integração e publicação pendentes. O registro fica na worktree até revisão da entrega.

## Tratamento editorial

A nota pode entrar na seleção semanal após a confirmação de disponibilidade no site público. A mudança é local ao catálogo institucional e não exige alterações no padrão compartilhado, no boletim ou em integrações.
