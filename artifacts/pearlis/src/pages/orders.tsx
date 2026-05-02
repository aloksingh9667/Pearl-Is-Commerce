import { useListOrders } from "@workspace/api-client-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import { BackButton } from "@/components/ui/BackButton";

export default function Orders() {
  const { user } = useAuth();
  const { data, isLoading } = useListOrders({ limit: 50 });

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <div className="pt-32 pb-24 container mx-auto px-6 max-w-5xl flex-1">
        <BackButton className="mb-8" />
        <div className="flex justify-between items-end mb-12">
          <div>
            <h1 className="font-serif text-4xl mb-4">My Account</h1>
            <p className="text-muted-foreground">Welcome back, {user?.name}</p>
          </div>
          <Button variant="outline" className="rounded-none tracking-widest uppercase" onClick={() => {
            localStorage.removeItem("token");
            window.location.href = "/";
          }}>
            Sign Out
          </Button>
        </div>

        <div className="flex gap-8 mb-12 border-b border-border">
          <div className="pb-4 border-b-2 border-accent font-medium tracking-widest uppercase text-sm">
            Order History
          </div>
          <Link href="/wishlist" className="pb-4 border-b-2 border-transparent text-muted-foreground hover:text-foreground transition-colors font-medium tracking-widest uppercase text-sm">
            Wishlist
          </Link>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-accent" /></div>
        ) : !data || data.orders.length === 0 ? (
          <div className="text-center py-16 bg-muted/30 border border-border">
            <p className="text-muted-foreground mb-6">You haven't placed any orders yet.</p>
            <Link href="/shop">
              <Button className="rounded-none uppercase tracking-widest">Start Shopping</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {data.orders.map(order => (
              <div key={order.id} className="border border-border p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                  <div className="text-sm text-muted-foreground uppercase tracking-widest mb-2">
                    Order #{order.id.toString().padStart(6, '0')}
                  </div>
                  <div className="text-sm mb-4">
                    {format(new Date(order.createdAt), "MMMM d, yyyy")}
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-medium">${order.total.toFixed(2)}</span>
                    <span className="text-sm px-3 py-1 bg-accent/10 text-accent font-medium uppercase tracking-widest rounded-none">
                      {order.status}
                    </span>
                  </div>
                </div>
                
                <div className="flex -space-x-4">
                  {order.items.slice(0, 3).map((item, i) => (
                    <div key={i} className="w-16 h-16 rounded-full border-2 border-background overflow-hidden bg-muted">
                      <img src={item.productImage} alt={item.productName} className="w-full h-full object-cover" />
                    </div>
                  ))}
                  {order.items.length > 3 && (
                    <div className="w-16 h-16 rounded-full border-2 border-background bg-muted flex items-center justify-center text-sm font-medium z-10">
                      +{order.items.length - 3}
                    </div>
                  )}
                </div>
                
                <Link href={`/order/${order.id}`}>
                  <Button variant="outline" className="rounded-none uppercase tracking-widest w-full md:w-auto">
                    View Details
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
}
