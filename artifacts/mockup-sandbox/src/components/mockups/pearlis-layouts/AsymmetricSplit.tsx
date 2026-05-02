import React from "react";

export function AsymmetricSplit() {
  const products = [
    {
      id: 1,
      name: "Eternity Diamond Ring",
      price: "₹85,000",
      image: "https://images.unsplash.com/photo-1605100804763-247f66126e28?auto=format&fit=crop&q=80&w=800",
    },
    {
      id: 2,
      name: "Sapphire Drop Earrings",
      price: "₹1,20,000",
      image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=800",
    },
    {
      id: 3,
      name: "Gold Heritage Necklace",
      price: "₹2,50,000",
      image: "https://images.unsplash.com/photo-1599643478524-fb66f70d00f6?auto=format&fit=crop&q=80&w=800",
    },
    {
      id: 4,
      name: "Rose Gold Bangle",
      price: "₹65,000",
      image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80&w=800",
    },
  ];

  const categories = ["Rings", "Necklaces", "Pendants", "Bracelets", "Earrings"];

  return (
    <div
      className="flex flex-col w-full h-[900px] overflow-hidden"
      style={{ backgroundColor: "#FAF8F3", color: "#0F0F0F" }}
    >
      {/* Navbar */}
      <nav
        className="flex justify-between items-center px-10 py-5 w-full shrink-0 z-10"
        style={{ backgroundColor: "#0F0F0F" }}
      >
        <div className="font-['Playfair_Display'] text-2xl tracking-wider" style={{ color: "#D4AF37" }}>
          PEARLIS
        </div>
        <div className="flex gap-8 font-['Poppins'] text-sm uppercase tracking-widest text-white/80">
          <a href="#" className="hover:text-[#D4AF37] transition-colors">Collections</a>
          <a href="#" className="hover:text-[#D4AF37] transition-colors">Bespoke</a>
          <a href="#" className="hover:text-[#D4AF37] transition-colors">Atelier</a>
          <a href="#" className="hover:text-[#D4AF37] transition-colors">Cart (0)</a>
        </div>
      </nav>

      <main className="flex flex-col flex-1 overflow-y-auto">
        {/* Hero Section */}
        <section className="flex w-full min-h-[500px] shrink-0">
          <div
            className="w-[60%] flex flex-col justify-center px-16 py-12"
            style={{ backgroundColor: "#0F0F0F" }}
          >
            <h1 className="font-['Playfair_Display'] text-6xl text-white leading-[1.1] mb-6">
              The Art of <br />
              <span className="italic" style={{ color: "#D4AF37" }}>Luminous</span> Craft
            </h1>
            <p className="font-['Poppins'] text-white/70 text-base max-w-md mb-10 leading-relaxed tracking-wide">
              Discover unparalleled elegance with our latest collection of fine jewelry, where traditional artistry meets contemporary design.
            </p>
            <div>
              <button
                className="font-['Poppins'] uppercase text-xs tracking-[0.2em] px-8 py-4 border transition-colors duration-300"
                style={{
                  borderColor: "#D4AF37",
                  color: "#D4AF37",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = "#D4AF37";
                  e.currentTarget.style.color = "#0F0F0F";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = "#D4AF37";
                }}
              >
                Explore Collection
              </button>
            </div>
          </div>
          <div className="w-[40%] relative">
            <img
              src="https://images.unsplash.com/photo-1596944924616-7b38e7cfac36?auto=format&fit=crop&q=80&w=1000"
              alt="Luxury Jewelry"
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>
        </section>

        {/* Content Section */}
        <section className="flex flex-1 w-full px-10 py-16 gap-12">
          {/* Categories Sidebar */}
          <aside className="w-48 shrink-0 flex flex-col gap-8 pt-4 border-r border-[#0F0F0F]/10">
            {categories.map((cat, idx) => (
              <a
                key={idx}
                href="#"
                className="font-['Poppins'] text-xs uppercase tracking-[0.15em] transition-colors"
                style={{ color: idx === 0 ? "#D4AF37" : "#0F0F0F" }}
              >
                {cat}
              </a>
            ))}
          </aside>

          {/* Product Grid */}
          <div className="flex-1 grid grid-cols-2 gap-8">
            {products.map((product) => (
              <div key={product.id} className="group cursor-pointer flex flex-col">
                <div className="relative aspect-[4/3] mb-4 overflow-hidden bg-white">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="object-cover w-full h-full mix-blend-multiply transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-[#0F0F0F]/0 group-hover:bg-[#0F0F0F]/5 transition-colors duration-300" />
                </div>
                <h3 className="font-['Playfair_Display'] text-lg mb-1">{product.name}</h3>
                <p className="font-['Poppins'] text-sm" style={{ color: "#D4AF37" }}>
                  {product.price}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer Strip */}
      <footer
        className="w-full shrink-0 h-2"
        style={{ backgroundColor: "#D4AF37" }}
      />
    </div>
  );
}

export default AsymmetricSplit;
