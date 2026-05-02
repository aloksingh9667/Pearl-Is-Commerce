import {
  useGetFeaturedProducts,
  useGetTrendingProducts,
  useGetNewArrivals,
  useListBlogs,
} from "@workspace/api-client-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ProductCard } from "@/components/ui/ProductCard";
import { Link } from "wouter";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import {
  ArrowRight,
  Star,
  Shield,
  Truck,
  RefreshCcw,
  Award,
  Gem,
  Clock,
  Instagram,
  Play,
  X,
} from "lucide-react";

/* ─────────────────── helpers ─────────────────── */
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 36 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.75, delay, ease: [0.25, 0.46, 0.45, 0.94] },
});

const fadeIn = (delay = 0) => ({
  initial: { opacity: 0 },
  whileInView: { opacity: 1 },
  viewport: { once: true },
  transition: { duration: 0.8, delay },
});

/* ─────────────────── Countdown ─────────────────── */
function useCountdown(targetDate: Date) {
  const calc = () => {
    const diff = Math.max(0, targetDate.getTime() - Date.now());
    return {
      h: Math.floor(diff / 3600000),
      m: Math.floor((diff % 3600000) / 60000),
      s: Math.floor((diff % 60000) / 1000),
    };
  };
  const [time, setTime] = useState(calc);
  useEffect(() => {
    const id = setInterval(() => setTime(calc()), 1000);
    return () => clearInterval(id);
  }, []);
  return time;
}

