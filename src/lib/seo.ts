import { articles, articlePath, products, productPath } from './editorial';
import { businessIdentity } from './businessIdentity';
import { services, servicePath } from './services';

export const origin = 'https://hawksbi.com.br';
export const normalizePath = (path: string) => path === '/' ? '/' : `${path.replace(/\/+$/, '')}/`;
export const pagePaths = ['/', ...services.map((service) => servicePath(service.slug)), '/produtos/', ...products.map((product) => productPath(product.id)), '/blog/', ...articles.map((article) => articlePath(article.slug))];
const organizationId = `${origin}/#organization`;
const websiteId = `${origin}/#website`;
const area = { '@type': 'City', name: 'Gravataí', containedInPlace: { '@type': 'State', name: 'Rio Grande do Sul' } };
const organization = {
  '@type': ['Organization', 'LocalBusiness'], '@id': organizationId, name: 'Hawks BI', url: `${origin}/`,
  legalName: businessIdentity.legalName, taxID: businessIdentity.taxId,
  logo: `${origin}/assets/brand/orange-hawks-bi-transparent.png`,
  image: `${origin}/assets/brand/orange-hawks-bi-transparent.png`,
  email: 'comercial@hawksbi.com.br', telephone: '+5551995614866',
  description: 'Software sob medida e automação de processos. Base em Gravataí, RS, com atendimento presencial.',
  address: {
    '@type': 'PostalAddress', streetAddress: 'Rua Bernardo Joaquim Ferreira, 1780, Parque dos Anjos',
    addressLocality: 'Gravataí', addressRegion: 'RS', postalCode: '94190-000', addressCountry: 'BR',
  },
  openingHoursSpecification: [{
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day) => `https://schema.org/${day}`),
    opens: '09:00:00', closes: '20:00:00',
  }],
  areaServed: area,
  contactPoint: {
    '@type': 'ContactPoint', email: 'comercial@hawksbi.com.br', telephone: '+5551995614866',
    contactType: 'sales', availableLanguage: 'pt-BR',
  },
};
const website = { '@type': 'WebSite', '@id': websiteId, name: 'Hawks BI', url: `${origin}/`, inLanguage: 'pt-BR', publisher: { '@id': organizationId } };
const vistoSoftwareId = "https://visto.hawksbi.com.br/#software";
const serviceEntity = (service: (typeof services)[number]) => ({
  '@type': 'Service', '@id': `${origin}${servicePath(service.slug)}#service`,
  name: service.name, description: service.description, serviceType: service.name,
  url: `${origin}${servicePath(service.slug)}`, provider: { '@id': organizationId }, areaServed: area,
});
const softwareEntity = (product: (typeof products)[number]) => ({
  '@type': 'WebApplication', '@id': product.id === "visto" ? vistoSoftwareId : `${origin}${productPath(product.id)}#software`,
  name: product.name, description: product.description, url: product.href,
  image: `${origin}${product.logo}`, applicationCategory: 'BusinessApplication',
  applicationSubCategory: product.category, inLanguage: 'pt-BR',
  creativeWorkStatus: product.status, abstract: product.note,
  featureList: product.features.map((feature) => `${feature.title}: ${feature.text}`),
  creator: { '@id': organizationId }, publisher: { '@id': organizationId },
  mainEntityOfPage: { '@id': `${origin}${productPath(product.id)}#webpage` },
  // Semantic description only: Google app rich results also need a real price and review.
  // Neither is published, so don't imply a free offer or invent a rating.
});

