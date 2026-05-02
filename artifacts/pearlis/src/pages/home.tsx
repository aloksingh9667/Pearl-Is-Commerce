import { useGetFeaturedProducts, useGetTrendingProducts, useGetNewArrivals } from "@workspace/api-client-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ProductCard } from "@/components/ui/ProductCard";
import { CategoryCard } from "@/components/ui/CategoryCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight, Star, Shield, Truck, RefreshCcw } from "lucide-react";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7 },
};

const stagger = (i: number) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay: i * 0.1 },
});

export default function Home() {
  const { data: featuredProducts } = useGetFeaturedProducts();
  const { data: trendingProducts } = useGetTrendingProducts();
  const { data: newArrivals } = useGetNewArrivals();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      {/* ── HERO ── */}
      <section className="relative h-[92vh] min-h-[600px] w-full overflow-hidden bg-[#0F0F0F]">
        <img
          src="https://images.unsplash.com/photo-1601121141499-1b5e96b5c2ea?auto=format&fit=crop&q=90&w=1800"
          alt="Luxury Jewelry"
          className="absolute inset-0 w-full h-full object-cover opacity-55"
        />
        {/* gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60" />

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 z-10">
          <motion.p
            {...fadeUp}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="section-eyebrow text-[#D4AF37] mb-5"
          >
            New Season — 2025 Collection
          </motion.p>
          <motion.h1
            {...fadeUp}
            transition={{ duration: 0.8, delay: 0.25 }}
            className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-8xl text-white mb-6 max-w-5xl leading-[1.08] tracking-tight"
          >
            Timeless Elegance,
            <br />
            <span className="italic text-[#D4AF37]">Set in Gold</span>
          </motion.h1>
          <motion.p
            {...fadeUp}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="text-white/65 text-base md:text-lg max-w-xl mb-10 leading-relaxed font-light"
          >
            Discover handcrafted fine jewellery that tells your story — rings, necklaces, pendants, and more.
          </motion.p>
          <motion.div
            {...fadeUp}
            transition={{ duration: 0.7, delay: 0.55 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Link href="/shop">
              <button className="group flex items-center gap-3 bg-[#D4AF37] hover:bg-[#c9a430] text-white px-10 py-4 text-[11px] tracking-[0.25em] uppercase font-semibold transition-all duration-300">
                Explore Collection
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
            <Link href="/about">
              <button className="flex items-center gap-3 border border-white/40 hover:border-white text-white px-10 py-4 text-[11px] tracking-[0.25em] uppercase font-medium transition-all duration-300 backdrop-blur-sm">
                Our Story
              </button>
            </Link>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2">
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.8 }}
            className="w-[1px] h-12 bg-gradient-to-b from-white/60 to-transparent"
          />
        </div>
      </section>

      {/* ── TRUST BADGES ── */}
      <section className="border-y border-[#D4AF37]/20 bg-white py-5">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 divide-x divide-[#D4AF37]/15">
            {[
              { icon: Truck, label: "Free Delivery", sub: "On orders above ₹5,000" },
              { icon: Shield, label: "Certified Jewellery", sub: "100% authentic & hallmarked" },
              { icon: Star, label: "Premium Quality", sub: "Handcrafted by artisans" },
              { icon: RefreshCcw, label: "Easy Returns", sub: "30-day hassle-free returns" },
            ].map(({ icon: Icon, label, sub }, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-1">
                <Icon className="w-5 h-5 text-[#D4AF37] flex-shrink-0" strokeWidth={1.5} />
                <div>
                  <p className="text-[11px] font-semibold tracking-wide text-[#0F0F0F] uppercase">{label}</p>
                  <p className="text-[10px] text-[#0F0F0F]/50 mt-0.5">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED PRODUCTS ── */}
      <section className="py-24 md:py-32">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="flex flex-col items-center text-center mb-16">
            <p className="section-eyebrow mb-4">Curated For You</p>
            <h2 className="font-serif text-4xl md:text-5xl text-[#0F0F0F] mb-5">Featured Pieces</h2>
            <div className="gold-divider" />
            <p className="text-muted-foreground max-w-xl mt-6 leading-relaxed text-sm">
              Each piece in our collection is carefully selected for its exceptional craftsmanship and timeless appeal.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-14">
            {featuredProducts?.slice(0, 8).map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>

          <div className="mt-14 text-center">
            <Link href="/shop">
              <button className="group inline-flex items-center gap-3 border border-[#0F0F0F] hover:border-[#D4AF37] hover:text-[#D4AF37] text-[#0F0F0F] px-10 py-3.5 text-[11px] tracking-[0.25em] uppercase font-medium transition-all duration-300">
                View All Jewellery
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ── */}
      <section className="py-16 bg-[#FAF6EE]">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="flex flex-col items-center text-center mb-12">
            <p className="section-eyebrow mb-4">Shop By Category</p>
            <h2 className="font-serif text-4xl text-[#0F0F0F]">Explore Collections</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { title: "Rings", slug: "rings", image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=400" },
              { title: "Necklaces", slug: "necklaces", image: "https://images.unsplash.com/photo-1599643478524-fb66f70d00f7?auto=format&fit=crop&q=80&w=400" },
              { title: "Bracelets", slug: "bracelets", image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80&w=400" },
              { title: "Earrings", slug: "earrings", image: "https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&q=80&w=400" },
              { title: "Pendants", slug: "pendants", image: "https://images.unsplash.com/photo-1602173574767-37ac01994b2a?auto=format&fit=crop&q=80&w=400" },
              { title: "Accessories", slug: "accessories", image: "https://images.unsplash.com/photo-1576502200272-341a4b8d73a9?auto=format&fit=crop&q=80&w=400" },
            ].map(({ title, slug, image }, i) => (
              <motion.div key={slug} {...stagger(i)}>
                <Link href={`/category/${slug}`}>
                  <div className="group relative aspect-square overflow-hidden cursor-pointer">
                    <img
                      src={image}
                      alt={title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4 text-center">
                      <p className="text-white font-serif text-lg">{title}</p>
                      <p className="text-[#D4AF37] text-[9px] tracking-[0.2em] uppercase mt-1 opacity-0 group-hover:opacity-100 transition-opacity">Explore →</p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TRENDING / NEW ARRIVALS ── */}
      {trendingProducts && trendingProducts.length > 0 && (
        <section className="py-24 md:py-32">
          <div className="max-w-[1400px] mx-auto px-6">
            <div className="flex flex-col items-center text-center mb-16">
              <p className="section-eyebrow mb-4">What's Hot</p>
              <h2 className="font-serif text-4xl md:text-5xl text-[#0F0F0F] mb-5">Trending Now</h2>
              <div className="gold-divider" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-14">
              {trendingProducts?.slice(0, 4).map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── EDITORIAL / BRAND STORY ── */}
      <section className="bg-[#0F0F0F] py-24 md:py-32">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 items-stretch">
            <div className="relative aspect-[4/5] lg:aspect-auto overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1573408301185-9519f94815b5?auto=format&fit=crop&q=85&w=900"
                alt="Artisan crafting jewelry"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/20" />
            </div>
            <div className="flex flex-col justify-center bg-[#141414] px-10 md:px-16 py-16 md:py-20">
              <p className="section-eyebrow mb-6">The Pearlis Atelier</p>
              <h2 className="font-serif text-4xl md:text-5xl text-white mb-6 leading-tight">
                Where Craft Meets <span className="italic text-[#D4AF37]">Passion</span>
              </h2>
              <div className="w-12 h-[1px] bg-[#D4AF37] mb-8" />
              <p className="text-white/60 leading-loose mb-5 text-sm">
                Every Pearlis creation begins with a singular vision. Our master artisans blend centuries-old techniques with contemporary design sensibility to create pieces that transcend time.
              </p>
              <p className="text-white/60 leading-loose mb-10 text-sm">
                We source only the finest ethically-mined diamonds and precious metals from certified suppliers, ensuring each piece tells a story of uncompromising quality and responsible luxury.
              </p>
              <Link href="/about">
                <button className="group inline-flex items-center gap-3 text-[#D4AF37] text-[11px] tracking-[0.25em] uppercase font-medium border-b border-[#D4AF37]/40 pb-1 hover:border-[#D4AF37] transition-colors w-fit">
                  Discover Our Story
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── NEW ARRIVALS ── */}
      {newArrivals && newArrivals.length > 0 && (
        <section className="py-24 md:py-32 bg-white">
          <div className="max-w-[1400px] mx-auto px-6">
            <div className="flex flex-col items-center text-center mb-16">
              <p className="section-eyebrow mb-4">Just Arrived</p>
              <h2 className="font-serif text-4xl md:text-5xl text-[#0F0F0F] mb-5">New Arrivals</h2>
              <div className="gold-divider" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-14">
              {newArrivals?.slice(0, 4).map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))}
            </div>
            <div className="mt-14 text-center">
              <Link href="/shop">
                <button className="group inline-flex items-center gap-3 bg-[#0F0F0F] hover:bg-[#D4AF37] text-white px-10 py-4 text-[11px] tracking-[0.25em] uppercase font-semibold transition-all duration-300">
                  Shop All New Arrivals
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── TESTIMONIALS ── */}
      <section className="py-20 bg-[#FAF6EE]">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="flex flex-col items-center text-center mb-14">
            <p className="section-eyebrow mb-4">Customer Stories</p>
            <h2 className="font-serif text-4xl text-[#0F0F0F]">What Our Clients Say</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: "Priya S.", text: "I bought a diamond pendant for my mother's birthday — absolutely stunning. The packaging alone felt like a luxury experience.", rating: 5 },
              { name: "Arjun M.", text: "The quality is unmatched. I've purchased rings from multiple jewellers but Pearlis is on a completely different level.", rating: 5 },
              { name: "Kavitha R.", text: "Fast delivery, beautiful jewellery, and amazing customer support. Highly recommend for gifting.", rating: 5 },
            ].map(({ name, text, rating }, i) => (
              <motion.div key={i} {...stagger(i)} className="bg-white p-8 border border-[#D4AF37]/15">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: rating }).map((_, j) => (
                    <Star key={j} className="w-3.5 h-3.5 fill-[#D4AF37] text-[#D4AF37]" />
                  ))}
                </div>
                <p className="text-[#0F0F0F]/70 text-sm leading-relaxed mb-6 italic">"{text}"</p>
                <p className="text-[10px] tracking-[0.2em] uppercase font-semibold text-[#0F0F0F]">{name}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── NEWSLETTER ── */}
      <section className="py-24 bg-[#0F0F0F] relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-[#D4AF37]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full border border-[#D4AF37]" />
        </div>
        <div className="max-w-2xl mx-auto px-6 text-center relative z-10">
          <p className="section-eyebrow mb-5">Stay Connected</p>
          <h2 className="font-serif text-4xl md:text-5xl text-white mb-4">
            Join the <span className="italic text-[#D4AF37]">Pearlis</span> Circle
          </h2>
          <p className="text-white/50 mb-10 text-sm leading-relaxed">
            Subscribe for exclusive access to new collections, private events, jewellery care guides, and members-only offers.
          </p>
          <form className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              placeholder="Your email address"
              className="flex-1 bg-white/5 border border-white/15 text-white placeholder:text-white/35 px-5 py-4 text-sm outline-none focus:border-[#D4AF37] transition-colors"
            />
            <button
              type="button"
              className="bg-[#D4AF37] hover:bg-[#c9a430] text-white px-8 py-4 text-[11px] tracking-[0.25em] uppercase font-semibold transition-colors whitespace-nowrap"
            >
              Subscribe
            </button>
          </form>
          <p className="text-white/25 text-[10px] mt-4 tracking-wide">
            We respect your privacy. Unsubscribe at any time.
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
