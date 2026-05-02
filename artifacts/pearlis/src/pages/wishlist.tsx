import { useGetWishlist } from "@workspace/api-client-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ProductCard } from "@/components/ui/ProductCard";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, Heart } from "lucide-react";
import { BackButton } from "@/components/ui/BackButton";

export default function Wishlist() {
  const { user } = useAuth();
  const { data: wishlist, isLoading } = useGetWishlist();

  return (
    <div className="min-h-screen bg-[#FAF8F3] flex flex-col">
      <Navbar />

      <div className="pt-32 pb-24 max-w-[1440px] mx-auto px-4 md:px-8 w-full flex-1">
        <BackButton className="mb-3" />

        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-[10px] tracking-[0.35em] uppercase text-[#D4AF37] font-bold mb-2">My Account</p>
            <h1 className="font-serif text-4xl text-[#0F0F0F]">
              {user ? `Welcome, ${user.name?.split(" ")[0]}` : "My Wishlist"}
            </h1>
          </div>
          {wishlist && wishlist.length > 0 && (
            <span className="text-sm text-[#0F0F0F]/45 tracking-wide">{wishlist.length} saved {wishlist.length === 1 ? "piece" : "pieces"}</span>
          )}
        </div>

        {user && (
          <div className="flex gap-8 mb-12 border-b border-[#D4AF37]/20">
            <Link href="/orders" className="pb-4 border-b-2 border-transparent text-[#0F0F0F]/45 hover:text-[#0F0F0F] transition-colors font-medium tracking-[0.18em] uppercase text-[11px]">
              Order History
            </Link>
            <div className="pb-4 border-b-2 border-[#D4AF37] text-[#0F0F0F] font-medium tracking-[0.18em] uppercase text-[11px]">
              Wishlist
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-[#D4AF37]" />
          </div>
        ) : !wishlist || wishlist.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-full bg-[#D4AF37]/10 flex items-center justify-center mb-6">
              <Heart className="w-7 h-7 text-[#D4AF37]" strokeWidth={1.5} />
            </div>
            <h2 className="font-serif text-2xl text-[#0F0F0F] mb-3">Your wishlist is empty</h2>
            <p className="text-[#0F0F0F]/45 text-sm mb-8 max-w-xs">
              Browse our collection and tap the heart icon on any product to save it here.
            </p>
            <Link href="/shop">
              <Button className="rounded-none uppercase tracking-[0.2em] text-[11px] px-10 py-3 h-auto bg-[#D4AF37] hover:bg-[#c9a430]">
                Discover Jewellery
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-3 md:gap-x-6 gap-y-8 md:gap-y-14">
            {wishlist.map((item: any, index: number) => (
              <ProductCard key={item.id} product={item} index={index % 4} />
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
