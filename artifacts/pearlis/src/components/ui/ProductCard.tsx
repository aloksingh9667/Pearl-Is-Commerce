import { Link } from "wouter";
import { Product } from "@workspace/api-client-react";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";

interface ProductCardProps {
  product: Product;
  index?: number;
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const isNew = product.isNew;
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group relative flex flex-col"
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-muted mb-4">
        {/* Wishlist Button */}
        <button className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white/80 backdrop-blur flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-foreground hover:text-accent">
          <Heart className="w-4 h-4" />
        </button>

        {/* Badges */}
        <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
          {isNew && (
            <span className="bg-background text-foreground text-[10px] font-medium px-2 py-1 tracking-wider uppercase">
              New
            </span>
          )}
          {product.discountPrice && (
            <span className="bg-accent text-accent-foreground text-[10px] font-medium px-2 py-1 tracking-wider uppercase">
              Sale
            </span>
          )}
        </div>

        <Link href={`/product/${product.id}`}>
          <div className="w-full h-full cursor-pointer">
            <img 
              src={product.images[0] || "https://placehold.co/400x600/e2e8f0/1e293b?text=Jewelry"} 
              alt={product.name}
              className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
            />
            {product.images[1] && (
              <img 
                src={product.images[1]} 
                alt={`${product.name} alternate view`}
                className="absolute inset-0 w-full h-full object-cover object-center opacity-0 transition-opacity duration-700 group-hover:opacity-100"
              />
            )}
          </div>
        </Link>
        
        {/* Quick Add */}
        <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <button className="w-full bg-primary text-primary-foreground py-3 text-sm font-medium tracking-wider uppercase hover:bg-primary/90 transition-colors">
            Quick Add
          </button>
        </div>
      </div>

      <div className="flex flex-col text-center">
        <Link href={`/product/${product.id}`}>
          <h3 className="font-serif text-lg mb-1 text-foreground hover:text-accent transition-colors cursor-pointer">
            {product.name}
          </h3>
        </Link>
        <p className="text-muted-foreground text-xs uppercase tracking-wider mb-2">
          {product.material || product.category}
        </p>
        <div className="flex justify-center items-center gap-3">
          {product.discountPrice ? (
            <>
              <span className="text-muted-foreground line-through text-sm">${product.price.toFixed(2)}</span>
              <span className="text-foreground font-medium">${product.discountPrice.toFixed(2)}</span>
            </>
          ) : (
            <span className="text-foreground font-medium">${product.price.toFixed(2)}</span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
