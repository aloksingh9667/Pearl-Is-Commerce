import { useGetWishlist } from "@workspace/api-client-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ProductCard } from "@/components/ui/ProductCard";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

export default function Wishlist() {
  const { user } = useAuth();
  const { data: wishlist, isLoading } = useGetWishlist({
    query: { enabled: !!user }
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center pt-32 pb-24">
          <div className="text-center max-w-md px-6">
            <h1 className="font-serif text-3xl mb-6">Sign in required</h1>
            <p className="text-muted-foreground mb-8">Please sign in to view your wishlist.</p>
            <Link href="/login?redirect=/wishlist">
              <Button className="rounded-none tracking-widest uppercase w-full">Sign In</Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <div className="pt-32 pb-24 container mx-auto px-6 max-w-6xl flex-1">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h1 className="font-serif text-4xl mb-4">My Account</h1>
            <p className="text-muted-foreground">Welcome back, {user?.name}</p>
          </div>
        </div>

        <div className="flex gap-8 mb-12 border-b border-border">
          <Link href="/orders" className="pb-4 border-b-2 border-transparent text-muted-foreground hover:text-foreground transition-colors font-medium tracking-widest uppercase text-sm">
            Order History
          </Link>
          <div className="pb-4 border-b-2 border-accent font-medium tracking-widest uppercase text-sm">
            Wishlist
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-accent" /></div>
        ) : !wishlist || wishlist.length === 0 ? (
          <div className="text-center py-16 bg-muted/30 border border-border">
            <p className="text-muted-foreground mb-6">Your wishlist is empty.</p>
            <Link href="/shop">
              <Button className="rounded-none uppercase tracking-widest">Discover Jewelry</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {wishlist.map((item, index) => (
              // @ts-ignore - The API returns a Product but we might need to adapt it
              <ProductCard key={item.id || index} product={item.product || item} index={index} />
            ))}
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
}
