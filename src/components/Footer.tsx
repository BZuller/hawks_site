import { businessIdentity } from "../lib/businessIdentity";
import { BrandLogo } from "./BrandLogo";
export function Footer() {
  return <footer className="site-footer"><div className="section-frame footer-layout">
    <a className="footer-brand" href="/#top" aria-label="HAWKS BI — início"><BrandLogo light /></a>
    <nav className="footer-services" aria-label="Serviços, produtos e novidades"><a href="/servicos/software-sob-medida/">Software</a><a href="/servicos/automacao-de-processos/">Automações</a><a href="/produtos/visto/">Visto</a><a href="/produtos/agendo/">Agendo</a><a href="/produtos/conexo/">Conexo</a><a href="/blog/">Blog</a></nav>
    <span className="footer-base">Gravataí · RS · Brasil · © {new Date().getFullYear()}</span>
    <p className="footer-legal">{businessIdentity.legalName} · CNPJ {businessIdentity.taxId}</p>
  </div></footer>;
}