export function getPageMeta(path: string) {
  const route = normalizePath(path);
  const product = products.find((item) => productPath(item.id) === route);
  const article = articles.find((item) => articlePath(item.slug) === route);
  const service = services.find((item) => servicePath(item.slug) === route);
  const exists = pagePaths.includes(route);
  const title = route === '/' ? 'Hawks BI | Software e automação em Gravataí' : service ? service.title : product ? `${product.name} | ${product.category} — Hawks BI` : article ? article.metaTitle ?? `${article.title} | Hawks BI` : route === '/produtos/' ? 'Produtos Hawks BI | Software e informação local' : route === '/blog/' ? 'Blog Hawks BI | Novidades do Visto e do Agendo' : 'Página não encontrada | Hawks BI';
  const description = route === '/' ? 'Software sob medida, automação de processos e integrações entre sistemas. A Hawks BI tem base em Gravataí, RS, com atendimento presencial para sua empresa.' : service ? service.description : product ? product.description : article ? article.metaDescription ?? article.summary : route === '/produtos/' ? 'Conheça o Visto, o Agendo, o Conexo e o Ato Local by Hawks BI. Encontre os sites dos produtos e veja como cada um funciona.' : route === '/blog/' ? 'Acompanhe a evolução dos produtos Hawks BI: novidades do Visto e do Agendo, melhorias na operação, agendamento e atendimento, com o status de cada atualização.' : 'Encontre os produtos, serviços e novidades da Hawks BI a partir da página inicial.';
  const url = `${origin}${route}`;
  const page: Record<string, unknown> = { '@type': 'WebPage', '@id': `${url}#webpage`, url, name: title, description, inLanguage: 'pt-BR', isPartOf: { '@id': websiteId }, about: { '@id': organizationId } };
  const graph: Record<string, unknown>[] = [organization, website, page];
  if (route === '/') {
    const entities = [...services.map(serviceEntity),
      { '@type': 'Service', '@id': `${origin}/#dados`, name: 'Inteligência de dados e Business Intelligence', description: 'Data warehouse, modelagem semântica e análise de dados para apoiar decisões na operação.', provider: { '@id': organizationId }, url: `${origin}/#servicos` },
      { '@type': 'Service', '@id': `${origin}/#inteligencia`, name: 'Modelos preditivos e inteligência artificial', description: 'Modelos preditivos treinados no contexto da operação: forecasting, recomendação e detecção de anomalias.', provider: { '@id': organizationId }, url: `${origin}/#servicos` },
    ];
    graph.push(...entities);
    page.mainEntity = entities.map((entity) => ({ '@id': entity['@id'] }));
  }
  if (exists && route !== '/') {
    const trail = [{ name: 'Início', item: `${origin}/` }];
    if (service) trail.push({ name: 'Serviços', item: `${origin}/#servicos` }, { name: service.name, item: url });
    else if (product) trail.push({ name: 'Produtos', item: `${origin}/produtos/` }, { name: product.name, item: url });
    else if (article) trail.push({ name: 'Blog', item: `${origin}/blog/` }, { name: article.title, item: url });
    else trail.push({ name: route === '/blog/' ? 'Blog' : 'Produtos', item: url });
    page.breadcrumb = { '@id': `${url}#breadcrumbs` };
    graph.push({ '@type': 'BreadcrumbList', '@id': `${url}#breadcrumbs`, itemListElement: trail.map((item, index) => ({ '@type': 'ListItem', position: index + 1, ...item })) });
  }
  if (service) {
    const entity = serviceEntity(service);
    graph.push(entity);
    page.mainEntity = { '@id': entity['@id'] };
  }
  if (product) {
    const entity = softwareEntity(product);
    graph.push(entity);
    page.mainEntity = { '@id': entity['@id'] };
    page.about = { '@id': entity['@id'] };
  }
  if (route === '/produtos/') {
    page['@type'] = 'CollectionPage';
    const listId = `${url}#products`;
    page.mainEntity = { '@id': listId };
    graph.push({
      '@type': 'ItemList', '@id': listId, name: 'Produtos Hawks BI', numberOfItems: products.length,
      itemListElement: products.map((item, index) => ({
        '@type': 'ListItem', position: index + 1,
        item: {
          '@type': 'WebPage', '@id': `${origin}${productPath(item.id)}#webpage`,
          name: item.name, url: `${origin}${productPath(item.id)}`,
        },
      })),
    });
  }
  if (article) {
    const articleId = `${url}#article`;
    page.mainEntity = { '@id': articleId };
    graph.push({
      '@type': 'BlogPosting',
      '@id': articleId,
      url,
      headline: article.title,
      description,
      ...(article.image ? {
        image: {
          '@type': 'ImageObject',
          url: `${origin}${article.image.src}`,
          width: article.image.width,
          height: article.image.height,
        },
      } : {}),
      datePublished: article.date,
      author: { '@type': 'Organization', '@id': organizationId, name: 'Hawks BI', url: `${origin}/` },
      publisher: { '@id': organizationId },
      mainEntityOfPage: { '@id': `${url}#webpage` },
      inLanguage: 'pt-BR',
      articleSection: products.find((item) => item.id === article.product)!.name,
      ...(article.product === 'visto' ? {
        about: { '@type': 'WebApplication', '@id': vistoSoftwareId, name: 'Visto', url: 'https://visto.hawksbi.com.br/' },
      } : {}),
    });
  }
  return { title, description, url, exists, type: article ? 'article' : 'website', graph: { '@context': 'https://schema.org', '@graph': graph } };
}
export function updateDocumentMeta(path: string) {
  const meta = getPageMeta(path);
  document.title = meta.title;
  const values: Record<string, string> = { description: meta.description, robots: meta.exists ? 'index, follow, max-image-preview:large' : 'noindex, follow', 'og:title': meta.title, 'og:description': meta.description, 'og:url': meta.url, 'og:type': meta.type, 'twitter:title': meta.title, 'twitter:description': meta.description };
  for (const [name, content] of Object.entries(values)) document.querySelector(`meta[name="${name}"], meta[property="${name}"]`)?.setAttribute('content', content);
  const canonical = document.querySelector('link[rel="canonical"]');
  if (meta.exists) canonical?.setAttribute('href', meta.url); else canonical?.remove();
  const schema = document.querySelector('script[type="application/ld+json"]');
  if (schema) schema.textContent = JSON.stringify(meta.graph);
}
