import { Link, useLocation } from "wouter";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ShoppingBag, User as UserIcon, Menu, X, Heart, ChevronDown } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useGetCart } from "@workspace/api-client-react";

const navLinks = [
  { label: "Shop", href: "/shop" },
  { label: "Rings", href: "/category/rings" },
  { label: "Necklaces", href: "/category/necklaces" },
  { label: "Bracelets", href: "/category/bracelets" },
  { label: "Earrings", href: "/category/earrings" },
  { label: "Gallery", href: "/gallery" },
  { label: "Blog", href: "/blog" },
  { label: "About", href: "/about" },
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [location] = useLocation();
  const { user } = useAuth();

  const { data: cart } = useGetCart({ query: { retry: false } });
  const cartItemCount = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isHome = location === "/";
  const isTransparent = isHome && !isScrolled;

  return (
    <>
      {/* Top announcement bar */}
      <div className="bg-[#D4AF37] text-white text-center text-[11px] tracking-[0.2em] uppercase py-2 font-medium">
        Free Shipping on Orders Above ₹5,000 &nbsp;|&nbsp; Use Code <span className="font-bold">PEARLIS10</span> for 10% Off
      </div>

      <nav
        className={`sticky top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isTransparent
            ? "bg-transparent"
            : "bg-white/97 backdrop-blur-md border-b border-[#D4AF37]/20 shadow-sm"
        }`}
      >
        <div className="max-w-[1400px] mx-auto px-6 md:px-10 flex items-center justify-between h-[72px]">

          {/* LEFT — Logo */}
          <Link href="/" className="flex-shrink-0">
            <div className="flex flex-col leading-none select-none">
              <span
                className={`font-serif text-2xl md:text-3xl tracking-[0.35em] font-bold transition-colors duration-300 ${
                  isTransparent ? "text-white" : "text-[#0F0F0F]"
                }`}
              >
                PEARLIS
              </span>
              <span
                className={`text-[8px] tracking-[0.4em] uppercase mt-0.5 transition-colors duration-300 ${
                  isTransparent ? "text-[#D4AF37]" : "text-[#D4AF37]"
                }`}
              >
                Fine Jewellery
              </span>
            </div>
          </Link>

          {/* CENTRE — Navigation Links */}
          <div className="hidden lg:flex items-center gap-7 ml-10">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`relative text-[11px] font-medium tracking-[0.18em] uppercase transition-colors duration-200 group ${
                  isTransparent
                    ? "text-white/90 hover:text-[#D4AF37]"
                    : location === link.href
                    ? "text-[#D4AF37]"
                    : "text-[#0F0F0F]/75 hover:text-[#D4AF37]"
                }`}
              >
                {link.label}
                <span className="absolute -bottom-0.5 left-0 w-0 h-[1px] bg-[#D4AF37] transition-all duration-300 group-hover:w-full" />
              </Link>
            ))}
          </div>

          {/* RIGHT — Icons */}
          <div className="flex items-center gap-5">
            {/* Search */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className={`transition-colors duration-200 hover:text-[#D4AF37] ${
                isTransparent ? "text-white" : "text-[#0F0F0F]"
              }`}
              aria-label="Search"
            >
              <Search className="w-[18px] h-[18px]" strokeWidth={1.5} />
            </button>

            {/* Wishlist */}
            <Link
              href="/wishlist"
              className={`transition-colors duration-200 hover:text-[#D4AF37] hidden sm:block ${
                isTransparent ? "text-white" : "text-[#0F0F0F]"
              }`}
              aria-label="Wishlist"
            >
              <Heart className="w-[18px] h-[18px]" strokeWidth={1.5} />
            </Link>

            {/* Account */}
            <Link
              href={user ? (user.role === "admin" ? "/admin" : "/orders") : "/login"}
              className={`transition-colors duration-200 hover:text-[#D4AF37] ${
                isTransparent ? "text-white" : "text-[#0F0F0F]"
              }`}
              aria-label="Account"
            >
              <UserIcon className="w-[18px] h-[18px]" strokeWidth={1.5} />
            </Link>

            {/* Cart */}
            <Link
              href="/cart"
              className={`relative transition-colors duration-200 hover:text-[#D4AF37] ${
                isTransparent ? "text-white" : "text-[#0F0F0F]"
              }`}
              aria-label="Cart"
            >
              <ShoppingBag className="w-[18px] h-[18px]" strokeWidth={1.5} />
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#D4AF37] text-white text-[9px] font-bold w-[16px] h-[16px] rounded-full flex items-center justify-center leading-none">
                  {cartItemCount}
                </span>
              )}
            </Link>

            {/* Hamburger — mobile only */}
            <button
              className={`lg:hidden ml-1 transition-colors hover:text-[#D4AF37] ${
                isTransparent ? "text-white" : "text-[#0F0F0F]"
              }`}
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Menu"
            >
              <Menu className="w-5 h-5" strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </nav>

      {/* Search overlay */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-sm flex items-start justify-center pt-24 px-6"
            onClick={() => setIsSearchOpen(false)}
          >
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl bg-white shadow-2xl"
            >
              <div className="flex items-center border-b border-[#D4AF37]/30 px-6 py-4">
                <Search className="w-5 h-5 text-[#D4AF37] mr-4 flex-shrink-0" strokeWidth={1.5} />
                <input
                  autoFocus
                  type="text"
                  placeholder="Search for rings, necklaces, bracelets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && searchQuery.trim()) {
                      window.location.href = `/shop?q=${encodeURIComponent(searchQuery.trim())}`;
                    }
                    if (e.key === "Escape") setIsSearchOpen(false);
                  }}
                  className="flex-1 outline-none text-lg text-[#0F0F0F] placeholder:text-[#0F0F0F]/40 font-sans bg-transparent"
                />
                <button onClick={() => setIsSearchOpen(false)} className="ml-4 text-[#0F0F0F]/50 hover:text-[#0F0F0F]">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="px-6 py-4">
                <p className="text-[10px] tracking-widest uppercase text-[#0F0F0F]/40 mb-3">Popular Searches</p>
                <div className="flex flex-wrap gap-2">
                  {["Diamond Ring", "Gold Necklace", "Pearl Bracelet", "Emerald Pendant"].map(term => (
                    <button
                      key={term}
                      onClick={() => { window.location.href = `/shop?q=${encodeURIComponent(term)}`; }}
                      className="text-xs px-3 py-1.5 border border-[#D4AF37]/30 text-[#0F0F0F]/70 hover:border-[#D4AF37] hover:text-[#D4AF37] transition-colors tracking-wide"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            className="fixed inset-0 z-[100] bg-white flex flex-col"
          >
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#D4AF37]/20">
              <div className="flex flex-col leading-none">
                <span className="font-serif text-2xl tracking-[0.3em] text-[#0F0F0F] font-bold">PEARLIS</span>
                <span className="text-[8px] tracking-[0.4em] uppercase text-[#D4AF37]">Fine Jewellery</span>
              </div>
              <button onClick={() => setIsMobileMenuOpen(false)} className="text-[#0F0F0F]/60 hover:text-[#0F0F0F]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-6 px-6 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-between py-3.5 border-b border-[#0F0F0F]/5 text-sm tracking-[0.15em] uppercase text-[#0F0F0F]/80 hover:text-[#D4AF37] font-medium transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="px-6 py-6 border-t border-[#D4AF37]/20 space-y-3">
              <Link
                href={user ? (user.role === "admin" ? "/admin" : "/orders") : "/login"}
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 w-full bg-[#0F0F0F] text-white py-3.5 px-5 text-sm tracking-widest uppercase font-medium justify-center hover:bg-[#D4AF37] transition-colors"
              >
                <UserIcon className="w-4 h-4" />
                {user ? "My Account" : "Sign In"}
              </Link>
              <Link
                href="/cart"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 w-full border border-[#0F0F0F]/20 text-[#0F0F0F] py-3.5 px-5 text-sm tracking-widest uppercase font-medium justify-center hover:border-[#D4AF37] hover:text-[#D4AF37] transition-colors"
              >
                <ShoppingBag className="w-4 h-4" />
                Cart {cartItemCount > 0 && `(${cartItemCount})`}
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
