import { useGetFeaturedProducts, useGetTrendingProducts, useGetNewArrivals } from "@workspace/api-client-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ProductCard } from "@/components/ui/ProductCard";
import { CategoryCard } from "@/components/ui/CategoryCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";
import { motion } from "framer-motion";

export default function Home() {
  const { data: featuredProducts } = useGetFeaturedProducts();
  const { data: trendingProducts } = useGetTrendingProducts();
  
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative h-[100dvh] w-full overflow-hidden bg-black">
        <img 
          src="/images/hero.png" 
          alt="Luxury Jewelry" 
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 z-10">
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-white/80 uppercase tracking-[0.3em] text-sm mb-6 font-medium"
          >
            The New Collection
          </motion.p>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="font-serif text-5xl md:text-7xl lg:text-8xl text-white mb-10 max-w-4xl leading-tight"
          >
            Elegance Set In Stone
          </motion.h1>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <Link href="/shop">
              <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-none px-10 py-6 text-sm tracking-widest uppercase">
                Discover More
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-24 md:py-32 px-6 container mx-auto">
        <div className="flex flex-col items-center text-center mb-16">
          <h2 className="font-serif text-4xl mb-4">Curated Selections</h2>
          <div className="w-16 h-px bg-accent mb-6"></div>
          <p className="text-muted-foreground max-w-2xl">
            Discover our most coveted pieces, crafted with extraordinary attention to detail and designed to become heirlooms.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {featuredProducts?.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </div>
        
        <div className="mt-16 text-center">
          <Link href="/shop">
            <Button variant="outline" className="rounded-none border-border px-8 tracking-widest uppercase font-medium">
              View All Jewelry
            </Button>
          </Link>
        </div>
      </section>

      {/* Categories */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <CategoryCard 
              title="Rings" 
              image="/images/category-rings.png" 
              slug="rings"
              index={0}
            />
            <CategoryCard 
              title="Necklaces" 
              image="/images/category-necklaces.png" 
              slug="necklaces"
              index={1}
            />
            <CategoryCard 
              title="Bracelets" 
              image="/images/category-bracelets.png" 
              slug="bracelets"
              index={2}
            />
          </div>
        </div>
      </section>

      {/* Trending / Editorial */}
      <section className="py-24 md:py-32 container mx-auto px-6">
        <div className="flex flex-col lg:flex-row gap-16 items-center">
          <div className="lg:w-1/2 w-full">
            <img 
              src="https://images.unsplash.com/photo-1599643478524-fb66f70d00f7?auto=format&fit=crop&q=80&w=1000" 
              alt="Artisan crafting jewelry" 
              className="w-full aspect-[4/5] object-cover"
            />
          </div>
          <div className="lg:w-1/2 w-full">
            <h2 className="font-serif text-4xl lg:text-5xl mb-6 leading-tight">The Art of Fine Jewelry</h2>
            <div className="w-16 h-px bg-accent mb-8"></div>
            <p className="text-muted-foreground leading-relaxed mb-10 text-lg">
              Every Pearlis creation begins with a singular vision. Our master artisans blend traditional techniques with contemporary design to create pieces that transcend time. We source only the finest ethical diamonds and precious metals, ensuring each piece tells a story of uncompromising quality.
            </p>
            <Link href="/about">
              <Button variant="link" className="px-0 text-foreground border-b border-foreground rounded-none uppercase tracking-widest h-auto pb-1 hover:text-accent hover:border-accent">
                Read Our Story
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-24 bg-primary text-primary-foreground">
        <div className="container mx-auto px-6 max-w-3xl text-center">
          <h2 className="font-serif text-3xl md:text-4xl mb-6">Join The Atelier</h2>
          <p className="text-primary-foreground/70 mb-10">
            Subscribe to receive exclusive access to new collections, private events, and editorial content.
          </p>
          <form className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto">
            <Input 
              type="email" 
              placeholder="Your email address" 
              className="rounded-none bg-transparent border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50 h-12 focus-visible:ring-accent"
            />
            <Button type="button" className="rounded-none bg-accent hover:bg-accent/90 text-accent-foreground h-12 px-8 uppercase tracking-wider text-sm whitespace-nowrap">
              Subscribe
            </Button>
          </form>
        </div>
      </section>

      <Footer />
    </div>
  );
}
