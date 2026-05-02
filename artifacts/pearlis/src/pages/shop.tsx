import { useState } from "react";
import { useListProducts, useListCategories, getListProductsQueryKey } from "@workspace/api-client-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ProductCard } from "@/components/ui/ProductCard";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";

export default function Shop() {
  const [category, setCategory] = useState<string>("");
  const [sort, setSort] = useState<string>("latest");
  
  const { data: categories } = useListCategories();
  const { data: productsData, isLoading } = useListProducts({
    category: category || undefined,
    sort: sort as any,
  });

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <div className="pt-32 pb-24 container mx-auto px-6">
        <div className="text-center mb-16">
          <h1 className="font-serif text-4xl mb-4">The Collection</h1>
          <div className="w-16 h-px bg-accent mx-auto mb-6"></div>
          <p className="text-muted-foreground">Explore our exceptional range of fine jewelry.</p>
        </div>

        <div className="flex flex-col md:flex-row gap-8 mb-12 items-center justify-between border-y border-border py-4">
          <div className="flex flex-wrap gap-4 items-center w-full md:w-auto">
            <span className="text-sm font-medium tracking-widest uppercase">Filter:</span>
            <div className="flex flex-wrap gap-2">
              <Button 
                variant={category === "" ? "default" : "outline"} 
                size="sm" 
                onClick={() => setCategory("")}
                className="rounded-none tracking-widest uppercase text-xs"
              >
                All
              </Button>
              {categories?.categories?.map(c => (
                <Button 
                  key={c.id} 
                  variant={category === c.slug ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setCategory(c.slug)}
                  className="rounded-none tracking-widest uppercase text-xs"
                >
                  {c.name}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto mt-4 md:mt-0">
            <span className="text-sm font-medium tracking-widest uppercase">Sort:</span>
            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger className="w-[180px] rounded-none border-border">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent className="rounded-none">
                <SelectItem value="latest">Latest Arrivals</SelectItem>
                <SelectItem value="price_asc">Price: Low to High</SelectItem>
                <SelectItem value="price_desc">Price: High to Low</SelectItem>
                <SelectItem value="trending">Trending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="aspect-square sm:aspect-[3/4] bg-muted animate-pulse"></div>
            ))}
          </div>
        ) : productsData?.products?.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-xl font-serif">No pieces found in this collection.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8 gap-y-8 sm:gap-y-16">
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
