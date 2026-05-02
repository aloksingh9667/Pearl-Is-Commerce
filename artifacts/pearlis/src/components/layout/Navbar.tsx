import { Link, useLocation } from "wouter";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ShoppingBag, User as UserIcon, Menu, X, Heart } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useGetCart } from "@workspace/api-client-react";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  { label: "Rings", href: "/category/rings" },
  { label: "Necklaces", href: "/category/necklaces" },
  { label: "Bracelets", href: "/category/bracelets" },
  { label: "Earrings", href: "/category/earrings" },
  { label: "Gallery", href: "/gallery" },
  { label: "Blog", href: "/blog" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
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
    const handleScroll = () => setIsScrolled(window.scrollY > 80);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isHome = location === "/";
  // Transparent (white text) only on homepage before scroll
  const isTransparent = isHome && !isScrolled;

  return (
    <>
      {/* ── Announcement bar – always at very top ── */}
      <div className="fixed top-0 left-0 right-0 z-[60] bg-[#D4AF37] text-white text-center text-[10px] tracking-[0.22em] uppercase py-[7px] font-semibold">
        Free Shipping Above ₹5,000&nbsp;&nbsp;|&nbsp;&nbsp;Code&nbsp;<span className="font-bold underline underline-offset-2">PEARLIS10</span>&nbsp;for 10% Off
      </div>

      {/* ── Main navbar ── */}
      <nav
        className={`fixed left-0 right-0 z-50 transition-all duration-500 ease-in-out`}
        style={{ top: "32px" }}
      >
        {/* Background layer */}
        <div
          className={`absolute inset-0 transition-all duration-500 ${
            isTransparent
              ? "bg-transparent"
              : "bg-white/95 backdrop-blur-md border-b border-[#D4AF37]/25 shadow-[0_2px_20px_rgba(0,0,0,0.06)]"
          }`}
        />

        <div className="relative max-w-[1440px] mx-auto px-4 md:px-8 flex items-center justify-between h-[68px]">

          {/* ── LEFT: Logo ── */}
          <Link href="/" className="flex-shrink-0 group">
            <div className="flex flex-col leading-none select-none">
              <span
                className={`font-serif text-[1.6rem] tracking-[0.38em] font-bold transition-colors duration-400 ${
                  isTransparent ? "text-white" : "text-[#0F0F0F]"
                }`}
              >
                PEARLIS
              </span>
              <span className="text-[7.5px] tracking-[0.45em] uppercase text-[#D4AF37] mt-[2px] font-medium">
                Fine Jewellery
              </span>
            </div>
          </Link>

          {/* ── CENTRE: Nav links (desktop) ── */}
          <div className="hidden xl:flex items-center gap-6">
            {navLinks.map((link) => {
              const active = location === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative text-[10.5px] font-semibold tracking-[0.18em] uppercase transition-colors duration-250 group ${
                    isTransparent
                      ? active
                        ? "text-[#D4AF37]"
                        : "text-white hover:text-[#D4AF37]"
                      : active
                        ? "text-[#D4AF37]"
                        : "text-[#0F0F0F] hover:text-[#D4AF37]"
                  }`}
                >
                  {link.label}
                  <span
                    className={`absolute -bottom-0.5 left-0 h-[1.5px] bg-[#D4AF37] transition-all duration-300 ${
                      active ? "w-full" : "w-0 group-hover:w-full"
                    }`}
                  />
                </Link>
              );
            })}
          </div>

          {/* ── RIGHT: Icons ── */}
          <div className="flex items-center gap-[18px]">
            {/* Search */}
            <button
              onClick={() => setIsSearchOpen(true)}
              aria-label="Search"
              className={`transition-colors duration-250 ${
                isTransparent ? "text-white hover:text-[#D4AF37]" : "text-[#0F0F0F] hover:text-[#D4AF37]"
              }`}
            >
              <Search className="w-[17px] h-[17px]" strokeWidth={1.6} />
            </button>

            {/* Wishlist */}
            <Link
              href="/wishlist"
              aria-label="Wishlist"
              className={`hidden sm:block transition-colors duration-250 ${
                isTransparent ? "text-white hover:text-[#D4AF37]" : "text-[#0F0F0F] hover:text-[#D4AF37]"
              }`}
            >
              <Heart className="w-[17px] h-[17px]" strokeWidth={1.6} />
            </Link>

            {/* Account */}
            <Link
              href={user ? (user.role === "admin" ? "/admin" : "/orders") : "/login"}
              aria-label="Account"
              className={`transition-colors duration-250 ${
                isTransparent ? "text-white hover:text-[#D4AF37]" : "text-[#0F0F0F] hover:text-[#D4AF37]"
              }`}
            >
              <UserIcon className="w-[17px] h-[17px]" strokeWidth={1.6} />
            </Link>

            {/* Cart */}
            <Link
              href="/cart"
              aria-label="Cart"
              className={`relative transition-colors duration-250 ${
                isTransparent ? "text-white hover:text-[#D4AF37]" : "text-[#0F0F0F] hover:text-[#D4AF37]"
              }`}
            >
              <ShoppingBag className="w-[17px] h-[17px]" strokeWidth={1.6} />
              {cartItemCount > 0 && (
                <span className="absolute -top-[7px] -right-[7px] bg-[#D4AF37] text-white text-[8px] font-bold w-[15px] h-[15px] rounded-full flex items-center justify-center leading-none">
                  {cartItemCount}
                </span>
              )}
            </Link>

            {/* Hamburger – mobile & tablet */}
            <button
              className={`xl:hidden ml-1 transition-colors ${
                isTransparent ? "text-white hover:text-[#D4AF37]" : "text-[#0F0F0F] hover:text-[#D4AF37]"
              }`}
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="w-[20px] h-[20px]" strokeWidth={1.6} />
            </button>
          </div>
        </div>
      </nav>

      {/* Spacer for non-home pages (home hero sits behind fixed nav) */}
      {!isHome && <div style={{ height: "100px" }} />}

      {/* ── Search overlay ── */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[200] bg-black/75 backdrop-blur-sm flex items-start justify-center pt-28 px-4"
            onClick={() => setIsSearchOpen(false)}
          >
            <motion.div
              initial={{ y: -16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -16, opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl bg-white shadow-2xl"
            >
              <div className="flex items-center border-b border-[#D4AF37]/30 px-5 py-4">
                <Search className="w-5 h-5 text-[#D4AF37] mr-4 flex-shrink-0" strokeWidth={1.5} />
                <input
                  autoFocus
                  type="text"
                  placeholder="Search rings, necklaces, pendants..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && searchQuery.trim()) {
                      window.location.href = `/shop?q=${encodeURIComponent(searchQuery.trim())}`;
                    }
                    if (e.key === "Escape") setIsSearchOpen(false);
                  }}
                  className="flex-1 outline-none text-base text-[#0F0F0F] placeholder:text-[#0F0F0F]/35 bg-transparent"
                />
                <button onClick={() => setIsSearchOpen(false)} className="ml-3 text-[#0F0F0F]/40 hover:text-[#0F0F0F] transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="px-5 py-4">
                <p className="text-[9px] tracking-[0.25em] uppercase text-[#0F0F0F]/35 mb-3">Popular Searches</p>
                <div className="flex flex-wrap gap-2">
                  {["Diamond Ring", "Gold Necklace", "Pearl Bracelet", "Emerald Pendant", "Gold Earrings"].map(term => (
                    <button
                      key={term}
                      onClick={() => { window.location.href = `/shop?q=${encodeURIComponent(term)}`; }}
                      className="text-[11px] px-3 py-1.5 border border-[#D4AF37]/25 text-[#0F0F0F]/65 hover:border-[#D4AF37] hover:text-[#D4AF37] transition-colors tracking-wide"
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

      {/* ── Mobile drawer ── */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[90] bg-black/50"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              className="fixed top-0 right-0 bottom-0 z-[100] w-[320px] bg-white flex flex-col shadow-2xl"
            >
              {/* Drawer header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-[#D4AF37]/20">
                <div>
                  <p className="font-serif text-xl tracking-[0.3em] font-bold text-[#0F0F0F]">PEARLIS</p>
                  <p className="text-[7.5px] tracking-[0.4em] uppercase text-[#D4AF37]">Fine Jewellery</p>
                </div>
                <button onClick={() => setIsMobileMenuOpen(false)} className="text-[#0F0F0F]/50 hover:text-[#0F0F0F]">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer links */}
              <div className="flex-1 overflow-y-auto py-4 px-6 space-y-0.5">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center py-3.5 border-b border-[#0F0F0F]/6 text-[11px] tracking-[0.18em] uppercase font-semibold transition-colors ${
                      location === link.href ? "text-[#D4AF37]" : "text-[#0F0F0F]/75 hover:text-[#D4AF37]"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              {/* Drawer footer actions */}
              <div className="px-6 py-6 border-t border-[#D4AF37]/15 space-y-3">
                <Link
                  href={user ? (user.role === "admin" ? "/admin" : "/orders") : "/login"}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 w-full bg-[#0F0F0F] text-white py-3.5 px-5 text-[10px] tracking-[0.2em] uppercase font-bold justify-center hover:bg-[#D4AF37] transition-colors duration-300"
                >
                  <UserIcon className="w-4 h-4" />
                  {user ? "My Account" : "Sign In"}
                </Link>
                <Link
                  href="/cart"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 w-full border border-[#0F0F0F]/20 text-[#0F0F0F] py-3.5 px-5 text-[10px] tracking-[0.2em] uppercase font-semibold justify-center hover:border-[#D4AF37] hover:text-[#D4AF37] transition-colors"
                >
                  <ShoppingBag className="w-4 h-4" />
                  Cart {cartItemCount > 0 && `(${cartItemCount})`}
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
