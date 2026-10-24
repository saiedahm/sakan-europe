"use client";

import { useEffect, useMemo, useState } from "react";

type Product = {
  id: string; name: string; description: string; imageUrl: string;
  images: string[]; supplierPrice: number | string; retailPrice: number | string;
  currency: string; category: string; subcategory: string; tags: string[]; supplierCategory: string; stock: number | null;
};
const CATEGORIES = [
  { id: "all", label: "All Collections" },
  { id: "master-bedrooms", label: "Master Bedrooms" },
  { id: "kids-bedrooms", label: "Kids Bedrooms" },
  { id: "luxury-furniture", label: "Luxury Furniture" },
  { id: "bedding-decor", label: "Bedding & Decor" },
];
const money = (value: number | string, currency: string) =>
  new Intl.NumberFormat("en-GB", { style: "currency", currency: /^[A-Z]{3}$/.test(currency) ? currency : "USD" }).format(Number(value));

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState("all");
  const [subcategory, setSubcategory] = useState("all");
  const [tag, setTag] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    fetch("/api/products", { cache: "no-store" })
      .then(async (r) => {
        const body = await r.json();
        if (!r.ok || !body.success) throw new Error(body.message || "Catalog is temporarily unavailable.");
        return body.data as Product[];
      })
      .then((data) => { if (active) setProducts(data); })
      .catch((e: unknown) => { if (active) setError(e instanceof Error ? e.message : "Catalog is temporarily unavailable."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);
  const subcategories = useMemo(() => [...new Set(products.filter(p => category === "all" || p.category === category).map(p => p.subcategory).filter(Boolean))].sort(), [products, category]);
  const tags = useMemo(() => [...new Set(products.filter(p => (category === "all" || p.category === category) && (subcategory === "all" || p.subcategory === subcategory)).flatMap(p => p.tags || []))].sort(), [products, category, subcategory]);
  const visible = useMemo(() => products.filter(p =>
    (category === "all" || p.category === category) &&
    (subcategory === "all" || p.subcategory === subcategory) &&
    (tag === "all" || (p.tags || []).includes(tag))
  ), [products, category, subcategory, tag]);
  function chooseCategory(id: string) { setCategory(id); setSubcategory("all"); setTag("all"); }
  return (
    <main>
      <header className="topbar">
        <a className="brand" href="/" aria-label="SAKAN EUROPE home"><span className="brand-mark">S</span><span>SAKAN <b>EUROPE</b></span></a>
        <nav><a href="#collections">COLLECTIONS</a><a href="#catalog">SHOP</a><a href="#about">OUR PHILOSOPHY</a></nav>
        <a className="header-link" href="#catalog">DISCOVER THE COLLECTION ↗</a>
      </header>
      <section className="hero">
        <div className="hero-image" />
        <div className="hero-shade" />
        <div className="hero-content">
          <p className="eyebrow">A MORE CONSIDERED HOME</p>
          <h1>Where comfort<br />becomes <em>art.</em></h1>
          <p className="hero-copy">Thoughtfully chosen furniture, beautiful bedrooms and refined details for the way you want to live.</p>
          <a className="gold-button" href="#catalog">EXPLORE THE COLLECTION <span>↗</span></a>
          <p className="hero-note">TIMELESS DESIGN · EVERYDAY LUXURY</p>
        </div>
        <div className="hero-index"><span>01</span> / SAKAN EUROPE</div>
      </section>
      <section className="collections" id="collections">
        <div className="section-heading"><div><p className="eyebrow">THE SAKAN EDIT</p><h2>Designed for <em>living.</em></h2></div><p>Four considered worlds.<br />One feeling of home.</p></div>
        <div className="category-grid">
          {[
            ["01","Master Bedrooms","Restful spaces, beautifully considered.","https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1000&q=85","master-bedrooms"],
            ["02","Kids Bedrooms","Little worlds made for growing.","https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1000&q=85","kids-bedrooms"],
            ["03","Luxury Furniture","Statement pieces for everyday life.","https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1000&q=85","luxury-furniture"],
            ["04","Bedding & Decor","The finishing touches that feel like you.","https://images.unsplash.com/photo-1631679706909-1844bbd07221?auto=format&fit=crop&w=1000&q=85","bedding-decor"],
          ].map(([n,title,desc,img,id]) => <a className="category-card" href="#catalog" key={id} onClick={() => chooseCategory(id)}><div className="category-photo" style={{backgroundImage:`url("${img}")`}}/><span className="category-number">{n}</span><div className="category-info"><div><h3>{title}</h3><p>{desc}</p></div><span className="circle-arrow">↗</span></div></a>)}
        </div>
      </section>
      <section className="philosophy" id="about"><p className="eyebrow">LESS, BUT BETTER</p><h2>A home should feel<br /><em>like your own story.</em></h2><p>Pieces chosen for comfort, character and the quiet luxury of everyday living.</p><a href="#catalog">FIND YOUR PIECE ↗</a></section>
      <section className="catalog-section" id="catalog">
        <div className="section-heading"><div><p className="eyebrow">THE ONLINE COLLECTION</p><h2>Shop the <em>edit.</em></h2></div><p>{products.length} curated products<br />Home, furniture & decor</p></div>
        <div className="catalog-filters" role="group" aria-label="Filter products by category">
          {CATEGORIES.map(c => <button key={c.id} className={category === c.id ? "filter active" : "filter"} onClick={() => chooseCategory(c.id)}>{c.label}</button>)}
        </div>
        {!loading && !error && subcategories.length > 0 && <div className="catalog-filters subcategory-filters" role="group" aria-label="Filter products by subcategory">
          <button className={subcategory === "all" ? "filter active" : "filter"} onClick={() => {setSubcategory("all");setTag("all");}}>All Subcategories</button>
          {subcategories.map(value => <button key={value} className={subcategory === value ? "filter active" : "filter"} onClick={() => {setSubcategory(value);setTag("all");}}>{value}</button>)}
        </div>}
        {!loading && !error && tags.length > 0 && <div className="catalog-filters tag-filters" role="group" aria-label="Filter products by tags">
          <button className={tag === "all" ? "filter active" : "filter"} onClick={() => setTag("all")}>All Tags</button>
          {tags.map(value => <button key={value} className={tag === value ? "filter active" : "filter"} onClick={() => setTag(value)}>{value}</button>)}
        </div>}
        {loading ? <p className="catalog-state">Preparing your collection…</p> : error ? <p className="catalog-state">{error} Product import requires the supplier API and database settings to be configured.</p> : visible.length === 0 ? <p className="catalog-state">No imported products in this collection yet. Once the CJ Dropshipping sync is configured and run, matching products will appear here automatically.</p> :
          <div className="product-grid">{visible.map(p => <article className="product-card" key={p.id}><div className="product-image">{p.imageUrl ? <img src={p.imageUrl} alt={p.name} loading="lazy" /> : <div className="product-no-image">SAKAN<br />EUROPE</div>}</div><div className="product-info"><p className="product-category">{CATEGORIES.find(c => c.id === p.category)?.label || p.category} · {p.subcategory}</p><h3>{p.name}</h3><p className="product-price">{money(p.retailPrice, p.currency)}</p><p className="product-description">{p.description}</p><div className="product-tags">{(p.tags || []).map(value => <span className="product-tag" key={value}>{value}</span>)}</div></div></article>)}</div>}
      </section>
      <footer><a className="brand footer-brand" href="/"><span className="brand-mark">S</span><span>SAKAN <b>EUROPE</b></span></a><span>© 2026 SAKAN EUROPE · THE ART OF LIVING WELL</span><span>Thoughtfully chosen for your home.</span></footer>
    </main>
  );
}
