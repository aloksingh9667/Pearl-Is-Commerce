import { useRoute, Link } from "wouter";
import { useGetOrder } from "@workspace/api-client-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";

export default function OrderDetail() {
  const [, params] = useRoute("/order/:id");
  const orderId = parseInt(params?.id || "0");

  const { data: order, isLoading } = useGetOrder(orderId, {
    query: { enabled: !!orderId }
  });

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  if (!order) return <div className="min-h-screen flex items-center justify-center">Order not found</div>;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <div className="pt-32 pb-24 container mx-auto px-6 max-w-4xl flex-1">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="font-serif text-3xl mb-2">Order #{order.id.toString().padStart(6, '0')}</h1>
            <p className="text-muted-foreground text-sm uppercase tracking-widest">
              Placed on {format(new Date(order.createdAt), "MMMM d, yyyy")}
            </p>
          </div>
          <div className="px-4 py-2 bg-accent text-accent-foreground text-sm font-medium tracking-widest uppercase">
            {order.status}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="md:col-span-2 space-y-8">
            <h2 className="font-serif text-xl border-b border-border pb-4">Items</h2>
            {order.items.map((item, i) => (
              <div key={i} className="flex gap-6 items-center">
                <img src={item.productImage} alt={item.productName} className="w-24 aspect-[3/4] object-cover bg-muted" />
                <div className="flex-1">
                  <Link href={`/product/${item.productId}`}>
                    <h3 className="font-serif hover:text-accent transition-colors">{item.productName}</h3>
                  </Link>
                  <p className="text-sm text-muted-foreground mt-1">Qty: {item.quantity}</p>
                </div>
                <div className="font-medium">${(item.price * item.quantity).toFixed(2)}</div>
              </div>
            ))}
          </div>
          
          <div className="space-y-12">
            <div>
              <h2 className="font-serif text-xl border-b border-border pb-4 mb-6">Summary</h2>
              <div className="space-y-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${order.subtotal?.toFixed(2) || order.total.toFixed(2)}</span>
                </div>
                {order.discount && order.discount > 0 && (
                  <div className="flex justify-between text-accent">
                    <span>Discount</span>
                    <span>-${order.discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-muted-foreground">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                <div className="border-t border-border pt-4 flex justify-between font-medium text-lg">
                  <span>Total</span>
                  <span>${order.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {order.shippingAddress && (
              <div>
                <h2 className="font-serif text-xl border-b border-border pb-4 mb-6">Shipping Details</h2>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p className="font-medium text-foreground">{order.shippingAddress.name}</p>
                  <p>{order.shippingAddress.line1}</p>
                  {order.shippingAddress.line2 && <p>{order.shippingAddress.line2}</p>}
                  <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}</p>
                  <p>{order.shippingAddress.country}</p>
                </div>
              </div>
            )}
            
            <Link href="/orders">
              <Button variant="outline" className="w-full rounded-none tracking-widest uppercase">Back to Orders</Button>
            </Link>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
