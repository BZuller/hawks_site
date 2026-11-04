## Guias do projeto

[AGENTS](AGENTS.md) · [PRODUCT](PRODUCT.md) · [DESIGN](DESIGN.md) · [Contrato](docs/project-workflow.md) · [Mapa documental](docs/documentation-map.md) · [Estado](docs/status.md).

Padrões Hawks fixados em [.hawks/workflow.json](.hawks/workflow.json); validação: `python3 .hawks/check.py`. Alterações comuns exigem fonte central e propagação global.

# hawks_site

## Adoção Hawks 1.2.1

[AGENTS](AGENTS.md), [manifesto fixado](.hawks/workflow.json), [contrato](docs/project-workflow.md), [estado da adoção](docs/status.md). As instruções Hawks governam edição versionada: métodos antigos de edição direta/publicação não dispensam worktree nem os gates atuais. Estado de produto descrito anteriormente deve ser revalidado na fonte antes de operar.

## SEO e personagens — INF-539
Build gera `/sitemap-blog.xml` a partir do feed público. Execute `node scripts/check-blog-indexing.mjs` após o build para conferir todos os posts, links, canonical e ambos os sitemaps. Rascunhos continuam excluídos.
