import assert from 'node:assert/strict';

export const hasType = (entity, type) => [entity?.['@type']].flat().includes(type);

// Check the HTML a crawler receives, rather than only the metadata generator.
export function validateSchema(html, path) {
  const scripts = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  assert.equal(scripts.length, 1, `Um grafo JSON-LD por página: ${path}`);
  const structured = JSON.parse(scripts[0][1]);
  assert.equal(structured['@context'], 'https://schema.org');
  const graph = structured['@graph'];
  const origin = 'https://hawksbi.com.br';
  const url = `${origin}${path}`;
  const ids = new Set(graph.map((entity) => entity['@id']));
  assert.equal(ids.size, graph.length, `IDs únicos: ${path}`);
  const page = graph.find((entity) => entity['@id'] === `${url}#webpage`);
  assert.ok(page && (hasType(page, 'WebPage') || hasType(page, 'CollectionPage')), `Página: ${path}`);
  assert.equal(page.url, url);
  function checkRefs(value) {
    if (!value || typeof value !== 'object') return;
    if (Object.keys(value).length === 1 && value['@id']) assert.ok(ids.has(value['@id']), `Referência não resolvida em ${path}: ${value['@id']}`);
    for (const child of Object.values(value)) checkRefs(child);
  }
  checkRefs(graph);

  const business = graph.find((entity) => hasType(entity, 'LocalBusiness'));
  assert.equal(business?.['@id'], `${origin}/#organization`);
  assert.equal(business.name, 'Hawks BI');
  assert.equal(business.url, `${origin}/`);
  assert.equal(business.email, 'comercial@hawksbi.com.br');
  assert.equal(business.telephone, '+5551995614866');
  assert.deepEqual(business.address, {
    '@type': 'PostalAddress', streetAddress: 'Rua Bernardo Joaquim Ferreira, 1780, Parque dos Anjos',
    addressLocality: 'Gravataí', addressRegion: 'RS', postalCode: '94190-000', addressCountry: 'BR',
  });
  assert.deepEqual(business.openingHoursSpecification, [{
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day) => `https://schema.org/${day}`),
    opens: '09:00:00', closes: '20:00:00',
  }]);
  assert.equal(business.contactPoint.telephone, business.telephone);
  assert.equal(business.contactPoint.email, business.email);
  assert.equal(business.areaServed.name, 'Gravataí');
  assert.equal(new URL(business.logo).origin, origin);
  if (path === '/') {
    for (const fact of ['Rua Bernardo Joaquim Ferreira, 1780', 'Parque dos Anjos', '94190-000', 'tel:+5551995614866', 'comercial@hawksbi.com.br', 'Segunda a sexta', '09h às 20h']) {
      assert.ok(html.includes(fact), `Dado local visível: ${fact}`);
    }
  }
  if (path !== '/') {
    const breadcrumbs = graph.find((entity) => hasType(entity, 'BreadcrumbList'));
    assert.ok(breadcrumbs && breadcrumbs.itemListElement.length >= 2, `Breadcrumb: ${path}`);
    breadcrumbs.itemListElement.forEach((item, index) => {
      assert.equal(item.position, index + 1);
      assert.ok(item.name && new URL(item.item).origin === origin);
    });
    assert.equal(breadcrumbs.itemListElement.at(-1).item, url);
  }

  const catalog = [
    { id: 'visto', name: 'Visto', status: 'Em operação' },
    { id: 'agendo', name: 'Agendo', status: 'Em operação' },
    { id: 'conexo', name: 'Conexo', status: 'Em validação' },
    { id: 'atolocal', name: 'Ato Local by Hawks BI', status: 'Em operação' },
  ];
  const product = catalog.find((item) => path === `/produtos/${item.id}/`);
  if (product) {
    const software = graph.filter((entity) => hasType(entity, 'WebApplication'));
    assert.equal(software.length, 1, `Um software por página de produto: ${path}`);
    const app = software[0];
    assert.equal(app['@id'], product.id === 'visto' ? 'https://visto.hawksbi.com.br/#software' : `${url}#software`);
    assert.equal(app.name, product.name);
    assert.equal(app.url, `https://${product.id}.hawksbi.com.br/`);
    assert.equal(app.applicationCategory, 'BusinessApplication');
    assert.equal(app.creativeWorkStatus, product.status);
    assert.equal(app.publisher['@id'], business['@id']);
    assert.equal(app.creator['@id'], business['@id']);
    assert.equal(app.mainEntityOfPage['@id'], page['@id']);
    assert.equal(page.mainEntity['@id'], app['@id']);
    assert.equal(page.about['@id'], app['@id']);
    for (const text of [app.name, app.description, app.applicationSubCategory, app.abstract, app.creativeWorkStatus]) assert.ok(html.includes(text), `Software corresponde ao conteúdo: ${path}`);
    assert.ok(html.includes(`href="${app.url}"`));
    assert.ok(app.featureList.length >= 1);
    for (const feature of app.featureList) {
      const divider = feature.indexOf(': ');
      assert.ok(html.includes(feature.slice(0, divider)) && html.includes(feature.slice(divider + 2)), `Recurso visível: ${path}`);
    }
    assert.ok(html.includes(`src="${new URL(app.image).pathname}"`), `Imagem do produto visível: ${path}`);
    // Change this guard only when real, visible commercial data becomes available.
    for (const unsupported of ['offers', 'aggregateRating', 'review', 'isAccessibleForFree']) assert.ok(!(unsupported in app), `Sem informação comercial inventada: ${unsupported}`);
  }
  if (path === '/produtos/') {
    assert.ok(hasType(page, 'CollectionPage'));
    const list = graph.find((entity) => hasType(entity, 'ItemList'));
    assert.equal(page.mainEntity['@id'], list?.['@id']);
    assert.equal(list.numberOfItems, catalog.length);
    assert.equal(list.itemListElement.length, catalog.length);
    for (const [index, product] of catalog.entries()) {
      const item = list.itemListElement[index];
      assert.equal(item.position, index + 1);
      assert.equal(item.item.name, product.name);
      assert.equal(item.item.url, `${origin}/produtos/${product.id}/`);
      assert.ok(html.includes(`href="/produtos/${product.id}/"`));
    }
  }
  return structured;
}
