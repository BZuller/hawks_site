import { mkdir, readFile, writeFile } from "node:fs/promises";
import { render, getPageMeta, pagePaths, publicBlogFeed, blogProductIds } from "../.ssr/entry-server.js";
const dist = new URL("../dist/", import.meta.url);
const template = await readFile(new URL("index.html", dist), "utf8");
const manifest = JSON.parse(await readFile(new URL('.vite/manifest.json', dist), 'utf8'));
const routeModule = (path) => path === '/' ? 'src/components/HomePage.tsx' : path.startsWith('/servicos/') ? 'src/components/ServicePage.tsx' : 'src/components/EditorialPages.tsx';
function preloadRoute(path) {
  const files = new Set();
  const collect = (key) => {
    const chunk = manifest[key];
    if (!chunk || files.has(chunk.file)) return;
    files.add(chunk.file);
    for (const dependency of chunk.imports ?? []) collect(dependency);
  };
  collect(routeModule(path));
  return [...files].map((file) => `<link rel="modulepreload" crossorigin href="/${file}" />`).join('');
}
const root = '<div id="root"></div>';
if (!template.includes(root)) throw new Error("Ponto de montagem React não encontrado.");
const escape = (value) => value.replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
for (const path of [...pagePaths, "/404/"]) {
  const meta = getPageMeta(path);
  let html = template.replace(root, `<div id="root">${await render(path)}</div>`).replace(/<title>.*?<\/title>/, `<title>${escape(meta.title)}</title>`);
  const values = { description: meta.description, robots: meta.exists ? "index, follow, max-image-preview:large" : "noindex, follow", "og:title": meta.title, "og:description": meta.description, "og:url": meta.url, "og:type": meta.type, "twitter:title": meta.title, "twitter:description": meta.description };
  for (const [key, value] of Object.entries(values)) html = html.replace(new RegExp(`(<meta (?:name|property)="${key}" content=")[^"]*("[^>]*>)`), (_, before, after) => `${before}${escape(value)}${after}`);
  html = html.replace(/<link rel="canonical" href="[^"]+"[^>]*>/, meta.exists ? `<link rel="canonical" href="${meta.url}" />` : "").replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/, `<script type="application/ld+json">${JSON.stringify(meta.graph).replaceAll("<", "\\u003c")}</script>`);
  html = html.replace('</head>', `${preloadRoute(path)}</head>`);
  const target = path === "/404/" ? new URL("404.html", dist) : new URL(`${path.slice(1)}index.html`, dist);
  await mkdir(new URL(".", target), { recursive: true });
  await writeFile(target, html);
}
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${pagePaths.map((path) => `  <url><loc>${getPageMeta(path).url}</loc></url>`).join("\n")}\n</urlset>\n`;
await writeFile(new URL("sitemap.xml", dist), sitemap);
await writeFile(new URL("../public/sitemap.xml", import.meta.url), sitemap);
console.log(`Pré-renderizadas ${pagePaths.length} páginas + página 404.`);

await mkdir(new URL("blog/feeds/", dist), { recursive: true });
await writeFile(new URL("blog/feed.json", dist), JSON.stringify(publicBlogFeed(), null, 2) + "\n");
for (const product of blogProductIds) {
  await writeFile(new URL(`blog/feeds/${product}.json`, dist), JSON.stringify(publicBlogFeed(product), null, 2) + "\n");
}

// Feed is the canonical list of published posts; drafts never enter this sitemap.
const blogEntries = publicBlogFeed().articles;
const blogSitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${blogEntries.map(a=>`<url><loc>${a.url}</loc><lastmod>${a.date}</lastmod></url>`).join('')}</urlset>\n`;
await writeFile(new URL('sitemap-blog.xml',dist),blogSitemap);
