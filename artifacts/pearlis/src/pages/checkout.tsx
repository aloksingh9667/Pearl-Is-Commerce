import { useState } from "react";
import { useGetCart, useCreateOrder } from "@workspace/api-client-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export default function Checkout() {
  const { data: cart, isLoading } = useGetCart();
  const createOrder = useCreateOrder();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "United States",
    phone: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createOrder.mutate(
      { 
        data: { 
          shippingAddress: formData, 
          paymentMethod: "credit_card",
          couponCode: cart?.couponCode
        } 
      },
      {
        onSuccess: (order) => {
          toast({ title: "Order Placed", description: "Your order has been successfully placed." });
          setLocation(`/order/${order.id}`);
        },
        onError: () => {
          toast({ title: "Checkout Failed", description: "There was an error processing your order.", variant: "destructive" });
        }
      }
    );
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  if (!cart || cart.items.length === 0) {
    setLocation("/cart");
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <div className="pt-32 pb-24 container mx-auto px-6 max-w-6xl flex-1">
        <h1 className="font-serif text-4xl mb-12 text-center md:text-left">Checkout</h1>
        
        <div className="flex flex-col lg:flex-row gap-16">
          <div className="lg:w-3/5">
            <h2 className="font-serif text-2xl mb-8">Shipping Address</h2>
            <form id="checkout-form" onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="uppercase tracking-widest text-xs">Full Name</Label>
                <Input id="name" required value={formData.name} onChange={handleChange} className="rounded-none h-12" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="line1" className="uppercase tracking-widest text-xs">Address Line 1</Label>
                <Input id="line1" required value={formData.line1} onChange={handleChange} className="rounded-none h-12" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="line2" className="uppercase tracking-widest text-xs">Address Line 2 (Optional)</Label>
                <Input id="line2" value={formData.line2} onChange={handleChange} className="rounded-none h-12" />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="city" className="uppercase tracking-widest text-xs">City</Label>
                  <Input id="city" required value={formData.city} onChange={handleChange} className="rounded-none h-12" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state" className="uppercase tracking-widest text-xs">State / Province</Label>
                  <Input id="state" required value={formData.state} onChange={handleChange} className="rounded-none h-12" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="postalCode" className="uppercase tracking-widest text-xs">Postal Code</Label>
                  <Input id="postalCode" required value={formData.postalCode} onChange={handleChange} className="rounded-none h-12" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country" className="uppercase tracking-widest text-xs">Country</Label>
                  <Input id="country" required value={formData.country} onChange={handleChange} className="rounded-none h-12" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="uppercase tracking-widest text-xs">Phone Number</Label>
                <Input id="phone" type="tel" required value={formData.phone} onChange={handleChange} className="rounded-none h-12" />
              </div>

              <h2 className="font-serif text-2xl mb-8 mt-12">Payment Method</h2>
              <div className="p-6 border border-border bg-muted/20">
                <p className="text-sm text-muted-foreground mb-4">This is a demo. No actual payment will be processed.</p>
                <div className="flex items-center gap-4">
                  <input type="radio" id="cc" checked readOnly className="text-accent focus:ring-accent" />
                  <Label htmlFor="cc" className="text-base">Credit Card (Demo)</Label>
                </div>
              </div>
            </form>
          </div>
          
          <div className="lg:w-2/5">
            <div className="bg-muted/30 border border-border p-8 sticky top-32">
              <h2 className="font-serif text-2xl mb-8">Order Summary</h2>
              
              <div className="space-y-6 mb-8">
                {cart.items.map(item => (
                  <div key={item.productId} className="flex gap-4">
                    <div className="relative">
                      <img src={item.product.images[0]} alt={item.product.name} className="w-16 aspect-[3/4] object-cover bg-muted" />
                      <span className="absolute -top-2 -right-2 w-5 h-5 bg-accent text-accent-foreground rounded-full text-xs flex items-center justify-center font-bold">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1 flex flex-col justify-center">
                      <span className="font-serif text-sm">{item.product.name}</span>
                      <span className="text-sm text-muted-foreground">${(item.product.discountPrice || item.product.price).toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-border pt-6 space-y-4 text-sm mb-8">
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
                  <span>Free</span>
                </div>
                <div className="border-t border-border pt-4 flex justify-between font-medium text-lg">
                  <span>Total</span>
                  <span>${cart.total.toFixed(2)}</span>
                </div>
              </div>

              <Button 
                type="submit"
                form="checkout-form"
                className="w-full rounded-none tracking-widest uppercase h-14"
                disabled={createOrder.isPending}
              >
                {createOrder.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Place Order"}
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
