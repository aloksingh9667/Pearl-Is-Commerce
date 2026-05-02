import { useRoute } from "wouter";
import { useGetProduct, useGetRelatedProducts, useAddToCart, getGetProductQueryKey } from "@workspace/api-client-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/ui/ProductCard";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export default function ProductDetail() {
  const [, params] = useRoute("/product/:id");
  const productId = parseInt(params?.id || "0");
  const { toast } = useToast();
  
  const { data: product, isLoading } = useGetProduct(productId, {
    query: { enabled: !!productId }
  });
  
  const { data: relatedProducts } = useGetRelatedProducts(productId, {
    query: { enabled: !!productId }
  });

  const addToCart = useAddToCart();
  const [selectedImage, setSelectedImage] = useState(0);

  const handleAddToCart = () => {
    if (!product) return;
    addToCart.mutate({ data: { productId: product.id, quantity: 1 } }, {
      onSuccess: () => {
        toast({
          title: "Added to Cart",
          description: `${product.name} has been added to your shopping bag.`,
        });
      }
    });
  };

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-accent" />
    </div>
  );

  if (!product) return <div>Product not found</div>;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <div className="pt-32 pb-24 container mx-auto px-6">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-24">
          <div className="lg:w-1/2 flex flex-col gap-4">
            <div className="aspect-[4/5] bg-muted relative overflow-hidden">
              <img 
                src={product.images[selectedImage]} 
                alt={product.name}
                className="w-full h-full object-cover object-center"
              />
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {product.images.map((img, i) => (
                <button 
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`w-24 aspect-[4/5] flex-shrink-0 border-2 transition-colors ${selectedImage === i ? 'border-accent' : 'border-transparent'}`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
          
          <div className="lg:w-1/2 flex flex-col pt-8">
            <div className="text-sm tracking-widest uppercase text-muted-foreground mb-4">
              {product.category}
            </div>
            <h1 className="font-serif text-4xl lg:text-5xl mb-6">{product.name}</h1>
            <div className="text-2xl mb-8">
              {product.discountPrice ? (
                <div className="flex items-center gap-4">
                  <span className="text-muted-foreground line-through">${product.price.toFixed(2)}</span>
                  <span className="text-foreground">${product.discountPrice.toFixed(2)}</span>
                </div>
              ) : (
                <span>${product.price.toFixed(2)}</span>
              )}
            </div>
            
            <div className="prose prose-sm max-w-none text-muted-foreground mb-12">
              <p>{product.description}</p>
            </div>

            <Button 
              size="lg" 
              className="rounded-none bg-primary hover:bg-primary/90 text-primary-foreground tracking-widest uppercase w-full sm:w-auto h-14"
              onClick={handleAddToCart}
              disabled={addToCart.isPending}
            >
              {addToCart.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Add to Bag"}
            </Button>
            
            <div className="mt-12 pt-12 border-t border-border">
              <div className="grid grid-cols-2 gap-8 text-sm">
                <div>
                  <span className="block text-muted-foreground uppercase tracking-widest mb-1">Material</span>
                  <span className="font-medium">{product.material || "Precious Metal"}</span>
                </div>
                <div>
                  <span className="block text-muted-foreground uppercase tracking-widest mb-1">Availability</span>
                  <span className="font-medium">{product.stock > 0 ? "In Stock" : "Made to Order"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {relatedProducts && relatedProducts.length > 0 && (
          <div className="mt-32 pt-24 border-t border-border">
            <div className="text-center mb-12">
              <h2 className="font-serif text-3xl mb-4">You May Also Like</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {relatedProducts.slice(0, 4).map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
}