/* ─────────────────── Component ─────────────────── */
export default function Home() {
  const { data: featured } = useGetFeaturedProducts();
  const { data: trending } = useGetTrendingProducts();
  const { data: arrivals } = useGetNewArrivals();
  const { data: blogsData } = useListBlogs();

  const heroRef = useRef<HTMLElement>(null);
  const { scrollY } = useScroll();
  const heroImgY = useTransform(scrollY, [0, 600], [0, 120]);

  const saleEnd = new Date(Date.now() + 23 * 3600000 + 47 * 60000 + 33000);
  const { h, m, s } = useCountdown(saleEnd);

  const [isVideoOpen, setIsVideoOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#FAF8F3] flex flex-col overflow-x-hidden">
      <Navbar />

      {/* ════════════════════════════════════════
          1. HERO — fullscreen parallax
      ════════════════════════════════════════ */}
      <section
        ref={heroRef}
        className="relative w-full overflow-hidden"
        style={{ height: "100dvh", minHeight: "680px" }}
      >
        <motion.div className="absolute inset-0" style={{ y: heroImgY }}>
          <img
            src="https://images.unsplash.com/photo-1601121141499-1b5e96b5c2ea?auto=format&fit=crop&q=90&w=2000"
            alt="Luxury Jewelry"
            className="w-full h-[110%] object-cover object-center"
          />
        </motion.div>
        {/* Multi-layer gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/25 to-black/65" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-transparent" />

        {/* Hero content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-5 z-10">
          <motion.p
            initial={{ opacity: 0, letterSpacing: "0.5em" }}
            animate={{ opacity: 1, letterSpacing: "0.3em" }}
            transition={{ duration: 1.1, delay: 0.2 }}
            className="text-[#D4AF37] text-[10px] font-semibold tracking-[0.3em] uppercase mb-6"
          >
            New Season — 2025 Collection
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-[88px] text-white leading-[1.06] tracking-[-0.01em] mb-5 max-w-5xl"
          >
            Crafted Elegance
            <br />
            <em className="text-[#D4AF37] not-italic">For Every Moment</em>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.65 }}
            className="text-white/60 text-sm md:text-base max-w-lg leading-relaxed mb-10 font-light"
          >
            Discover handcrafted fine jewellery — rings, necklaces, pendants, bracelets and more, made for those who wear meaning.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.82 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Link href="/shop">
              <button className="group flex items-center gap-3 bg-[#D4AF37] hover:bg-[#c9a430] text-white px-10 py-4 text-[10.5px] tracking-[0.28em] uppercase font-bold transition-all duration-300 shadow-lg hover:shadow-[#D4AF37]/30 hover:shadow-xl">
                Shop Now
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
            <Link href="/category/necklaces">
              <button className="flex items-center gap-3 border border-white/50 hover:border-white text-white hover:bg-white/10 px-10 py-4 text-[10.5px] tracking-[0.28em] uppercase font-semibold transition-all duration-300 backdrop-blur-sm">
                Explore Collections
              </button>
            </Link>
          </motion.div>
        </div>

        {/* Scroll pulse */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2">
          <motion.div
            animate={{ scaleY: [1, 0.3, 1], opacity: [0.6, 1, 0.6] }}
            transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
            className="w-px h-14 bg-gradient-to-b from-white/70 to-transparent origin-top"
          />
          <span className="text-white/40 text-[8px] tracking-[0.3em] uppercase">Scroll</span>
        </div>
      </section>

      {/* ════════════════════════════════════════
          2. TRUST BADGES
      ════════════════════════════════════════ */}
      <section className="bg-white border-y border-[#D4AF37]/15">
        <div className="max-w-[1440px] mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-[#D4AF37]/12">
            {[
              { icon: Award, label: "BIS Certified", sub: "100% authentic & hallmarked" },
              { icon: Shield, label: "Secure Payments", sub: "Razorpay encrypted checkout" },
              { icon: Truck, label: "Free Delivery", sub: "Orders above ₹5,000" },
              { icon: RefreshCcw, label: "Easy Returns", sub: "30-day hassle-free returns" },
            ].map(({ icon: Icon, label, sub }, i) => (
              <motion.div {...fadeIn(i * 0.08)} key={label} className="flex items-center gap-3.5 px-6 py-5">
                <div className="w-10 h-10 rounded-full bg-[#D4AF37]/10 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4.5 h-4.5 text-[#D4AF37]" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-[10.5px] font-bold tracking-wide text-[#0F0F0F] uppercase">{label}</p>
                  <p className="text-[10px] text-[#0F0F0F]/45 mt-0.5 leading-snug">{sub}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          3. FEATURED CATEGORIES
      ════════════════════════════════════════ */}
      <section className="py-24 md:py-32 bg-[#FAF8F3]">
        <div className="max-w-[1440px] mx-auto px-6">
          <motion.div {...fadeUp()} className="text-center mb-14">
            <p className="section-eyebrow mb-4">Shop by Category</p>
            <h2 className="font-serif text-4xl md:text-5xl text-[#0F0F0F] mb-4">Explore Collections</h2>
            <div className="gold-divider mx-auto" />
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
            {[
              { label: "Rings", slug: "rings", src: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=500" },
              { label: "Necklaces", slug: "necklaces", src: "https://images.unsplash.com/photo-1599643478524-fb66f70d00f7?auto=format&fit=crop&q=80&w=500" },
              { label: "Pendants", slug: "pendants", src: "https://images.unsplash.com/photo-1602173574767-37ac01994b2a?auto=format&fit=crop&q=80&w=500" },
              { label: "Bracelets", slug: "bracelets", src: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80&w=500" },
              { label: "Earrings", slug: "earrings", src: "https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&q=80&w=500" },
              { label: "Accessories", slug: "accessories", src: "https://images.unsplash.com/photo-1576502200272-341a4b8d73a9?auto=format&fit=crop&q=80&w=500" },
            ].map(({ label, slug, src }, i) => (
              <motion.div {...fadeUp(i * 0.07)} key={slug}>
                <Link href={`/category/${slug}`}>
                  <div className="group relative aspect-[3/4] overflow-hidden cursor-pointer">
                    <img
                      src={src}
                      alt={label}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    {/* Gold glow overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent transition-opacity duration-300" />
                    <div className="absolute inset-0 bg-[#D4AF37]/0 group-hover:bg-[#D4AF37]/12 transition-all duration-500" />
                    <div className="absolute bottom-0 left-0 right-0 p-4 text-center">
                      <p className="text-white font-serif text-lg leading-tight">{label}</p>
                      <p className="text-[#D4AF37] text-[8.5px] tracking-[0.25em] uppercase mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        Shop Now →
                      </p>
                    </div>
                    {/* Gold border on hover */}
                    <div className="absolute inset-0 border-2 border-[#D4AF37]/0 group-hover:border-[#D4AF37]/50 transition-all duration-400" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          4. NEW ARRIVALS
      ════════════════════════════════════════ */}
      {arrivals && arrivals.length > 0 && (
        <section className="py-24 bg-white">
          <div className="max-w-[1440px] mx-auto px-6">
            <motion.div {...fadeUp()} className="flex items-end justify-between mb-14">
              <div>
                <p className="section-eyebrow mb-3">Just Arrived</p>
                <h2 className="font-serif text-4xl md:text-5xl text-[#0F0F0F]">New Arrivals</h2>
              </div>
              <Link href="/shop" className="hidden md:flex items-center gap-2 text-[10.5px] tracking-[0.2em] uppercase font-bold text-[#D4AF37] hover:gap-3 transition-all border-b border-[#D4AF37]/40 pb-0.5">
                View All <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </motion.div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 sm:gap-x-6 gap-y-8 sm:gap-y-14">
              {arrivals.slice(0, 4).map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ════════════════════════════════════════
          5. TRENDING PRODUCTS
      ════════════════════════════════════════ */}
      {trending && trending.length > 0 && (
        <section className="py-24 bg-[#FAF8F3]">
          <div className="max-w-[1440px] mx-auto px-6">
            <motion.div {...fadeUp()} className="flex items-end justify-between mb-14">
              <div>
                <p className="section-eyebrow mb-3">Most Loved</p>
                <h2 className="font-serif text-4xl md:text-5xl text-[#0F0F0F]">Trending Now</h2>
              </div>
              <Link href="/shop?sort=trending" className="hidden md:flex items-center gap-2 text-[10.5px] tracking-[0.2em] uppercase font-bold text-[#D4AF37] hover:gap-3 transition-all border-b border-[#D4AF37]/40 pb-0.5">
                See More <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </motion.div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 sm:gap-x-6 gap-y-8 sm:gap-y-14">
              {trending.slice(0, 4).map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ════════════════════════════════════════
          6. CURATED LUXURY COLLECTIONS
      ════════════════════════════════════════ */}
      <section className="py-24 bg-white">
        <div className="max-w-[1440px] mx-auto px-6">
          <motion.div {...fadeUp()} className="text-center mb-14">
            <p className="section-eyebrow mb-4">Curated For You</p>
            <h2 className="font-serif text-4xl md:text-5xl text-[#0F0F0F] mb-4">Luxury Collections</h2>
            <div className="gold-divider mx-auto" />
          </motion.div>

          {/* Collections — left tall card + right two stacked cards */}
          <div className="flex flex-col md:flex-row gap-4">

            {/* ── LEFT: tall feature card ── */}
            <motion.div {...fadeUp(0)} className="md:w-1/2 group relative overflow-hidden cursor-pointer">
              <Link href="/category/rings" className="block">
                <div className="relative overflow-hidden aspect-[4/5] md:aspect-auto md:h-[600px]">
                  <img
                    src="https://images.unsplash.com/photo-1573408301185-9519f94815b5?auto=format&fit=crop&q=85&w=900"
                    alt="Bridal Collection"
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
                  <div className="absolute inset-0 bg-[#D4AF37]/0 group-hover:bg-[#D4AF37]/6 transition-colors duration-500" />
                  <div className="absolute bottom-0 left-0 right-0 p-8 md:p-10">
                    <p className="text-[#D4AF37] text-[9px] tracking-[0.3em] uppercase font-semibold mb-3">For your forever moments</p>
                    <h3 className="font-serif text-3xl md:text-4xl text-white mb-5">Bridal Collection</h3>
                    <span className="inline-flex items-center gap-2 text-white/80 group-hover:text-[#D4AF37] text-[10px] tracking-[0.22em] uppercase font-semibold transition-colors border-b border-white/30 group-hover:border-[#D4AF37] pb-0.5">
                      Explore <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>

            {/* ── RIGHT: two stacked shorter cards ── */}
            <div className="md:w-1/2 flex flex-col gap-4">
              {[
                {
                  title: "Everyday Elegance",
                  sub: "Refined pieces for daily wear",
                  href: "/shop",
                  src: "https://images.unsplash.com/photo-1624913503273-5f9c4e980dba?auto=format&fit=crop&q=85&w=800",
                },
                {
                  title: "Royal Gold Series",
                  sub: "Heritage-inspired masterpieces",
                  href: "/category/necklaces",
                  src: "https://images.unsplash.com/photo-1600721391776-b5cd0e0048f9?auto=format&fit=crop&q=85&w=800",
                },
              ].map(({ title, sub, href, src }, i) => (
                <motion.div key={title} {...fadeUp((i + 1) * 0.12)} className="group relative overflow-hidden cursor-pointer flex-1">
                  <Link href={href} className="block">
                    <div className="relative overflow-hidden aspect-[16/9] md:aspect-auto md:h-[290px]">
                      <img
                        src={src}
                        alt={title}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      <div className="absolute inset-0 bg-[#D4AF37]/0 group-hover:bg-[#D4AF37]/6 transition-colors duration-500" />
                      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                        <p className="text-[#D4AF37] text-[9px] tracking-[0.3em] uppercase font-semibold mb-2">{sub}</p>
                        <h3 className="font-serif text-2xl md:text-3xl text-white mb-4">{title}</h3>
                        <span className="inline-flex items-center gap-2 text-white/80 group-hover:text-[#D4AF37] text-[10px] tracking-[0.22em] uppercase font-semibold transition-colors border-b border-white/30 group-hover:border-[#D4AF37] pb-0.5">
                          Explore <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          7. FLASH SALE — LUXURY REDESIGN
      ════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-[#0A0A0A] min-h-[520px] flex items-center">

        {/* Background: radial glow + fine grid */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Warm gold radial glow centre */}
          <div className="absolute inset-0"
            style={{ background: "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(212,175,55,0.10) 0%, transparent 70%)" }}
          />
          {/* Subtle diagonal lines texture */}
          <div className="absolute inset-0 opacity-[0.03]"
            style={{ backgroundImage: "repeating-linear-gradient(45deg, #D4AF37 0px, #D4AF37 1px, transparent 1px, transparent 40px)" }}
          />
          {/* Corner ornaments */}
          <div className="absolute top-8 left-8 w-16 h-16 border-t border-l border-[#D4AF37]/25" />
          <div className="absolute top-8 right-8 w-16 h-16 border-t border-r border-[#D4AF37]/25" />
          <div className="absolute bottom-8 left-8 w-16 h-16 border-b border-l border-[#D4AF37]/25" />
          <div className="absolute bottom-8 right-8 w-16 h-16 border-b border-r border-[#D4AF37]/25" />
        </div>

        <div className="relative z-10 w-full max-w-[1440px] mx-auto px-6 py-20">
          <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">

            {/* LEFT: Copy */}
            <motion.div {...fadeUp()} className="flex-1 text-center lg:text-left">
              {/* Eyebrow */}
              <div className="inline-flex items-center gap-3 mb-6">
                <div className="h-px w-8 bg-[#D4AF37]/60" />
                <span className="text-[#D4AF37] text-[9px] tracking-[0.45em] uppercase font-bold">Limited Time Offer</span>
                <div className="h-px w-8 bg-[#D4AF37]/60" />
              </div>

              {/* Headline */}
              <h2 className="font-serif text-5xl md:text-6xl xl:text-7xl text-white leading-[1.0] mb-5">
                Flat{" "}
                <span className="relative inline-block">
                  <span className="text-[#D4AF37]">20% OFF</span>
                  <span className="absolute -bottom-1 left-0 right-0 h-px bg-[#D4AF37]/40" />
                </span>
                <br />
                <span className="text-white/60 text-4xl md:text-5xl font-serif">Today Only</span>
              </h2>

              <p className="text-white/40 text-sm tracking-wide mb-8 max-w-sm mx-auto lg:mx-0">
                Apply code{" "}
                <span className="text-[#D4AF37] font-bold tracking-[0.12em] bg-[#D4AF37]/8 px-2 py-0.5">
                  PEARLIS10
                </span>{" "}
                at checkout to unlock exclusive savings on our finest pieces.
              </p>

              <Link href="/shop">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  className="relative overflow-hidden group bg-[#D4AF37] hover:bg-[#c9a430] text-[#0A0A0A] px-12 py-4 text-[10.5px] tracking-[0.3em] uppercase font-extrabold transition-colors shadow-2xl shadow-[#D4AF37]/20"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    Shop the Sale <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </motion.button>
              </Link>
            </motion.div>

            {/* RIGHT: Countdown */}
            <motion.div {...fadeUp(0.15)} className="flex-shrink-0">
              <p className="text-[9px] tracking-[0.3em] uppercase text-white/25 text-center mb-6 font-semibold">Offer Ends In</p>
              <div className="flex items-start gap-3 md:gap-5">
                {[
                  { val: h, label: "Hours" },
                  { val: m, label: "Minutes" },
                  { val: s, label: "Seconds" },
                ].map(({ val, label }, i) => (
                  <div key={label} className="flex items-start gap-3 md:gap-5">
                    {i > 0 && (
                      <div className="flex flex-col gap-3 pt-4">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]/50" />
                        <div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]/50" />
                      </div>
                    )}
                    <div className="flex flex-col items-center">
                      {/* Number box */}
                      <div className="relative w-20 h-24 md:w-28 md:h-32 bg-white/4 border border-[#D4AF37]/20 flex items-center justify-center overflow-hidden">
                        {/* Inner gold glow */}
                        <div className="absolute inset-0"
                          style={{ background: "radial-gradient(ellipse 80% 60% at 50% 100%, rgba(212,175,55,0.12) 0%, transparent 70%)" }}
                        />
                        <AnimatePresence mode="popLayout">
                          <motion.span
                            key={val}
                            initial={{ y: -20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 20, opacity: 0 }}
                            transition={{ duration: 0.35, ease: "easeOut" }}
                            className="relative font-serif text-4xl md:text-5xl text-white tabular-nums"
                          >
                            {String(val).padStart(2, "0")}
                          </motion.span>
                        </AnimatePresence>
                        {/* Bottom gold line */}
                        <div className="absolute bottom-0 left-4 right-4 h-px bg-[#D4AF37]/30" />
                      </div>
                      <span className="text-[8px] tracking-[0.3em] uppercase text-white/30 mt-2.5 font-semibold">{label}</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          8. BRAND STORY — LUXURY REDESIGN
      ════════════════════════════════════════ */}
      <section className="bg-[#0F0F0F] relative overflow-hidden">

        {/* Faint vertical rule decoration */}
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-[#D4AF37]/6 hidden lg:block" />

        <div className="max-w-[1440px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[680px]">

            {/* ── LEFT: Cinematic image panel ── */}
            <motion.div {...fadeIn()} className="relative overflow-hidden min-h-[480px] lg:min-h-0">
              <img
                src="https://images.unsplash.com/photo-1583937443943-b50a01b3e301?auto=format&fit=crop&q=85&w=900"
                alt="Artisan crafting jewelry"
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover scale-105 transition-transform duration-[2s] hover:scale-100"
              />

              {/* Multi-layer darkening gradient */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />

              {/* Gold corner frame top-left */}
              <div className="absolute top-8 left-8 w-14 h-14 pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-px bg-[#D4AF37]/60" />
                <div className="absolute top-0 left-0 w-px h-full bg-[#D4AF37]/60" />
              </div>
              {/* Gold corner frame bottom-right */}
              <div className="absolute bottom-8 right-8 w-14 h-14 pointer-events-none">
                <div className="absolute bottom-0 right-0 w-full h-px bg-[#D4AF37]/60" />
                <div className="absolute bottom-0 right-0 w-px h-full bg-[#D4AF37]/60" />
              </div>

              {/* Badge overlay bottom-left */}
              <div className="absolute bottom-10 left-10 flex flex-col gap-1">
                <p className="text-[#D4AF37] text-[9px] tracking-[0.35em] uppercase font-bold">Est. 2018</p>
                <p className="font-serif text-white text-xl">The Pearlis Atelier</p>
                <div className="w-8 h-px bg-[#D4AF37]/60 mt-1" />
              </div>

              {/* Play button — centre */}
              <button
                onClick={() => setIsVideoOpen(true)}
                className="absolute inset-0 flex items-center justify-center group"
                aria-label="Play brand video"
              >
                <div className="flex flex-col items-center">
                  <motion.div
                    whileHover={{ scale: 1.12 }}
                    whileTap={{ scale: 0.95 }}
                    className="relative flex items-center justify-center mb-4"
                  >
                    {/* Double pulsing rings */}
                    <span className="absolute w-28 h-28 rounded-full border border-[#D4AF37]/20 animate-ping opacity-50" />
                    <span className="absolute w-22 h-22 rounded-full border border-[#D4AF37]/30" style={{ width: 88, height: 88 }} />
                    {/* Core button */}
                    <div className="relative w-18 h-18 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300"
                      style={{ width: 72, height: 72, background: "rgba(212,175,55,0.15)", backdropFilter: "blur(8px)", border: "1.5px solid rgba(212,175,55,0.7)" }}
                    >
                      <div className="absolute inset-0 rounded-full group-hover:bg-[#D4AF37]/30 transition-colors duration-300" />
                      <Play className="w-6 h-6 text-white ml-1.5 relative z-10" fill="white" />
                    </div>
                  </motion.div>
                  <span className="text-white/65 text-[9px] tracking-[0.35em] uppercase font-semibold">Watch Our Story</span>
                </div>
              </button>
            </motion.div>

            {/* ── RIGHT: Editorial copy ── */}
            <motion.div {...fadeUp(0.18)} className="flex flex-col justify-center px-10 md:px-14 xl:px-20 py-20 relative">

              {/* Top accent line */}
              <div className="flex items-center gap-4 mb-8">
                <div className="h-px flex-1 bg-[#D4AF37]/15 max-w-[3rem]" />
                <p className="text-[#D4AF37] text-[9px] tracking-[0.45em] uppercase font-bold">The Pearlis Atelier</p>
              </div>

              {/* Headline */}
              <h2 className="font-serif text-4xl md:text-5xl xl:text-6xl text-white leading-[1.08] mb-8">
                Where Craft<br />
                Meets{" "}
                <span className="relative inline-block">
                  <em className="text-[#D4AF37] not-italic">Passion</em>
                  <svg className="absolute -bottom-2 left-0 w-full" height="6" viewBox="0 0 100 6" preserveAspectRatio="none">
                    <path d="M0 5 Q50 0 100 5" stroke="#D4AF37" strokeWidth="1" fill="none" opacity="0.5" />
                  </svg>
                </span>
              </h2>

              <div className="w-12 h-px bg-[#D4AF37] mb-8" />

              <p className="text-white/50 text-sm leading-[1.95] mb-5 max-w-md">
                Every Pearlis creation begins with a singular vision. Our master artisans blend centuries-old techniques with contemporary design — crafting pieces that transcend time and tell your story.
              </p>
              <p className="text-white/50 text-sm leading-[1.95] mb-12 max-w-md">
                We source only the finest ethically-mined diamonds and precious metals, ensuring each piece is a testament to uncompromising quality and responsible luxury.
              </p>

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-6 mb-12 py-8 border-y border-[#D4AF37]/10">
                {[
                  { num: "7+", label: "Years of Craft" },
                  { num: "50K+", label: "Pieces Created" },
                  { num: "98%", label: "Happy Clients" },
                ].map(({ num, label }) => (
                  <div key={label} className="text-center">
                    <p className="font-serif text-3xl text-[#D4AF37] mb-1">{num}</p>
                    <p className="text-[9px] tracking-[0.2em] uppercase text-white/30 font-semibold">{label}</p>
                  </div>
                ))}
              </div>

              <Link href="/about">
                <motion.button
                  whileHover={{ x: 4 }}
                  className="group inline-flex items-center gap-3 text-[#D4AF37] text-[10px] tracking-[0.28em] uppercase font-bold w-fit"
                >
                  <span className="border-b border-[#D4AF37]/40 pb-0.5 group-hover:border-[#D4AF37] transition-colors">
                    Discover Our Story
                  </span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </motion.button>
              </Link>

              {/* Decorative Roman numeral watermark */}
              <div className="absolute bottom-8 right-10 font-serif text-7xl text-white/[0.03] select-none pointer-events-none leading-none">
                VIII
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          9. FEATURED / BEST SELLERS
      ════════════════════════════════════════ */}
      {featured && featured.length > 0 && (
        <section className="py-24 bg-white">
          <div className="max-w-[1440px] mx-auto px-6">
            <motion.div {...fadeUp()} className="flex items-end justify-between mb-14">
              <div>
                <p className="section-eyebrow mb-3">Top Picks</p>
                <h2 className="font-serif text-4xl md:text-5xl text-[#0F0F0F]">Best Sellers</h2>
              </div>
              <Link href="/shop" className="hidden md:flex items-center gap-2 text-[10.5px] tracking-[0.2em] uppercase font-bold text-[#D4AF37] hover:gap-3 transition-all border-b border-[#D4AF37]/40 pb-0.5">
                View All <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </motion.div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 sm:gap-x-6 gap-y-8 sm:gap-y-14">
              {featured.slice(0, 8).map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ════════════════════════════════════════
          10. WHY CHOOSE US
      ════════════════════════════════════════ */}
      <section className="py-24 bg-[#FAF8F3]">
        <div className="max-w-[1440px] mx-auto px-6">
          <motion.div {...fadeUp()} className="text-center mb-14">
            <p className="section-eyebrow mb-4">Why Pearlis</p>
            <h2 className="font-serif text-4xl md:text-5xl text-[#0F0F0F] mb-4">The Pearlis Promise</h2>
            <div className="gold-divider mx-auto" />
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {[
              { icon: Award, title: "BIS Certified", desc: "Every piece carries a government certification mark for gold purity." },
              { icon: Gem, title: "Ethically Sourced", desc: "Conflict-free diamonds from certified suppliers worldwide." },
              { icon: Shield, title: "Razorpay Secured", desc: "Bank-grade encryption for every transaction you make." },
              { icon: RefreshCcw, title: "30-Day Returns", desc: "Not in love? Return it hassle-free within 30 days." },
              { icon: Clock, title: "Lifetime Shine", desc: "Free polish and maintenance for the lifetime of your jewellery." },
            ].map(({ icon: Icon, title, desc }, i) => (
              <motion.div {...fadeUp(i * 0.09)} key={title} className="group text-center p-8 bg-white border border-[#D4AF37]/12 hover:border-[#D4AF37]/40 hover:shadow-lg transition-all duration-300">
                <div className="w-12 h-12 rounded-full bg-[#D4AF37]/10 group-hover:bg-[#D4AF37]/20 flex items-center justify-center mx-auto mb-5 transition-colors">
                  <Icon className="w-5 h-5 text-[#D4AF37]" strokeWidth={1.5} />
                </div>
                <h3 className="font-serif text-lg text-[#0F0F0F] mb-3">{title}</h3>
                <p className="text-[#0F0F0F]/50 text-xs leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          11. INSTAGRAM FEED (decorative)
      ════════════════════════════════════════ */}
      <section className="py-20 bg-white">
        <div className="max-w-[1440px] mx-auto px-6">
          <motion.div {...fadeUp()} className="text-center mb-10">
            <p className="section-eyebrow mb-4">Follow Us</p>
            <h2 className="font-serif text-3xl md:text-4xl text-[#0F0F0F] mb-2">
              <Instagram className="inline-block w-7 h-7 mr-2 mb-1 text-[#D4AF37]" strokeWidth={1.5} />
              @pearlisofficial
            </h2>
            <p className="text-[#0F0F0F]/40 text-sm mt-2">Tag us to be featured on our page</p>
          </motion.div>

          {/* Grid */}
          <div className="grid grid-cols-3 md:grid-cols-6 gap-1.5">
            {[
              "https://images.unsplash.com/photo-1599643478524-fb66f70d00f7?auto=format&fit=crop&q=80&w=400",
              "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=400",
              "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80&w=400",
              "https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&q=80&w=400",
              "https://images.unsplash.com/photo-1602173574767-37ac01994b2a?auto=format&fit=crop&q=80&w=400",
              "https://images.unsplash.com/photo-1573408301185-9519f94815b5?auto=format&fit=crop&q=80&w=400",
            ].map((src, i) => (
              <motion.div {...fadeIn(i * 0.07)} key={i} className="group relative aspect-square overflow-hidden cursor-pointer">
                <img src={src} alt={`Instagram post ${i + 1}`} loading="lazy" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
                  <Instagram className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-8">
            <a href="#" className="inline-flex items-center gap-2 border border-[#D4AF37]/40 hover:border-[#D4AF37] text-[#0F0F0F] hover:text-[#D4AF37] px-8 py-3 text-[10px] tracking-[0.2em] uppercase font-bold transition-all">
              <Instagram className="w-3.5 h-3.5" /> Follow on Instagram
            </a>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          12. TESTIMONIALS
      ════════════════════════════════════════ */}
      <section className="py-24 bg-[#FAF8F3]">
        <div className="max-w-[1440px] mx-auto px-6">
          <motion.div {...fadeUp()} className="text-center mb-14">
            <p className="section-eyebrow mb-4">Customer Stories</p>
            <h2 className="font-serif text-4xl md:text-5xl text-[#0F0F0F] mb-4">What Our Clients Say</h2>
            <div className="gold-divider mx-auto" />
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: "Priya Sharma", loc: "Mumbai", text: "I bought a diamond pendant for my mother's birthday — absolutely stunning. The packaging itself felt like a luxury experience.", rating: 5, product: "Diamond Pendant" },
              { name: "Arjun Mehta", loc: "Delhi", text: "The quality is unmatched. I've purchased rings from multiple jewellers but Pearlis is on a completely different level of craftsmanship.", rating: 5, product: "Gold Ring" },
              { name: "Kavitha Reddy", loc: "Bangalore", text: "Fast delivery, beautiful jewellery, and amazing customer support. The earrings I ordered were even prettier in person!", rating: 5, product: "Pearl Earrings" },
            ].map(({ name, loc, text, rating, product }, i) => (
              <motion.div {...fadeUp(i * 0.1)} key={name} className="bg-white p-8 border border-[#D4AF37]/15 hover:border-[#D4AF37]/35 hover:shadow-md transition-all duration-300">
                <div className="flex gap-1 mb-5">
                  {Array.from({ length: rating }).map((_, j) => (
                    <Star key={j} className="w-3.5 h-3.5 fill-[#D4AF37] text-[#D4AF37]" />
                  ))}
                </div>
                <p className="text-[#0F0F0F]/65 text-sm leading-[1.85] mb-6 italic">"{text}"</p>
                <div className="flex items-center gap-3 pt-4 border-t border-[#0F0F0F]/6">
                  <div className="w-9 h-9 rounded-full bg-[#D4AF37]/15 flex items-center justify-center flex-shrink-0">
                    <span className="font-serif text-[#D4AF37] text-sm font-bold">{name[0]}</span>
                  </div>
                  <div>
                    <p className="text-[10.5px] font-bold tracking-wide text-[#0F0F0F] uppercase">{name}</p>
                    <p className="text-[9.5px] text-[#0F0F0F]/40 mt-0.5">{loc} · Purchased {product}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          13. BLOG PREVIEW
      ════════════════════════════════════════ */}
      {blogsData && blogsData.blogs.length > 0 && (
        <section className="py-24 bg-white">
          <div className="max-w-[1440px] mx-auto px-6">
            <motion.div {...fadeUp()} className="flex items-end justify-between mb-14">
              <div>
                <p className="section-eyebrow mb-3">Pearlis Journal</p>
                <h2 className="font-serif text-4xl md:text-5xl text-[#0F0F0F]">Stories & Guides</h2>
              </div>
              <Link href="/blog" className="hidden md:flex items-center gap-2 text-[10.5px] tracking-[0.2em] uppercase font-bold text-[#D4AF37] hover:gap-3 transition-all border-b border-[#D4AF37]/40 pb-0.5">
                All Posts <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {blogsData.blogs.slice(0, 3).map((blog, i) => (
                <motion.div {...fadeUp(i * 0.1)} key={blog.id} className="group cursor-pointer">
                  <Link href={`/blog/${blog.id}`}>
                    <div className="aspect-[16/10] overflow-hidden bg-[#F5F0E8] mb-5">
                      {blog.thumbnail ? (
                        <img src={blog.thumbnail} alt={blog.title} loading="lazy" className="w-full h-full object-cover transition-transform duration-600 group-hover:scale-107" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[#F5F0E8] to-[#E8DFC8] flex items-center justify-center">
                          <span className="font-serif text-[#D4AF37]/60 text-4xl">P</span>
                        </div>
                      )}
                    </div>
                    <p className="text-[9px] tracking-[0.2em] uppercase text-[#D4AF37] font-semibold mb-2">Jewellery Guide</p>
                    <h3 className="font-serif text-xl text-[#0F0F0F] group-hover:text-[#D4AF37] transition-colors mb-3 leading-snug">
                      {blog.title}
                    </h3>
                    <p className="text-[#0F0F0F]/50 text-xs leading-relaxed line-clamp-2">{blog.excerpt}</p>
                    <span className="inline-flex items-center gap-1.5 text-[10px] tracking-[0.15em] uppercase font-bold text-[#D4AF37] mt-4 border-b border-[#D4AF37]/30 group-hover:border-[#D4AF37] pb-0.5 transition-colors">
                      Read More <ArrowRight className="w-3 h-3" />
                    </span>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ════════════════════════════════════════
          14. NEWSLETTER
      ════════════════════════════════════════ */}
      <section className="py-24 bg-[#0F0F0F] relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full border border-[#D4AF37]/6" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] rounded-full border border-[#D4AF37]/8" />
        </div>
        <div className="max-w-2xl mx-auto px-6 text-center relative z-10">
          <motion.div {...fadeUp()}>
            <p className="section-eyebrow mb-5">Stay in the Loop</p>
            <h2 className="font-serif text-4xl md:text-5xl text-white mb-3">
              Join the <em className="text-[#D4AF37] not-italic">Pearlis</em> Circle
            </h2>
            <p className="text-white/40 text-sm leading-relaxed mb-2 mt-4">
              Get exclusive access to new collections, private events, jewellery care tips, and member-only offers.
            </p>
            <p className="text-[#D4AF37] text-xs font-semibold tracking-wide mb-10">
              + 10% OFF your first order
            </p>
            <form
              className="flex flex-col sm:flex-row gap-0 border border-white/15 focus-within:border-[#D4AF37]/60 transition-colors"
              onSubmit={(e) => e.preventDefault()}
            >
              <input
                type="email"
                placeholder="Your email address"
                className="flex-1 bg-transparent text-white placeholder:text-white/30 px-5 py-4 text-sm outline-none"
              />
              <button
                type="submit"
                className="bg-[#D4AF37] hover:bg-[#c9a430] text-white px-8 py-4 text-[10px] tracking-[0.25em] uppercase font-bold transition-colors whitespace-nowrap"
              >
                Subscribe
              </button>
            </form>
            <p className="text-white/20 text-[9.5px] mt-4 tracking-wide">We respect your privacy. Unsubscribe at any time.</p>
          </motion.div>
        </div>
      </section>

      <Footer />

      {/* ════════════════════════════════════════
          VIDEO LIGHTBOX MODAL
      ════════════════════════════════════════ */}
      <AnimatePresence>
        {isVideoOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[300] bg-black/92 flex items-center justify-center px-4"
            onClick={() => setIsVideoOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.88, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.88, opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-4xl"
            >
              {/* Close button */}
              <button
                onClick={() => setIsVideoOpen(false)}
                className="absolute -top-12 right-0 text-white/60 hover:text-white flex items-center gap-2 text-[11px] tracking-[0.2em] uppercase font-medium transition-colors"
              >
                <X className="w-4 h-4" /> Close
              </button>

              {/* Gold border frame */}
              <div className="border border-[#D4AF37]/40 p-1 shadow-2xl shadow-black/60">
                {/* 16:9 video wrapper */}
                <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
                  <iframe
                    src={`https://www.youtube.com/embed/e2bPSJGEatU?autoplay=1&rel=0&showinfo=0&modestbranding=1&color=white`}
                    title="Pearlis — The Art of Fine Jewellery"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full bg-black"
                  />
                </div>
              </div>

              {/* Caption */}
              <div className="text-center mt-5">
                <p className="text-[#D4AF37] text-[10px] tracking-[0.3em] uppercase font-semibold">The Pearlis Atelier</p>
                <p className="text-white/40 text-xs mt-1">Where every piece begins with a vision</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
