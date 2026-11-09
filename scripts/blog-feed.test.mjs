import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { createPublicBlogFeed } from '../.ssr/entry-server.js';
const article = { slug: 'test-post', product: 'visto', title: 'Um resultado', summary: 'Resumo público', date: '2026-10-13', status: 'Em preparação', note: 'Disponibilidade pendente', sections: [], privateIssue: 'internal-only' };
test('filters drafts and private fields before producing public feed', () => {
 const result=createPublicBlogFeed([article, {...article, slug:'draft-post', editorialStatus:'draft'}]);
 assert.equal(result.articles.length,1);
 assert.equal('privateIssue' in result.articles[0],false);
 assert.equal('sections' in result.articles[0],false);
 assert.equal(result.articles[0].availabilityNote,'Disponibilidade pendente');
});
test('distributes a multi-product post to both product feeds', () => {
 const item={...article,products:['visto','agendo'],kind:'patch-notes'};
 assert.equal(createPublicBlogFeed([item],'agendo').articles.length,1);
 assert.equal(createPublicBlogFeed([item],'conexo').articles.length,0);
});
test('built filtered feeds exactly match their central public records', async () => {
 const central=JSON.parse(await readFile(new URL('../dist/blog/feed.json',import.meta.url),'utf8'));
 for(const product of ['visto','agendo','conexo','atolocal']) {
  const filtered=JSON.parse(await readFile(new URL(`../dist/blog/feeds/${product}.json`,import.meta.url),'utf8'));
  assert.deepEqual(filtered.articles,central.articles.filter(item=>item.products.includes(product)));
  assert.ok(filtered.articles.every(item=>item.url.startsWith('https://hawksbi.com.br/blog/')));
 }
});
