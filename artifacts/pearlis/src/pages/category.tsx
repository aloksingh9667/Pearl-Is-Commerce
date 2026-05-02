import { useRoute, Link } from "wouter";
import { useListProducts } from "@workspace/api-client-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ProductCard } from "@/components/ui/ProductCard";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const CATEGORY_META: Record<string, { title: string; sub: string; img: string }> = {
  rings: {
    title: "Rings",
    sub: "From engagement solitaires to everyday stackers — find your perfect ring.",
    img: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=85&w=2000&h=600",
  },
  necklaces: {
    title: "Necklaces",
    sub: "Delicate chains, layered sets, and statement pieces for every neckline.",
    img: "https://images.unsplash.com/photo-1599643478524-fb66f70d00f7?auto=format&fit=crop&q=85&w=2000&h=600",
  },
  pendants: {
    title: "Pendants",
    sub: "Meaningful charms and pendants crafted in gold and precious stones.",
    img: "https://images.unsplash.com/photo-1602173574767-37ac01994b2a?auto=format&fit=crop&q=85&w=2000&h=600",
  },
  bracelets: {
    title: "Bracelets",
    sub: "Wrap your wrist in elegance — bangles, tennis bracelets and more.",
    img: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=85&w=2000&h=600",
  },
  earrings: {
    title: "Earrings",
    sub: "Studs, hoops, drops and chandeliers — for every mood and occasion.",
    img: "https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&q=85&w=2000&h=600",
  },
  accessories: {
    title: "Accessories",
    sub: "Fine jewellery accessories — brooches, hairpins, and more.",
    img: "https://images.unsplash.com/photo-1576502200272-341a4b8d73a9?auto=format&fit=crop&q=85&w=2000&h=600",
  },
};

export default function Category() {
  const [, params] = useRoute("/category/:slug");
  const slug = params?.slug || "";
  const { data: productsData, isLoading } = useListProducts({ category: slug });
  const meta = CATEGORY_META[slug] || { title: slug.charAt(0).toUpperCase() + slug.slice(1), sub: "Handcrafted fine jewellery.", img: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=85&w=2000&h=600" };

  return (
    <div className="min-h-screen bg-[#FAF8F3] flex flex-col">
      <Navbar />

      {/* Hero banner */}
      <div className="relative w-full overflow-hidden" style={{ height: "260px" }}>
        <img src={meta.img} alt={meta.title} className="w-full h-full object-cover" style={{ objectPosition: "center 40%" }} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to right, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.25) 100%)" }} />
        <div className="absolute inset-0 flex flex-col justify-center px-6 md:px-16">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <div className="flex items-center gap-3 mb-3">
              <Link href="/" className="text-white/50 text-[9px] tracking-[0.2em] uppercase hover:text-white transition-colors">Home</Link>
              <span className="text-white/30 text-[9px]">/</span>
              <span className="text-white/70 text-[9px] tracking-[0.2em] uppercase">{meta.title}</span>
            </div>
            <h1 className="font-serif text-4xl md:text-5xl text-white mb-3">{meta.title}</h1>
            <div className="w-10 h-[2px] bg-[#D4AF37] mb-3" />
            <p className="text-white/60 text-sm max-w-md">{meta.sub}</p>
          </motion.div>
        </div>
      </div>

      {/* Products */}
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-12 md:py-16 w-full flex-1">
        {/* Result count */}
        {!isLoading && productsData?.products && (
          <div className="flex items-center justify-between mb-8">
            <p className="text-[10px] tracking-[0.2em] uppercase text-[#0F0F0F]/40">
              {productsData.products.length} piece{productsData.products.length !== 1 ? "s" : ""} in {meta.title}
            </p>
            <Link href="/shop" className="flex items-center gap-1.5 text-[10px] tracking-[0.2em] uppercase text-[#D4AF37] font-semibold hover:gap-2 transition-all">
              All Collections <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
            {[1, 2, 3, 4].map(i => <div key={i} className="aspect-[3/4] bg-[#E8E2D9]/50 animate-pulse" />)}
          </div>
        ) : productsData?.products?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <p className="font-serif text-2xl text-[#0F0F0F] mb-3">No pieces yet in {meta.title}</p>
            <p className="text-[#0F0F0F]/45 text-sm mb-8">Check back soon or explore other collections.</p>
            <Link href="/shop">
              <button className="border border-[#D4AF37] text-[#D4AF37] px-10 py-3.5 text-[10px] tracking-[0.25em] uppercase font-bold hover:bg-[#D4AF37] hover:text-white transition-colors duration-200">
                View All Collections
              </button>
            </Link>
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
