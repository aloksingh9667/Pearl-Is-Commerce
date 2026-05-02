import { useState } from "react";
import { useListProducts, useListCategories } from "@workspace/api-client-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ProductCard } from "@/components/ui/ProductCard";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { SlidersHorizontal } from "lucide-react";

export default function Shop() {
  const [category, setCategory] = useState<string>("");
  const [sort, setSort] = useState<string>("latest");
  const { data: categories } = useListCategories();
  const { data: productsData, isLoading } = useListProducts({ category: category || undefined, sort: sort as any, limit: 100 } as any);

  return (
    <div className="min-h-screen bg-[#FAF8F3] flex flex-col">
      <Navbar />

      {/* Hero banner */}
      <div className="relative w-full overflow-hidden" style={{ height: "240px" }}>
        <img
          src="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=85&w=2000&h=600"
          alt="The Collection"
          className="w-full h-full object-cover"
          style={{ objectPosition: "center 30%" }}
        />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to right, rgba(0,0,0,0.68) 0%, rgba(0,0,0,0.25) 100%)" }} />
        <div className="absolute inset-0 flex flex-col justify-center px-6 md:px-16">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <p className="text-[#D4AF37] text-[9px] tracking-[0.4em] uppercase font-bold mb-3">Fine Jewellery</p>
            <h1 className="font-serif text-4xl md:text-5xl text-white mb-3">The Collection</h1>
            <div className="w-10 h-[2px] bg-[#D4AF37] mb-3" />
            <p className="text-white/55 text-sm">Handcrafted pieces for every moment and occasion.</p>
          </motion.div>
        </div>
      </div>

      {/* Filter bar */}
      <div className="bg-white border-b border-[#D4AF37]/12 sticky top-[100px] z-30">
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-3 flex flex-wrap items-center justify-between gap-3">
          {/* Category filters */}
          <div className="flex items-center gap-2 flex-wrap">
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#0F0F0F]/40 hidden sm:block" strokeWidth={1.5} />
            <button
              onClick={() => setCategory("")}
              className={`px-3 py-1.5 text-[9px] tracking-[0.2em] uppercase font-bold transition-all duration-200 ${
                category === "" ? "bg-[#0F0F0F] text-white" : "text-[#0F0F0F]/50 hover:text-[#0F0F0F] border border-[#0F0F0F]/15 hover:border-[#0F0F0F]/40"
              }`}
            >
              All
            </button>
            {categories?.categories?.map(c => (
              <button
                key={c.id}
                onClick={() => setCategory(c.name)}
                className={`px-3 py-1.5 text-[9px] tracking-[0.2em] uppercase font-bold transition-all duration-200 ${
                  category === c.name ? "bg-[#0F0F0F] text-white" : "text-[#0F0F0F]/50 hover:text-[#0F0F0F] border border-[#0F0F0F]/15 hover:border-[#0F0F0F]/40"
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>

          {/* Sort + count */}
          <div className="flex items-center gap-4">
            {!isLoading && productsData?.products && (
              <span className="text-[9px] tracking-[0.18em] uppercase text-[#0F0F0F]/35 hidden md:block">
                {productsData.products.length} pieces
              </span>
            )}
            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger className="w-[160px] h-8 rounded-none border-[#0F0F0F]/15 text-[10px] tracking-wide">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent className="rounded-none">
                <SelectItem value="latest">Latest Arrivals</SelectItem>
                <SelectItem value="price_asc">Price: Low to High</SelectItem>
                <SelectItem value="price_desc">Price: High to Low</SelectItem>
                <SelectItem value="trending">Trending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Products grid */}
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-10 md:py-14 flex-1">
        {isLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <div key={i} className="aspect-[3/4] bg-[#E8E2D9]/40 animate-pulse" />)}
          </div>
        ) : productsData?.products?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <p className="font-serif text-2xl text-[#0F0F0F] mb-3">No pieces in this filter</p>
            <p className="text-[#0F0F0F]/45 text-sm mb-6">Try a different category or sort option.</p>
            <button onClick={() => setCategory("")} className="border border-[#D4AF37] text-[#D4AF37] px-8 py-3 text-[10px] tracking-[0.25em] uppercase font-bold hover:bg-[#D4AF37] hover:text-white transition-colors">
              Clear Filter
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-3 md:gap-x-6 gap-y-8 md:gap-y-14">
            {productsData?.products?.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index % 4} />
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
