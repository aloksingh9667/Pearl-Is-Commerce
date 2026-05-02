import { useGetCart, useRemoveFromCart, useUpdateCartItem, useGetMe } from "@workspace/api-client-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { getGetCartQueryKey } from "@workspace/api-client-react";

export default function Cart() {
  const [, setLocation] = useLocation();
  const { data: cart, isLoading } = useGetCart();
  const { data: user } = useGetMe();
  const queryClient = useQueryClient();
  
  const updateItem = useUpdateCartItem();
  const removeItem = useRemoveFromCart();

  const handleUpdateQty = (productId: number, quantity: number) => {
    if (quantity < 1) return;
    updateItem.mutate(
      { id: productId, data: { quantity } },
      { onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() }) }
    );
  };

  const handleRemove = (productId: number) => {
    removeItem.mutate(
      { id: productId },
      { onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() }) }
    );
  };

  const handleCheckout = () => {
    if (!user) {
      setLocation("/login?redirect=/checkout");
    } else {
      setLocation("/checkout");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <div className="pt-32 pb-24 container mx-auto px-6 max-w-5xl flex-1">
        <h1 className="font-serif text-4xl mb-12">Your Shopping Bag</h1>
        
        {isLoading ? (
          <div className="animate-pulse space-y-8">
            <div className="h-24 bg-muted w-full"></div>
            <div className="h-24 bg-muted w-full"></div>
          </div>
        ) : !cart || cart.items.length === 0 ? (
          <div className="text-center py-16 bg-muted/30 border border-border">
            <p className="text-muted-foreground mb-6">Your shopping bag is empty.</p>
            <Link href="/shop">
              <Button className="rounded-none uppercase tracking-widest">Continue Shopping</Button>
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-12">
            <div className="lg:w-2/3 flex flex-col gap-8">
              <div className="hidden sm:grid grid-cols-12 gap-4 pb-4 border-b border-border text-sm tracking-widest uppercase text-muted-foreground">
                <div className="col-span-6">Item</div>
                <div className="col-span-3 text-center">Quantity</div>
                <div className="col-span-3 text-right">Total</div>
              </div>
              
              {cart.items.map((item) => (
                <div key={item.productId} className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center pb-8 border-b border-border">
                  <div className="col-span-1 sm:col-span-6 flex gap-4 items-center">
                    <img src={item.product.images[0]} alt={item.product.name} className="w-20 aspect-[3/4] object-cover bg-muted" />
                    <div>
                      <Link href={`/product/${item.productId}`}>
                        <h3 className="font-serif text-lg hover:text-accent transition-colors">{item.product.name}</h3>
                      </Link>
                      <p className="text-sm text-muted-foreground mt-1">${(item.product.discountPrice || item.product.price).toFixed(2)}</p>
                    </div>
                  </div>
                  
                  <div className="col-span-1 sm:col-span-3 flex justify-between sm:justify-center items-center">
                    <span className="sm:hidden text-sm text-muted-foreground uppercase">Qty:</span>
                    <div className="flex items-center border border-border">
                      <button 
                        className="p-2 hover:bg-muted transition-colors"
                        onClick={() => handleUpdateQty(item.productId, item.quantity - 1)}
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-8 text-center text-sm">{item.quantity}</span>
                      <button 
                        className="p-2 hover:bg-muted transition-colors"
                        onClick={() => handleUpdateQty(item.productId, item.quantity + 1)}
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="col-span-1 sm:col-span-3 flex justify-between sm:justify-end items-center">
                    <span className="sm:hidden text-sm text-muted-foreground uppercase">Total:</span>
                    <div className="flex items-center gap-4">
                      <span className="font-medium">${((item.product.discountPrice || item.product.price) * item.quantity).toFixed(2)}</span>
                      <button 
                        className="text-muted-foreground hover:text-destructive transition-colors"
                        onClick={() => handleRemove(item.productId)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="lg:w-1/3">
              <div className="bg-muted/30 border border-border p-8">
                <h2 className="font-serif text-2xl mb-6">Order Summary</h2>
                <div className="space-y-4 text-sm mb-8">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>${cart.subtotal.toFixed(2)}</span>
                  </div>
                  {cart.discount && cart.discount > 0 && (
                    <div className="flex justify-between text-accent">
                      <span>Discount</span>
                      <span>-${cart.discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-muted-foreground">
                    <span>Shipping</span>
                    <span>Calculated at checkout</span>
                  </div>
                  <div className="border-t border-border pt-4 flex justify-between font-medium text-lg">
                    <span>Total</span>
                    <span>${cart.total.toFixed(2)}</span>
                  </div>
                </div>
                
                <Button 
                  className="w-full rounded-none tracking-widest uppercase h-12"
                  onClick={handleCheckout}
                >
                  Proceed to Checkout
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
}
