import React from 'react';

const products = [
  { name: 'Aura Diamond Ring', price: '₹45,000', image: 'https://images.unsplash.com/photo-1605100804763-247f66156ce4?q=80&w=1000&auto=format&fit=crop' },
  { name: 'Lumina Pearl Necklace', price: '₹82,500', image: 'https://images.unsplash.com/photo-1599643478514-4a4874a0044b?q=80&w=1000&auto=format&fit=crop' },
  { name: 'Solstice Gold Pendant', price: '₹34,000', image: 'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?q=80&w=1000&auto=format&fit=crop' },
  { name: 'Eclipse Diamond Bracelet', price: '₹1,15,000', image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=1000&auto=format&fit=crop' },
  { name: 'Nova Sapphire Earrings', price: '₹68,000', image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=1000&auto=format&fit=crop' },
  { name: 'Celeste Eternity Band', price: '₹52,000', image: 'https://images.unsplash.com/photo-1604328698692-f76ea9498e76?q=80&w=1000&auto=format&fit=crop' },
  { name: 'Astral Drop Pendant', price: '₹41,500', image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=1000&auto=format&fit=crop' },
  { name: 'Lyra Chain Bracelet', price: '₹28,000', image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=1000&auto=format&fit=crop' },
  { name: 'Stella Emerald Ring', price: '₹95,000', image: 'https://images.unsplash.com/photo-1605100804763-247f66156ce4?q=80&w=1000&auto=format&fit=crop' },
  { name: 'Orion Stud Earrings', price: '₹22,000', image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=1000&auto=format&fit=crop' },
  { name: 'Vega Link Necklace', price: '₹1,45,000', image: 'https://images.unsplash.com/photo-1599643478514-4a4874a0044b?q=80&w=1000&auto=format&fit=crop' },
  { name: 'Sirius Solitaire', price: '₹2,10,000', image: 'https://images.unsplash.com/photo-1604328698692-f76ea9498e76?q=80&w=1000&auto=format&fit=crop' },
];

export function GridFirstDense() {
  return (
    <div className="w-full h-full min-h-[900px] max-w-[1280px] mx-auto bg-white flex flex-col font-['Poppins'] text-[#0F0F0F] relative shadow-2xl">
      
      {/* Top Bar - 40px Cream */}
      <header className="h-[40px] bg-[#FAF8F3] flex items-center justify-between px-6 shrink-0 border-b border-gray-100 relative z-10">
        <div className="font-['Playfair_Display'] font-bold text-lg tracking-[0.2em] uppercase">Pearlis</div>
        <nav className="flex items-center gap-6 text-[11px] uppercase tracking-wider font-medium">
          <a href="#" className="hover:text-[#D4AF37] transition-colors">Search</a>
          <a href="#" className="hover:text-[#D4AF37] transition-colors">Account</a>
          <a href="#" className="hover:text-[#D4AF37] transition-colors">Cart (0)</a>
        </nav>
      </header>

      {/* Category Pills */}
      <div className="flex items-center gap-3 px-6 py-3 shrink-0 overflow-x-auto border-b border-gray-50 relative z-10 bg-white" style={{ scrollbarWidth: 'none' }}>
        {['All', 'Rings', 'Necklaces', 'Pendants', 'Bracelets', 'Earrings'].map((cat, i) => (
          <button 
            key={cat} 
            className={`text-[10px] uppercase tracking-widest px-5 py-2 rounded-full border transition-all duration-300 whitespace-nowrap ${
              i === 0 
                ? 'bg-[#0F0F0F] text-white border-[#0F0F0F]' 
                : 'border-gray-200 text-gray-500 hover:border-[#0F0F0F] hover:text-[#0F0F0F]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Product Grid */}
      <main className="flex-1 overflow-y-auto px-6 py-6 pb-12 bg-white" style={{ scrollbarWidth: 'none' }}>
        <div className="grid grid-cols-4 gap-x-4 gap-y-10">
          {products.map((p, i) => (
             <div key={i} className="group cursor-pointer flex flex-col">
               <div className="aspect-square bg-[#FAF8F3] mb-3 overflow-hidden relative">
                 <img 
                   src={p.image} 
                   alt={p.name} 
                   className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out" 
                 />
                 <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
               </div>
               <div className="flex justify-between items-start gap-3 mt-auto">
                 <h3 className="text-xs font-medium leading-relaxed uppercase tracking-wide">{p.name}</h3>
                 <span className="text-xs text-gray-500 whitespace-nowrap">{p.price}</span>
               </div>
             </div>
          ))}
        </div>
      </main>

      {/* Footer Strip */}
      <footer className="h-[44px] bg-[#0F0F0F] text-[#D4AF37] flex items-center justify-center shrink-0 w-full mt-auto">
        <p className="font-['Playfair_Display'] italic text-[15px] tracking-wide">Elegance forged in timeless brilliance.</p>
      </footer>

      <style dangerouslySetInnerHTML={{__html: `
        /* Hide scrollbar for Chrome, Safari and Opera */
        main::-webkit-scrollbar, div::-webkit-scrollbar {
          display: none;
        }
      `}} />
    </div>
  );
}
