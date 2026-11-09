# Identificação da empresa no site da Hawks BI

- id: inf-550-identidade-institucional-ato-local
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

O rodapé institucional passa a informar a razão social e o CNPJ usados no portfólio HAWKS BI da Meta. A mesma identificação aparece nos metadados da organização. A prévia correspondente no Ato Local alinha o rodapé e a identificação do responsável na política de privacidade.

## Por que ajuda e como usar

O visitante encontra a identificação da empresa no rodapé dos sites. O vínculo entre o boletim e a Hawks BI continua documentado na página do produto.

## Evidências e limitações

- Site institucional baseado em 4794c3a. Build, lint, SEO de 14 rotas, integridade Hawks e detector Impeccable passaram.
- Ato Local baseado em 396ebfb. Os dois HTMLs de partida correspondem byte a byte à produção. A prévia serve a inicial e a privacidade com HTTP 200.
- Rodapés e identificação conferidos no navegador em desktop e celular. Prévia, aprovação visual e publicação são etapas separadas.
- Alteração de conteúdo institucional e metadados. Padrões compartilhados, catálogo editorial, integrações e cobrança ficam fora do escopo. A worktree fica retida para a revisão da prévia.

## Tratamento editorial

Registro de alteração institucional. A disponibilidade será registrada após a publicação confirmada.
