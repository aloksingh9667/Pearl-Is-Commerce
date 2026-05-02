import { Link, useLocation } from "wouter";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ShoppingBag, User as UserIcon, Menu, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useGetCart } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [location] = useLocation();
  const { user } = useAuth();
  
  const { data: cart } = useGetCart({
    query: {
      retry: false
    }
  });

  const cartItemCount = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isHome = location === "/";
  const isDarkNav = isHome && !isScrolled;

  const navClasses = `fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out ${
    isScrolled 
      ? "bg-background/95 backdrop-blur-md border-b border-border shadow-sm py-4" 
      : isHome 
        ? "bg-transparent py-6 text-white" 
        : "bg-background py-6 text-foreground"
  }`;

  const linkClasses = `text-sm font-medium tracking-wide uppercase transition-colors hover:text-accent relative group ${
    isDarkNav ? "text-white/90" : "text-foreground/80"
  }`;

  const iconClasses = `w-5 h-5 transition-colors hover:text-accent ${
    isDarkNav ? "text-white" : "text-foreground"
  }`;

  return (
    <>
      <nav className={navClasses}>
        <div className="container mx-auto px-6 md:px-12 flex items-center justify-between">
          <div className="hidden md:flex items-center gap-8">
            <Link href="/shop" className={linkClasses}>
              Shop
              <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-accent transition-all group-hover:w-full"></span>
            </Link>
            <Link href="/category/necklaces" className={linkClasses}>
              Collections
              <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-accent transition-all group-hover:w-full"></span>
            </Link>
            <Link href="/about" className={linkClasses}>
              Atelier
              <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-accent transition-all group-hover:w-full"></span>
            </Link>
          </div>

          <div className="flex-1 md:flex-none text-center">
            <Link href="/">
              <span className={`font-serif text-3xl tracking-widest ${isDarkNav ? "text-white" : "text-foreground"}`}>
                PEARLIS
              </span>
            </Link>
          </div>

          <div className="flex items-center justify-end gap-6">
            <button className={iconClasses}>
              <Search strokeWidth={1.5} />
            </button>
            <Link href={user ? (user.role === 'admin' ? '/admin' : '/orders') : '/login'} className={iconClasses}>
              <UserIcon strokeWidth={1.5} />
            </Link>
            <Link href="/cart" className={`relative ${iconClasses}`}>
              <ShoppingBag strokeWidth={1.5} />
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-accent text-accent-foreground text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </Link>
            <button 
              className="md:hidden ml-2"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className={iconClasses} />
            </button>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            className="fixed inset-0 z-[100] bg-background flex flex-col"
          >
            <div className="p-6 flex justify-between items-center border-b border-border">
              <span className="font-serif text-2xl tracking-widest">PEARLIS</span>
              <button onClick={() => setIsMobileMenuOpen(false)}>
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="flex flex-col p-8 gap-6 text-xl font-serif">
              <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>Home</Link>
              <Link href="/shop" onClick={() => setIsMobileMenuOpen(false)}>Shop</Link>
              <Link href="/category/necklaces" onClick={() => setIsMobileMenuOpen(false)}>Collections</Link>
              <Link href="/about" onClick={() => setIsMobileMenuOpen(false)}>Our Story</Link>
              <Link href="/contact" onClick={() => setIsMobileMenuOpen(false)}>Contact</Link>
            </div>
            <div className="mt-auto p-8 border-t border-border">
              {user ? (
                <Button variant="outline" className="w-full" onClick={() => setIsMobileMenuOpen(false)}>
                  <Link href={user.role === 'admin' ? '/admin' : '/orders'}>My Account</Link>
                </Button>
              ) : (
                <Button className="w-full bg-primary text-primary-foreground" onClick={() => setIsMobileMenuOpen(false)}>
                  <Link href="/login">Sign In</Link>
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
