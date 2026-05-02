import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground py-16 md:py-24">
      <div className="container mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="md:col-span-1">
            <h2 className="font-serif text-2xl tracking-widest mb-6">PEARLIS</h2>
            <p className="text-primary-foreground/70 text-sm leading-relaxed max-w-xs">
              Exceptional jewelry crafted with intention. A sanctuary for those who appreciate the quiet power of luxury.
            </p>
          </div>
          
          <div>
            <h3 className="font-serif text-lg mb-6">Explore</h3>
            <ul className="space-y-4 text-sm text-primary-foreground/70">
              <li><Link href="/shop" className="hover:text-accent transition-colors">All Jewelry</Link></li>
              <li><Link href="/category/necklaces" className="hover:text-accent transition-colors">Necklaces & Pendants</Link></li>
              <li><Link href="/category/rings" className="hover:text-accent transition-colors">Rings</Link></li>
              <li><Link href="/category/bracelets" className="hover:text-accent transition-colors">Bracelets</Link></li>
              <li><Link href="/gallery" className="hover:text-accent transition-colors">Gallery</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-serif text-lg mb-6">Assistance</h3>
            <ul className="space-y-4 text-sm text-primary-foreground/70">
              <li><Link href="/contact" className="hover:text-accent transition-colors">Contact Us</Link></li>
              <li><Link href="/about" className="hover:text-accent transition-colors">Our Story</Link></li>
              <li><Link href="/orders" className="hover:text-accent transition-colors">Order Status</Link></li>
              <li><Link href="#" className="hover:text-accent transition-colors">Care Guide</Link></li>
              <li><Link href="#" className="hover:text-accent transition-colors">Returns & Exchanges</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-serif text-lg mb-6">Atelier</h3>
            <p className="text-sm text-primary-foreground/70 mb-4">
              124 Luxury Lane<br />
              New York, NY 10012<br />
              United States
            </p>
            <p className="text-sm text-primary-foreground/70">
              concierge@pearlis.com<br />
              +1 (800) 555-0199
            </p>
          </div>
        </div>
        
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-primary-foreground/50">
          <p>&copy; {new Date().getFullYear()} Pearlis. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
