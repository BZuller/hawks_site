import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const dist=new URL('../dist/',import.meta.url);
const feed=JSON.parse(await readFile(new URL('blog/feed.json',dist),'utf8'));
const sitemap=await readFile(new URL('sitemap.xml',dist),'utf8');
const blogMap=await readFile(new URL('sitemap-blog.xml',dist),'utf8');
const directory=await readFile(new URL('blog/index.html',dist),'utf8');
const vistoFeed = JSON.parse(await readFile(new URL('blog/feeds/visto.json', dist), 'utf8'));
assert.deepEqual(vistoFeed.articles, feed.articles.filter(article => article.products.includes('visto')));
for (const id of ['visto-personagens-equipe', 'visto-novidades-novembro-2026']) {
  assert.ok(vistoFeed.articles.some(article => article.id === id), `Post do Visto ausente: ${id}`);
}
assert.equal((blogMap.match(/<loc>/g)||[]).length,feed.articles.length);
for(const article of feed.articles){
 const path=new URL(article.url).pathname;
 const html=await readFile(new URL(`${path.slice(1)}index.html`,dist),'utf8');
 assert(sitemap.includes(`<loc>${article.url}</loc>`),`Missing sitemap: ${path}`);
 assert(blogMap.includes(`<loc>${article.url}</loc>`));
 assert(directory.includes(`href="${path}"`),`Unlinked: ${path}`);
 assert(html.includes(`rel="canonical" href="${article.url}"`));
 assert(!/content="noindex/.test(html));
 assert.equal((html.match(/<h1\b/g)||[]).length,1);
 const graph=JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1]);
 assert(graph['@graph'].some(n=>n['@type']==='BlogPosting'));
}
console.log(`${feed.articles.length} posts: HTML, canonical, indexação permitida, links e dois sitemaps conferidos.`);
