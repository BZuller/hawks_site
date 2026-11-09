import { useEffect, useState } from "react";
import { articles, articlePath, formatDate, products, productPath, type Product, type Article } from "../lib/editorial";

function Arrow() { return <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M5 19 19 5M5 5h14v14" /></svg>; }
function Breadcrumb({ items }: { items: { label: string; href?: string }[] }) { return <nav className="breadcrumbs" aria-label="Caminho da página"><a href="/">Início</a>{items.map((item) => <span key={item.label}><span aria-hidden="true">/</span>{item.href ? <a href={item.href}>{item.label}</a> : <span aria-current="page">{item.label}</span>}</span>)}</nav>; }
function ProductBrand({ product }: { product: Product }) { return <div className={`detail-brand detail-brand--${product.id}`} role="img" aria-label={product.name}>{product.symbol && <img src={product.symbol} alt="" width="40" height="48" />}<img src={product.logo} alt="" width={product.id === "agendo" ? 200 : 148} height="54" /></div>; }
const productFlows = {
  visto: { nodes: ["Executar", "Registrar", "Revisar"], caption: "O registro liga uma etapa à próxima." },
  agendo: { nodes: ["Escolher", "Solicitar", "Aprovar"], caption: "No modo manual, você confirma o horário." },
  conexo: { nodes: ["Conversa", "Contexto", "Equipe"], caption: "Cada passagem preserva o contexto." },
  atolocal: { nodes: ["Abrir o menu", "Escolher o assunto", "Consultar o boletim"], caption: "Escolha o que quer acompanhar pelo WhatsApp." },
} satisfies Record<Product["id"], { nodes: string[]; caption: string }>;

function ProductDiagram({ product }: { product: Product }) {
  const { nodes, caption } = productFlows[product.id];
  return <div className={`product-diagram product-diagram--${product.id}`}>
    <ProductBrand product={product} />
    <div className="product-diagram__flow" aria-label={`Fluxo: ${nodes.join(", ")}`}>{nodes.map((node, index) => <div key={node}><span className="flow-node" aria-hidden="true">{index === 2 ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="m5 12 4 4L19 6" /></svg> : <span />}</span><strong>{node}</strong></div>)}</div>
    <p>{caption}</p>
  </div>;
}
export function ProductPage({ product }: { product: Product }) {
  const related = articles.filter((article) => article.editorialStatus !== "draft" && (article.products ?? [article.product]).includes(product.id));
  const audienceLink = product.id === "atolocal"
    ? { href: product.href, label: product.action }
    : { href: "/#contato", label: "Vamos olhar para a sua operação" };
  return <main id="top" className="editorial-page section-light">
    <div className="section-frame"><Breadcrumb items={[{ label: "Produtos", href: "/produtos/" }, { label: product.name }]} />
      <section className="product-detail-hero"><div><h1>{product.title}</h1><p className="page-lede">{product.description}</p><div className="page-actions"><a className="button button-dark" href={product.href}>{product.action}<span className="arrow-capsule"><Arrow /></span></a><a className="text-link" href="/#contato">Conversar com a Hawks<Arrow /></a></div><p className="detail-status"><span />{product.status}</p></div><ProductDiagram product={product} /></section>
      <section className="product-explanation" aria-labelledby="product-context"><h2 id="product-context">{product.category}</h2><p>{product.intro}</p></section>
      <section className="product-capabilities" aria-label={`Como funciona o ${product.name}`}>{product.features.map((feature) => <article key={feature.title}><h2>{feature.title}</h2><p>{feature.text}</p></article>)}</section>
      <section className="product-audience"><h2>Onde faz sentido.</h2><div><p>{product.audience}</p><p className="availability-note">{product.note}</p><a className="text-link" href={audienceLink.href}>{audienceLink.label}<Arrow /></a></div></section>
      {!!related.length && <section className="related-articles" aria-labelledby="related-title"><div className="editorial-section-heading"><h2 id="related-title">O {product.name} em evolução.</h2><a className="text-link" href="/blog/">Todo o blog<Arrow /></a></div><ArticleList items={related} /></section>}
    </div>
  </main>;
}
export function ProductsPage() { return <main id="top" className="editorial-page section-light"><div className="section-frame"><Breadcrumb items={[{ label: "Produtos" }]} /><header className="journal-heading"><h1>Software que<br /><em>entra na rotina.</em></h1><p>Conheça os produtos da Hawks BI para rotinas, agendamentos, atendimento e informação local.</p></header><div className="product-directory">{products.map((product) => <article key={product.id}><ProductBrand product={product} /><div><span className="directory-status">{product.status}</span><h2><a href={productPath(product.id)}>{product.title}</a></h2><p>{product.description}</p><div className="page-actions"><a className="text-link" href={productPath(product.id)}>Conhecer o {product.name}<Arrow /></a><a className="text-link" href={product.href}>{product.action}<Arrow /></a></div></div></article>)}</div></div></main>; }
export function ArticleList({ items, heading = "h3" }: { items: Article[]; heading?: "h2" | "h3" }) { const Heading = heading; return <div className="article-list">{items.map((article) => <article key={article.slug}><div className="article-list__meta"><span>{products.find((product) => product.id === article.product)!.name}</span><time dateTime={article.date}>{formatDate(article.date)}</time></div><a className="article-list__link" href={articlePath(article.slug)}><div><Heading>{article.title}</Heading><p>{article.summary}</p></div><Arrow /></a><span className="article-list__status">{article.status}</span></article>)}</div>; }
export function BlogPage() {
  const [filter, setFilter] = useState("todos");
  useEffect(() => {
    const product = new URLSearchParams(window.location.search).get("produto");
    if (products.some(item => item.id === product)) setFilter(product!);
  }, []);
  const visible = articles.filter((article) => article.editorialStatus !== "draft" && (filter === "todos" || (article.products ?? [article.product]).includes(filter as Product["id"])));
  const selectFilter = (value: string) => {
    setFilter(value);
    const url = new URL(window.location.href);
    if (value === "todos") url.searchParams.delete("produto"); else url.searchParams.set("produto", value);
    window.history.replaceState(null, "", url);
  };
  return <main id="top" className="editorial-page section-light"><div className="section-frame"><Breadcrumb items={[{ label: "Blog" }]} /><header className="journal-heading"><h1>Por dentro<br /><em>do que evolui.</em></h1><p>Novidades dos produtos Hawks. O que mudou, por que mudou e como cada avanço chega à rotina.</p></header><div className="journal-toolbar"><div className="journal-filters" role="group" aria-label="Filtrar por produto">{[["todos", "Todos"], ...products.map(product => [product.id, product.name])].map(([value, label]) => <button key={value} type="button" aria-pressed={filter === value} onClick={() => selectFilter(value)}>{label}</button>)}</div><span role="status">{visible.length} artigos</span></div>{visible.length ? <ArticleList items={visible} heading="h2" /> : <p className="availability-note">As próximas novidades deste produto vão aparecer aqui.</p>}</div></main>;
}
export function ArticlePage({ article }: { article: Article }) {
  const product = products.find((item) => item.id === article.product)!;
  const related = articles.filter((item) => item.product === article.product && item.slug !== article.slug);
  return <main id="top" className="editorial-page section-light"><div className="section-frame">
    <Breadcrumb items={[{ label: "Blog", href: "/blog/" }, { label: article.title }]} />
    <article className="journal-article">
      <header>
        <h1>{article.title}</h1>
        {(article.intro ?? [article.summary]).map(paragraph => <p className="page-lede" key={paragraph}>{paragraph}</p>)}
        <div className="article-byline"><span>Por <a href="/">Hawks BI</a></span><time dateTime={article.date}>{formatDate(article.date)}</time><a href={productPath(product.id)}>{product.name}<Arrow /></a></div>
      </header>
      <div className="article-reading">
        <aside className="article-release-note" aria-label="Disponibilidade da atualização"><strong>{article.status}</strong><p>{article.note}</p></aside>
        {article.sections.map(section => <section key={section.title}>
          <h2>{section.title}</h2>
          {section.paragraphs.map(paragraph => <p key={paragraph}>{paragraph}</p>)}
          {section.bullets && <ul>{section.bullets.map(item => <li key={item}>{item}</li>)}</ul>}
          {section.steps && <ol>{section.steps.map(item => <li key={item}>{item}</li>)}</ol>}
          {section.closingParagraphs?.map(paragraph => <p key={paragraph}>{paragraph}</p>)}
        </section>)}
        {article.faq && <section className="article-faq" aria-labelledby="article-faq-title">
          <h2 id="article-faq-title">Perguntas frequentes</h2>
          {article.faq.map(item => <div key={item.question}>
            <h3>{item.question}</h3>
            <p>{item.answer}{item.link && <> <a href={item.link.href}>{item.link.label}</a>.</>}</p>
          </div>)}
        </section>}
        <div className="article-next-step">
          <h2>{article.cta?.title ?? `Conheça o ${product.name}.`}</h2>
          <p>{article.cta?.text ?? `${product.category} para conectar o trabalho à rotina da sua operação.`}</p>
          <a className="button button-dark" href={article.cta?.href ?? productPath(product.id)}>{article.cta?.label ?? "Explorar o produto"}<span className="arrow-capsule"><Arrow /></span></a>
        </div>
      </div>
    </article>
    <section className="related-articles" aria-labelledby="read-next"><div className="editorial-section-heading"><h2 id="read-next">Continue a leitura.</h2><a className="text-link" href="/blog/">Todos os artigos<Arrow /></a></div><ArticleList items={related} /></section>
  </div></main>;
}
export function JournalPreview() {
  const latest = products.flatMap(product => articles.filter(article => (article.products ?? [article.product]).includes(product.id)).sort((a, b) => b.date.localeCompare(a.date)).slice(0, 1)).sort((a, b) => b.date.localeCompare(a.date)).slice(0, 2);
  return <section className="journal-preview section-light" aria-labelledby="journal-title"><div className="section-frame"><div className="editorial-section-heading"><h2 id="journal-title">Software em<br /><em>evolução.</em></h2><a className="text-link" href="/blog/">Acompanhe no blog<Arrow /></a></div><ArticleList items={latest} /></div></section>;
}
export function NotFoundPage() { return <main id="top" className="editorial-page section-light"><div className="section-frame not-found"><h1>Esse caminho<br /><em>não existe.</em></h1><p>A página pode ter mudado de endereço. Volte ao início ou explore nossos produtos.</p><div className="page-actions"><a className="button button-dark" href="/">Voltar ao início<Arrow /></a><a className="text-link" href="/produtos/">Conhecer os produtos<Arrow /></a></div></div></main>; }
