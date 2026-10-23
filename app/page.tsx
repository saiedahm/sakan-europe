const categories = [
  { title: "Master Bedrooms", subtitle: "A refined retreat, made personal", image: "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1200&q=85" },
  { title: "Kids Bedrooms", subtitle: "Thoughtful spaces for growing dreams", image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=85" },
  { title: "Luxury Furniture", subtitle: "Timeless forms. Exceptional comfort.", image: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=85" },
  { title: "Bedding & Decor", subtitle: "The finishing touches of home", image: "https://images.unsplash.com/photo-1631679428922-2b5d1b3b1b10?auto=format&fit=crop&w=1200&q=85" },
];

export default function HomePage() {
  return (
    <main>
      <header className="topbar">
        <a className="brand" href="/" aria-label="SAKAN EUROPE home"><img src="/europe-logo.svg" alt="" /><span>SAKAN <b>EUROPE</b></span></a>
        <nav aria-label="Main navigation"><a href="#collections">Collections</a><a href="#about">Our philosophy</a></nav>
        <a className="header-link" href="#collections">Discover the collection ↗</a>
      </header>
      <section className="hero">
        <div className="hero-image" role="img" aria-label="Elegant luxury bedroom interior" />
        <div className="hero-shade" />
        <div className="hero-content">
          <p className="eyebrow">THE ART OF LIVING WELL</p>
          <h1>A home that<br/><em>feels like you.</em></h1>
          <p className="hero-copy">Considered furniture and timeless details for the spaces you call home.</p>
          <a className="gold-button" href="#collections">Explore our collections <span>↗</span></a>
          <p className="hero-note">CURATED FOR YOUR EUROPEAN HOME</p>
        </div>
        <div className="hero-index"><span>01</span> / 04</div>
      </section>
      <section className="collections" id="collections">
        <div className="section-heading"><div><p className="eyebrow">MADE FOR EVERY ROOM</p><h2>Discover your <em>sanctuary.</em></h2></div><p>Elevated essentials. Thoughtfully chosen.<br/>Designed to live beautifully.</p></div>
        <div className="category-grid">{categories.map((item, i) => <a className="category-card" href="#about" key={item.title}><div className="category-photo" style={{backgroundImage: `url("${item.image}")`}}/><div className="category-number">0{i+1}</div><div className="category-info"><div><h3>{item.title}</h3><p>{item.subtitle}</p></div><span className="circle-arrow">↗</span></div></a>)}</div>
      </section>
      <section className="philosophy" id="about"><p className="eyebrow">SAKAN EUROPE</p><h2>Luxury is not more.<br/><em>It is more meaningful.</em></h2><p>Pieces selected to bring calm, character, and comfort to everyday living.</p><a href="#collections">Find your style ↗</a></section>
      <footer><a className="brand footer-brand" href="/"><img src="/europe-logo.svg" alt=""/><span>SAKAN <b>EUROPE</b></span></a><span>Thoughtfully chosen. Beautifully lived.</span><span>© {new Date().getFullYear()} SAKAN EUROPE</span></footer>
    </main>
  );
}
