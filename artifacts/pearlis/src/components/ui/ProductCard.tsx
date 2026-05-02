import { Link } from "wouter";
import { Product } from "@workspace/api-client-react";
import { motion } from "framer-motion";
import { Heart, ShoppingBag } from "lucide-react";

interface ProductCardProps {
  product: Product;
  index?: number;
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const hasDiscount = product.discountPrice && product.discountPrice < product.price;
  const discountPct = hasDiscount
    ? Math.round(((product.price - product.discountPrice!) / product.price) * 100)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay: index * 0.08 }}
      className="group relative flex flex-col"
    >
      {/* Image */}
      <div className="relative aspect-[3/4] overflow-hidden bg-[#F5F0E8] mb-4">
        {/* Badges */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
          {product.isNew && (
            <span className="bg-[#0F0F0F] text-white text-[9px] font-semibold px-2.5 py-1 tracking-[0.15em] uppercase">
              New
            </span>
          )}
          {hasDiscount && (
            <span className="bg-[#D4AF37] text-white text-[9px] font-semibold px-2.5 py-1 tracking-[0.15em] uppercase">
              -{discountPct}%
            </span>
          )}
        </div>

        {/* Wishlist */}
        <button className="absolute top-3 right-3 z-10 w-8 h-8 bg-white shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-[#D4AF37] hover:text-white text-[#0F0F0F]">
          <Heart className="w-3.5 h-3.5" strokeWidth={1.5} />
        </button>

        {/* Product image(s) */}
        <Link href={`/product/${product.id}`}>
          <div className="w-full h-full cursor-pointer relative">
            <img
              src={product.images?.[0] || `https://images.unsplash.com/photo-1599643478524-fb66f70d00f7?auto=format&fit=crop&q=80&w=600`}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-107"
            />
            {product.images?.[1] && (
              <img
                src={product.images[1]}
                alt={`${product.name} — alternate view`}
                className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
              />
            )}
          </div>
        </Link>

        {/* Quick add */}
        <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-350">
          <button className="w-full bg-[#0F0F0F] hover:bg-[#D4AF37] text-white py-3 text-[10px] font-semibold tracking-[0.2em] uppercase flex items-center justify-center gap-2 transition-colors duration-300">
            <ShoppingBag className="w-3.5 h-3.5" />
            Quick Add
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-col text-center px-1">
        <p className="text-[9px] tracking-[0.2em] uppercase text-[#D4AF37] font-medium mb-1.5">
          {product.material || (product as any).categoryName || "Fine Jewellery"}
        </p>
        <Link href={`/product/${product.id}`}>
          <h3 className="font-serif text-base text-[#0F0F0F] hover:text-[#D4AF37] transition-colors cursor-pointer leading-snug mb-2">
            {product.name}
          </h3>
        </Link>
        <div className="flex justify-center items-center gap-2">
          {hasDiscount ? (
            <>
              <span className="text-[#0F0F0F]/40 line-through text-sm">₹{product.price.toLocaleString("en-IN")}</span>
              <span className="text-[#0F0F0F] font-semibold">₹{product.discountPrice!.toLocaleString("en-IN")}</span>
            </>
          ) : (
            <span className="text-[#0F0F0F] font-semibold">₹{product.price.toLocaleString("en-IN")}</span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
