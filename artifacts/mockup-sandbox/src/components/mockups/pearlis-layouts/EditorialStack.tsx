import React, { useEffect } from 'react';
import { ShoppingBag, Menu } from 'lucide-react';

export function EditorialStack() {
  // Preload fonts just in case
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Poppins:wght@300;400;500&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    return () => { document.head.removeChild(link); }
  }, []);

  const products = [
    {
      id: 1,
      name: "The Aurelia Pendant",
      price: "₹34,500",
      image: "https://images.unsplash.com/photo-1599643478524-fb66f70a00ea?ixlib=rb-4.0.3&auto=format&fit=crop&w=1280&q=80"
    },
    {
      id: 2,
      name: "Eclipse Diamond Ring",
      price: "₹85,000",
      image: "https://images.unsplash.com/photo-1605100804763-247f67b2548e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1280&q=80"
    },
    {
      id: 3,
      name: "Lumina Gold Bracelet",
      price: "₹42,000",
      image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1280&q=80"
    },
    {
      id: 4,
      name: "Celeste Pearl Earrings",
      price: "₹28,500",
      image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?ixlib=rb-4.0.3&auto=format&fit=crop&w=1280&q=80"
    }
  ];

  return (
    <div className="w-full bg-[#FAF8F3] text-[#0F0F0F] min-h-screen flex flex-col font-['Poppins']">
      {/* Top Nav */}
      <nav className="w-full flex items-center justify-between px-8 py-6 absolute top-0 z-50 text-[#FAF8F3]">
        <button className="p-2 -ml-2">
          <Menu className="w-6 h-6" />
        </button>
        <div className="text-2xl tracking-widest font-['Playfair_Display'] uppercase">Pearlis</div>
        <button className="p-2 -mr-2">
          <ShoppingBag className="w-6 h-6" />
        </button>
      </nav>

      {/* Hero Section */}
      <section className="relative w-full h-[900px] bg-[#0F0F0F] flex flex-col items-center justify-center text-[#FAF8F3] overflow-hidden">
        {/* Subtle background image or just solid color. Using solid color with minimal texture if possible, but keeping it simple */}
        <div className="absolute inset-0 opacity-40 bg-[url('https://images.unsplash.com/photo-1617038220319-276d3cfab638?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')] bg-cover bg-center mix-blend-overlay"></div>
        
        <div className="relative z-10 flex flex-col items-center max-w-4xl px-4 text-center mt-20">
          <h1 className="font-['Playfair_Display'] text-[5rem] md:text-[7rem] leading-none mb-8 font-normal tracking-tight">
            Ethereal<br /><span className="italic text-[#D4AF37]">Elegance</span>
          </h1>
          <p className="max-w-md text-sm tracking-[0.2em] uppercase opacity-80 mb-12">
            The New Fine Jewelry Collection
          </p>
          <button className="border-b border-[#D4AF37] text-[#D4AF37] pb-1 text-sm tracking-[0.15em] uppercase hover:opacity-70 transition-opacity">
            Discover the Collection
          </button>
        </div>
      </section>

      {/* Editorial Strip */}
      <section className="w-full flex flex-col items-center pb-32">
        <div className="w-full max-w-[1000px] flex flex-col gap-32 py-32 px-4 md:px-8">
          {products.map((product) => (
            <div key={product.id} className="w-full flex flex-col group cursor-pointer">
              <div className="w-full aspect-[4/5] md:aspect-[16/9] overflow-hidden bg-[#E8E6E1] mb-6">
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                />
              </div>
              <div className="flex flex-col md:flex-row md:items-baseline justify-between w-full px-2">
                <h3 className="font-['Playfair_Display'] text-2xl md:text-3xl mb-2 md:mb-0">
                  {product.name}
                </h3>
                <span className="font-['Poppins'] text-sm tracking-wider text-gray-500">
                  {product.price}
                </span>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-16 mb-16">
          <button className="px-12 py-4 border border-[#0F0F0F] text-xs tracking-[0.2em] uppercase hover:bg-[#0F0F0F] hover:text-[#FAF8F3] transition-colors">
            View All Jewelry
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full bg-[#0F0F0F] text-[#FAF8F3] py-24 px-8 md:px-16 flex flex-col items-center">
        <div className="text-3xl tracking-widest font-['Playfair_Display'] uppercase mb-12 text-[#D4AF37]">
          Pearlis
        </div>
        <div className="flex flex-col md:flex-row gap-8 md:gap-24 text-center md:text-left text-xs tracking-[0.1em] uppercase opacity-70 mb-16">
          <a href="#" className="hover:text-[#D4AF37] transition-colors">Boutiques</a>
          <a href="#" className="hover:text-[#D4AF37] transition-colors">Client Services</a>
          <a href="#" className="hover:text-[#D4AF37] transition-colors">The Maison</a>
          <a href="#" className="hover:text-[#D4AF37] transition-colors">Legal</a>
        </div>
        <div className="w-full max-w-4xl border-t border-white/10 pt-8 flex justify-center">
          <span className="text-[10px] tracking-widest opacity-50 uppercase">© {new Date().getFullYear()} Pearlis. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}

export default EditorialStack;
