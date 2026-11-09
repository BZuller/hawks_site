import { products, productPath } from "../lib/editorial";
import { ContactArrow, useContact } from "./ContactDialog";

export function Products() {
  const openContact = useContact();
  return <section id="ferramentas" className="product-collection section-light" aria-labelledby="products-title">
    <div className="section-frame">
      <header className="product-collection__heading"><h2 id="products-title">Software criado<br /><em>para ser usado.</em></h2><p>Produtos Hawks para organizar rotinas, agendamentos e atendimento, e acompanhar o que acontece na cidade.</p></header>
      <div className="product-collection__grid">{products.map(product => <article key={product.id} className={`product-entry product-entry--${product.id}`}>
        <div className="product-entry__identity"><div className="product-entry__brand" role="img" aria-label={product.name}>{product.symbol && <img src={product.symbol} alt="" width="38" height="44" loading="lazy" />}<img src={product.logo} alt="" width={product.id === "agendo" ? 172 : 120} height="44" loading="lazy" /></div><span className={`product-entry__status ${product.status === "Em operação" ? "is-live" : ""}`}>{product.status}</span></div>
        <div className="product-entry__content"><h3>{product.cardTitle}</h3><p>{product.cardDescription}</p><ul aria-label={`Recursos do ${product.name}`}>{product.highlights.map(highlight => <li key={highlight}>{highlight}</li>)}</ul></div>
        <div className="product-entry__actions"><a href={product.href} className="product-entry__visit">{product.action}<ContactArrow /></a><a href={productPath(product.id)} className="product-entry__details">Ver como funciona</a></div>
      </article>)}</div>
      <div className="product-collection__custom"><p>Seu projeto pede algo próprio?<br /><strong>A Hawks também cria software sob medida.</strong></p><button type="button" onClick={() => openContact("Software sob medida")} aria-haspopup="dialog">Conte sua ideia<ContactArrow /></button></div>
    </div>
  </section>;
}
