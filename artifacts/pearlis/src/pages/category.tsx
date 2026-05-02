import { useRoute, Link } from "wouter";
import { useListProducts, getListProductsQueryKey } from "@workspace/api-client-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ProductCard } from "@/components/ui/ProductCard";
import { Button } from "@/components/ui/button";

export default function Category() {
  const [, params] = useRoute("/category/:slug");
  const slug = params?.slug || "";
  
  const { data: productsData, isLoading } = useListProducts({
    category: slug,
  });

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <div className="pt-32 pb-24 container mx-auto px-6">
        <div className="text-center mb-16">
          <h1 className="font-serif text-4xl mb-4 capitalize">{slug.replace('-', ' ')}</h1>
          <div className="w-16 h-px bg-accent mx-auto mb-6"></div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="aspect-[3/4] bg-muted animate-pulse"></div>
            ))}
          </div>
        ) : productsData?.products?.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-xl font-serif mb-6">No pieces found in this category.</p>
            <Link href="/shop">
              <Button variant="outline" className="rounded-none tracking-widest uppercase">View All Collections</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 gap-y-16">
            {productsData?.products?.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index % 4} />
            ))}
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
}
