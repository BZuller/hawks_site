import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import { hasType, validateSchema } from './validate-schema.mjs';

const dist = new URL("../dist/", import.meta.url);
const html = await readFile(new URL("index.html", dist), "utf8");
const meta = (key) => html.match(new RegExp(`<meta (?:name|property)="${key}" content="([^"]+)"`))?.[1];
const canonical = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
assert.equal(canonical, "https://hawksbi.com.br/");
assert.equal(meta("og:url"), canonical);
assert.equal((html.match(/<h1(?:\s|>)/g) ?? []).length, 1, "A página deve ter um título principal no HTML inicial.");
assert.match(html, /<html lang="pt-BR"/);
assert.match(html, /Software sob medida/);
assert.match(html, /automação de processos/);
assert.match(html, /id="servicos"/);
assert.match(html, /id="contato"/);
assert.ok(meta("description")?.length >= 80);
assert.ok(!meta("robots")?.includes("noindex"));
assert.equal(meta("twitter:image"), meta("og:image"));
const image = new URL(meta("og:image"));
assert.equal(image.origin, new URL(canonical).origin);
await access(new URL(image.pathname.slice(1), dist));
const graph = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1]);
assert.equal(graph["@context"], "https://schema.org");
assert.ok(graph["@graph"].some((entity) => entity["@type"] === "WebPage"));
assert.ok(graph["@graph"].some((entity) => hasType(entity, 'Organization')));
assert.equal(graph["@graph"].filter((entity) => entity["@type"] === "Service").length, 4);
const ids = graph["@graph"].map((entity) => entity["@id"]);
assert.equal(new Set(ids).size, ids.length);
const sitemap = await readFile(new URL("sitemap.xml", dist), "utf8");
const robots = await readFile(new URL("robots.txt", dist), "utf8");
assert.ok(sitemap.includes(`<loc>${canonical}</loc>`));
assert.ok(robots.includes(`Sitemap: ${canonical}sitemap.xml`));
assert.ok(!/Disallow:\s*\/\s*$/m.test(robots));
console.log("SEO verificado: conteúdo pré-renderizado, título principal, metadados, entidades, imagem, canonical, robots e sitemap.");

// Validate the generated routes and cross-page links, not just the home template.
const { pagePaths, getPageMeta } = await import('../.ssr/entry-server.js');
const pages = new Map();
const titles = new Set();
for (const path of pagePaths) {
  const page = await readFile(new URL(`${path.slice(1)}index.html`, dist), 'utf8');
  pages.set(path, page);
  const expected = getPageMeta(path);
  assert.ok(page.includes(`<link rel="canonical" href="${expected.url}"`), `Canonical: ${path}`);
  assert.equal((page.match(/<h1(?:\s|>)/g) ?? []).length, 1, `H1: ${path}`);
  assert.equal((page.match(/<main(?:\s|>)/g) ?? []).length, 1, `Main: ${path}`);
  assert.ok(!/name="robots" content="[^"]*noindex/.test(page), `Indexável: ${path}`);
  const title = page.match(/<title>(.*?)<\/title>/)?.[1];
  assert.ok(title && !titles.has(title), `Título único: ${path}`);
  titles.add(title);
  assert.ok(sitemap.includes(`<loc>${expected.url}</loc>`), `Sitemap: ${path}`);
  const structured = validateSchema(page, path);
  assert.equal(structured['@graph'].find((item) => hasType(item, 'WebPage') || hasType(item, 'CollectionPage')).url, expected.url);
  if (path.startsWith('/blog/') && path !== '/blog/') {
    const post = structured['@graph'].find((item) => item['@type'] === 'BlogPosting');
    assert.ok(post?.headline && post?.author?.name && post?.datePublished, `Artigo: ${path}`);
    assert.ok(page.includes(post.headline), `Título do artigo visível: ${path}`);
  }
  for (const match of page.matchAll(/(?:src|poster)="(\/[^"#]+)"/g)) await access(new URL(match[1].slice(1), dist));
}
const inbound = new Set();
for (const [path, page] of pages) {
  for (const [, href] of page.matchAll(/href="([^\"]+)"/g)) {
    if (!href.startsWith('/') && !href.startsWith('#')) continue;
    if (href.startsWith('/assets/')) continue;
    const target = new URL(href, `https://hawksbi.com.br${path}`);
    const targetPage = pages.get(target.pathname);
    assert.ok(targetPage, `Link interno quebrado em ${path}: ${href}`);
    if (target.pathname !== path) inbound.add(target.pathname);
    if (target.hash) assert.ok(targetPage.includes(`id="${target.hash.slice(1)}"`), `Âncora ausente: ${href}`);
  }
}
for (const path of pagePaths) assert.ok(inbound.has(path), `Página órfã: ${path}`);
const missing = await readFile(new URL('404.html', dist), 'utf8');
assert.match(missing, /name="robots" content="noindex, follow"/);
assert.ok(!missing.includes('rel="canonical"'));
assert.ok(!sitemap.includes('/404/'));
assert.match(html, /<video[^>]*controls=""[^>]*playsInline=""[^>]*preload="none"/);
console.log(`Rotas verificadas: ${pagePaths.length} páginas, arquivos de mídia, links internos, âncoras, artigos e 404.`);

// Local business facts must agree with visible content on every route.
for (const [path, page] of pages) {
  assert.ok(page.includes('Gravataí'), `Base local: ${path}`);
  assert.ok(!page.includes('São Paulo'), `Localidade antiga: ${path}`);
  const entities = JSON.parse(page.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1])['@graph'];
  const organization = entities.find((entity) => hasType(entity, 'Organization'));
  assert.equal(organization.address.addressLocality, 'Gravataí');
  const ids = new Set(entities.map((entity) => entity['@id']));
  function checkRefs(value) {
    if (!value || typeof value !== 'object') return;
    if (Object.keys(value).length === 1 && value['@id']) assert.ok(ids.has(value['@id']), `Entidade não resolvida em ${path}: ${value['@id']}`);
    for (const child of Object.values(value)) checkRefs(child);
  }
  checkRefs(entities);
  if (path.startsWith('/servicos/')) {
    const service = entities.find((entity) => entity['@type'] === 'Service');
    assert.equal(service.url, getPageMeta(path).url);
    assert.equal(service.areaServed.name, 'Gravataí');
    assert.ok(page.includes('Atendimento presencial'));
    assert.equal(organization.email, 'comercial@hawksbi.com.br');
    assert.ok(page.includes('aria-haspopup="dialog"'));
    assert.ok(!page.includes('mailto:'));
  }
}
console.log('SEO local: base, serviços, contato e referências JSON-LD consistentes.');
console.log('Schema: endereço completo, telefone, horários, produtos, catálogo, breadcrumbs e conteúdo visível consistentes.');
