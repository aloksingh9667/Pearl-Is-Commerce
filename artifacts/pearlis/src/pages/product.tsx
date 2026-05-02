import { useRoute, Link } from "wouter";
import {
  useGetProduct,
  useGetRelatedProducts,
  useAddToCart,
  useGetProductReviews,
  useAddToWishlist,
  useRemoveFromWishlist,
  useGetWishlist,
} from "@workspace/api-client-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ProductCard } from "@/components/ui/ProductCard";
import { useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  Heart,
  Share2,
  ShieldCheck,
  Truck,
  RefreshCcw,
  Star,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  Award,
  Minus,
  Plus,
  Tag,
} from "lucide-react";

const INR = (n: number) =>
  "₹" + Math.round(n).toLocaleString("en-IN");

const DEFAULT_RING_SIZES = ["5", "6", "7", "8", "9", "10", "11", "12"];
const DEFAULT_MATERIALS = ["14K Yellow Gold", "18K Yellow Gold", "18K White Gold", "Platinum"];

const TABS = ["Description", "Specifications", "Reviews", "Shipping & Returns"] as const;
type Tab = (typeof TABS)[number];

export default function ProductDetail() {
  const [, params] = useRoute("/product/:id");
  const productId = parseInt(params?.id || "0");
  const { toast } = useToast();

  const [selectedImage, setSelectedImage] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedMaterial, setSelectedMaterial] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<Tab>("Description");
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);

  const { data: product, isLoading } = useGetProduct(productId, {
    query: { enabled: !!productId },
  });
  const { data: relatedProducts } = useGetRelatedProducts(productId, {
    query: { enabled: !!productId },
  });
  const { data: reviews } = useGetProductReviews(productId, {
    query: { enabled: !!productId },
  });
  const { data: wishlist } = useGetWishlist();
  const addToCart = useAddToCart();
  const addToWishlist = useAddToWishlist();
  const removeFromWishlist = useRemoveFromWishlist();

  const isWishlisted = wishlist?.some((w: { productId: number }) => w.productId === productId);
  const avgRating =
    reviews && reviews.length > 0
      ? reviews.reduce((s: number, r: { rating: number }) => s + r.rating, 0) / reviews.length
      : 0;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imgRef.current) return;
    const rect = imgRef.current.getBoundingClientRect();
    setZoomPos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  const handleAddToCart = () => {
    if (!product) return;
    addToCart.mutate(
      { data: { productId: product.id, quantity } },
      {
        onSuccess: () =>
          toast({ title: "Added to bag", description: `${product.name} × ${quantity} added to your shopping bag.` }),
      }
    );
  };

  const handleWishlist = () => {
    if (isWishlisted) {
      const item = wishlist?.find((w: { productId: number }) => w.productId === productId);
      if (item) removeFromWishlist.mutate({ wishlistId: item.id });
    } else {
      addToWishlist.mutate(
        { data: { productId } },
        { onSuccess: () => toast({ title: "Saved to wishlist", description: product?.name }) }
      );
    }
  };

  const scrollCarousel = (dir: "left" | "right") => {
    if (!carouselRef.current) return;
    carouselRef.current.scrollBy({ left: dir === "right" ? 280 : -280, behavior: "smooth" });
  };

  if (isLoading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF8F3]">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-[#D4AF37] mx-auto" />
          <p className="text-[10px] tracking-[0.3em] uppercase text-[#0F0F0F]/40">Loading</p>
        </div>
      </div>
    );

  if (!product)
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF8F3]">
        <div className="text-center">
          <p className="font-serif text-3xl text-[#0F0F0F] mb-4">Product not found</p>
          <Link href="/shop" className="text-[#D4AF37] text-[11px] tracking-[0.25em] uppercase font-semibold hover:underline">
            Back to Shop
          </Link>
        </div>
      </div>
    );

  const images = product.images?.length
    ? product.images
    : ["https://images.unsplash.com/photo-1573408301185-9519f94815b5?auto=format&fit=crop&q=85&w=900"];
  const price = product.price * 83;
  const discountPrice = product.discountPrice ? product.discountPrice * 83 : null;

  const productAny = product as any;
  const materialVariants: string[] = productAny.materialVariants?.length ? productAny.materialVariants : DEFAULT_MATERIALS;
  const sizes: string[] = productAny.sizes?.length ? productAny.sizes : (productAny.category?.toLowerCase().includes("ring") ? DEFAULT_RING_SIZES : []);
  const activeMaterial = selectedMaterial ?? materialVariants[0];

  return (
    <div className="min-h-screen bg-[#FAF8F3] flex flex-col">
      <Navbar />
      <div style={{ height: "100px" }} />

      {/* ── Breadcrumb ── */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-4">
        <nav className="flex items-center gap-2 text-[10px] tracking-[0.2em] uppercase text-[#0F0F0F]/40 flex-wrap">
          <Link href="/" className="hover:text-[#D4AF37] transition-colors">Home</Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-[#D4AF37] transition-colors">Shop</Link>
          <span>/</span>
          {product.category && (
            <>
              <Link href={`/category/${product.category}`} className="hover:text-[#D4AF37] transition-colors capitalize">{product.category}</Link>
              <span>/</span>
            </>
          )}
          <span className="text-[#0F0F0F]/70 truncate max-w-[160px] sm:max-w-none">{product.name}</span>
        </nav>
      </div>

      {/* ════ MAIN PRODUCT SECTION ════ */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 pb-16 sm:pb-24">
        <div className="flex flex-col lg:flex-row gap-8 xl:gap-20">

          {/* ── LEFT: Image Gallery ── */}
          <div className="lg:w-[52%] flex flex-col gap-3">
            <div className="relative">
              <div
                ref={imgRef}
                className="relative overflow-hidden bg-[#F0EDE6] cursor-zoom-in w-full"
                style={{ aspectRatio: "4/5" }}
                onMouseEnter={() => setIsZoomed(true)}
                onMouseLeave={() => setIsZoomed(false)}
                onMouseMove={handleMouseMove}
                onClick={() => setLightboxOpen(true)}
              >
                <img
                  src={images[selectedImage]}
                  alt={product.name}
                  className={`w-full h-full object-cover transition-transform duration-200 ${isZoomed ? "scale-150" : "scale-100"}`}
                  style={isZoomed ? { transformOrigin: `${zoomPos.x}% ${zoomPos.y}%` } : {}}
                  draggable={false}
                />
                {!isZoomed && (
                  <div className="hidden sm:flex absolute bottom-4 right-4 items-center gap-1.5 bg-white/80 backdrop-blur-sm px-3 py-1.5 text-[9px] tracking-[0.2em] uppercase text-[#0F0F0F]/60 font-medium">
                    <ZoomIn className="w-3 h-3" /> Hover to zoom
                  </div>
                )}
                {images.length > 1 && (
                  <>
                    <button onClick={(e) => { e.stopPropagation(); setSelectedImage((p) => (p - 1 + images.length) % images.length); }}
                      className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 bg-white/85 hover:bg-white flex items-center justify-center shadow transition-colors">
                      <ChevronLeft className="w-4 h-4 text-[#0F0F0F]" />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); setSelectedImage((p) => (p + 1) % images.length); }}
                      className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 bg-white/85 hover:bg-white flex items-center justify-center shadow transition-colors">
                      <ChevronRight className="w-4 h-4 text-[#0F0F0F]" />
                    </button>
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 sm:hidden">
                      {images.map((_: string, i: number) => (
                        <button key={i} onClick={(e) => { e.stopPropagation(); setSelectedImage(i); }}
                          className={`w-1.5 h-1.5 rounded-full transition-colors ${i === selectedImage ? "bg-[#D4AF37]" : "bg-white/50"}`} />
                      ))}
                    </div>
                  </>
                )}
              </div>
              <p className="hidden sm:block text-center text-[9px] tracking-[0.2em] uppercase text-[#0F0F0F]/30 mt-2">
                {selectedImage + 1} / {images.length}
              </p>
            </div>

            {images.length > 1 && (
              <div className="hidden sm:flex gap-2 overflow-x-auto pb-1">
                {images.map((img: string, i: number) => (
                  <button key={i} onClick={() => setSelectedImage(i)}
                    className={`flex-shrink-0 w-14 h-18 sm:w-16 sm:h-20 lg:w-20 lg:h-24 overflow-hidden border-2 transition-all duration-200 ${
                      selectedImage === i ? "border-[#D4AF37]" : "border-transparent hover:border-[#D4AF37]/40"
                    }`}>
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── RIGHT: Product Info ── */}
          <div className="lg:w-[48%] flex flex-col">

            {/* Category badge */}
            <div className="flex items-center gap-3 mb-3 flex-wrap">
              {product.category && (
                <Link href={`/category/${product.category}`}
                  className="flex items-center gap-1.5 text-[9px] tracking-[0.3em] uppercase text-[#D4AF37] font-semibold hover:underline underline-offset-2 transition-colors">
                  <Tag className="w-3 h-3" />
                  {product.category}
                </Link>
              )}
              {product.stock < 5 && product.stock > 0 && (
                <span className="text-[9px] tracking-[0.15em] uppercase bg-red-50 text-red-600 px-2 py-0.5 font-semibold">
                  Only {product.stock} left
                </span>
              )}
              {product.stock === 0 && (
                <span className="text-[9px] tracking-[0.15em] uppercase bg-[#0F0F0F]/5 text-[#0F0F0F]/50 px-2 py-0.5 font-semibold">
                  Made to Order
                </span>
              )}
            </div>

            {/* Name */}
            <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl xl:text-5xl text-[#0F0F0F] leading-tight mb-4">
              {product.name}
            </h1>

            {/* Rating */}
            {reviews && reviews.length > 0 && (
              <div className="flex items-center gap-2 mb-4">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className={`w-3.5 h-3.5 ${s <= Math.round(avgRating) ? "text-[#D4AF37] fill-[#D4AF37]" : "text-[#D4AF37]/30"}`} />
                  ))}
                </div>
                <span className="text-[10px] text-[#0F0F0F]/50 tracking-wide">
                  {avgRating.toFixed(1)} · {reviews.length} review{reviews.length !== 1 ? "s" : ""}
                </span>
              </div>
            )}

            <div className="w-12 h-px bg-[#D4AF37] mb-5" />

            {/* Price */}
            <div className="flex items-end gap-3 sm:gap-4 mb-6 flex-wrap">
              {discountPrice ? (
                <>
                  <span className="font-serif text-2xl sm:text-3xl text-[#0F0F0F]">{INR(discountPrice)}</span>
                  <span className="text-base sm:text-lg text-[#0F0F0F]/30 line-through pb-0.5">{INR(price)}</span>
                  <span className="text-[10px] tracking-[0.15em] uppercase bg-[#D4AF37]/15 text-[#D4AF37] px-2 py-1 font-bold">
                    Save {Math.round((1 - discountPrice / price) * 100)}%
                  </span>
                </>
              ) : (
                <span className="font-serif text-2xl sm:text-3xl text-[#0F0F0F]">{INR(price)}</span>
              )}
            </div>

            {/* Material selector */}
            <div className="mb-6">
              <p className="text-[9px] tracking-[0.25em] uppercase text-[#0F0F0F]/50 font-semibold mb-3">
                Material: <span className="text-[#0F0F0F]">{activeMaterial}</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {materialVariants.map((m) => (
                  <button
                    key={m}
                    onClick={() => setSelectedMaterial(m)}
                    className={`px-2.5 sm:px-3 py-1.5 sm:py-2 text-[10px] tracking-[0.12em] sm:tracking-[0.15em] uppercase font-medium border transition-all duration-200 ${
                      activeMaterial === m
                        ? "border-[#D4AF37] bg-[#D4AF37]/8 text-[#0F0F0F]"
                        : "border-[#0F0F0F]/15 text-[#0F0F0F]/50 hover:border-[#D4AF37]/60 hover:text-[#0F0F0F]"
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* Size selector */}
            {sizes.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3 gap-2">
                  <p className="text-[9px] tracking-[0.25em] uppercase text-[#0F0F0F]/50 font-semibold">
                    {productAny.category?.toLowerCase().includes("ring") ? "Ring Size" : "Size"}:&nbsp;
                    <span className="text-[#0F0F0F]">{selectedSize ?? "Select"}</span>
                  </p>
                  <button className="text-[9px] tracking-[0.15em] uppercase text-[#D4AF37] underline underline-offset-2 font-semibold whitespace-nowrap">
                    Size Guide
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {sizes.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSelectedSize(s)}
                      className={`w-9 h-9 sm:w-10 sm:h-10 text-xs sm:text-sm font-medium border transition-all duration-200 ${
                        selectedSize === s
                          ? "border-[#D4AF37] bg-[#D4AF37] text-white"
                          : "border-[#0F0F0F]/15 text-[#0F0F0F]/60 hover:border-[#D4AF37]/60"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="mb-6">
              <p className="text-[9px] tracking-[0.25em] uppercase text-[#0F0F0F]/50 font-semibold mb-3">Quantity</p>
              <div className="flex items-center border border-[#0F0F0F]/15 w-fit">
                <button onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center hover:bg-[#0F0F0F]/5 transition-colors">
                  <Minus className="w-3.5 h-3.5 text-[#0F0F0F]" />
                </button>
                <span className="w-10 sm:w-12 h-10 sm:h-11 flex items-center justify-center font-medium text-[#0F0F0F] text-sm border-x border-[#0F0F0F]/15">
                  {quantity}
                </span>
                <button onClick={() => setQuantity((q) => Math.min(product.stock || 10, q + 1))}
                  className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center hover:bg-[#0F0F0F]/5 transition-colors">
                  <Plus className="w-3.5 h-3.5 text-[#0F0F0F]" />
                </button>
              </div>
            </div>

            {/* CTA row */}
            <div className="flex gap-2 sm:gap-3 mb-7">
              <button
                onClick={handleAddToCart}
                disabled={addToCart.isPending}
                className="flex-1 h-12 sm:h-14 bg-[#0F0F0F] hover:bg-[#1a1a1a] text-white text-[10px] tracking-[0.25em] sm:tracking-[0.3em] uppercase font-bold transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {addToCart.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Add to Bag"}
              </button>
              <button
                onClick={handleWishlist}
                className={`w-12 h-12 sm:w-14 sm:h-14 border flex items-center justify-center transition-all duration-200 ${
                  isWishlisted ? "border-[#D4AF37] bg-[#D4AF37]/10" : "border-[#0F0F0F]/15 hover:border-[#D4AF37]"
                }`}
              >
                <Heart className={`w-4 h-4 sm:w-5 sm:h-5 transition-colors ${isWishlisted ? "text-[#D4AF37] fill-[#D4AF37]" : "text-[#0F0F0F]/50"}`} />
              </button>
              <button className="w-12 h-12 sm:w-14 sm:h-14 border border-[#0F0F0F]/15 hover:border-[#D4AF37] flex items-center justify-center transition-colors">
                <Share2 className="w-4 h-4 text-[#0F0F0F]/50" />
              </button>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3 border-t border-[#0F0F0F]/8 pt-6 mb-7">
              {[
                { icon: Truck, label: "Free Shipping", sub: "Above ₹5,000" },
                { icon: ShieldCheck, label: "Certified", sub: "BIS Hallmarked" },
                { icon: RefreshCcw, label: "30-Day Returns", sub: "Hassle-free" },
              ].map(({ icon: Icon, label, sub }) => (
                <div key={label} className="flex flex-col items-center text-center gap-1.5">
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-[#D4AF37]" />
                  <div>
                    <p className="text-[8px] sm:text-[9px] tracking-[0.12em] sm:tracking-[0.15em] uppercase font-semibold text-[#0F0F0F]">{label}</p>
                    <p className="text-[8px] sm:text-[9px] text-[#0F0F0F]/40 mt-0.5">{sub}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Meta */}
            {product.material && (
              <div className="flex items-center gap-2 text-[10px] text-[#0F0F0F]/40">
                <Award className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Base material: {product.material}</span>
              </div>
            )}
          </div>
        </div>

        {/* ════ TABS SECTION ════ */}
        <div className="mt-14 sm:mt-20 border-t border-[#0F0F0F]/8 pt-10 sm:pt-12">
          <div className="flex gap-0 border-b border-[#0F0F0F]/8 mb-10 sm:mb-12 overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`relative px-3 sm:px-6 py-4 text-[9px] sm:text-[10px] tracking-[0.15em] sm:tracking-[0.2em] uppercase font-semibold whitespace-nowrap transition-colors ${
                  activeTab === tab ? "text-[#0F0F0F]" : "text-[#0F0F0F]/35 hover:text-[#0F0F0F]/70"
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#D4AF37]" />
                )}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="max-w-3xl"
            >
              {activeTab === "Description" && (
                <div className="space-y-4 text-[#0F0F0F]/65 leading-relaxed text-sm">
                  {product.description && <p>{product.description}</p>}
                  {(productAny.craftStory) && <p>{productAny.craftStory}</p>}
                  {!(productAny.craftStory) && (
                    <p>Each Pearlis piece is handcrafted by master artisans with decades of experience, combining traditional Indian jewellery techniques with contemporary design sensibilities.</p>
                  )}
                  {((productAny.craftPoints?.length > 0) ? productAny.craftPoints : [
                    "Handcrafted by certified artisans",
                    "BIS Hallmarked for purity assurance",
                    "Ethically sourced gemstones",
                    "Comes in a Pearlis signature gift box",
                    "Certificate of authenticity included",
                  ]).map((pt: string) => (
                    <li key={pt} className="flex items-center gap-3 text-[11px] tracking-wide list-none">
                      <span className="w-1 h-1 rounded-full bg-[#D4AF37] flex-shrink-0" />
                      {pt}
                    </li>
                  ))}
                </div>
              )}

              {activeTab === "Specifications" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-0">
                  {((productAny.specifications?.length > 0
                    ? productAny.specifications
                    : [
                        { key: "Metal", value: activeMaterial },
                        { key: "Purity", value: activeMaterial.includes("18K") ? "75% Pure Gold" : activeMaterial.includes("14K") ? "58.5% Pure Gold" : "95% Pure Platinum" },
                        { key: "Finish", value: "High Polish" },
                        { key: "Category", value: product.category },
                        { key: "Stock", value: product.stock > 0 ? `${product.stock} units available` : "Made to Order (4–6 weeks)" },
                        { key: "SKU", value: `PRL-${String(product.id).padStart(5, "0")}` },
                        { key: "Weight", value: "Approx. 4–7g" },
                      ]
                  ).map(({ key: k, value: v }: { key: string; value: string }) => (
                    <div key={k} className="flex justify-between items-center py-3 sm:py-4 border-b border-[#0F0F0F]/6">
                      <span className="text-[10px] tracking-[0.15em] uppercase text-[#0F0F0F]/40 font-semibold">{k}</span>
                      <span className="text-sm text-[#0F0F0F]/80 font-medium">{v}</span>
                    </div>
                  )))}
                </div>
              )}

              {activeTab === "Reviews" && (
                <div>
                  {reviews && reviews.length > 0 ? (
                    <div className="space-y-8">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 sm:gap-8 p-5 sm:p-6 bg-white border border-[#0F0F0F]/6 mb-8">
                        <div className="text-center sm:text-left flex sm:flex-col items-center sm:items-center gap-3 sm:gap-0">
                          <p className="font-serif text-4xl sm:text-5xl text-[#0F0F0F]">{avgRating.toFixed(1)}</p>
                          <div>
                            <div className="flex justify-center mt-2 mb-1">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <Star key={s} className={`w-3.5 h-3.5 ${s <= Math.round(avgRating) ? "text-[#D4AF37] fill-[#D4AF37]" : "text-[#D4AF37]/25"}`} />
                              ))}
                            </div>
                            <p className="text-[9px] tracking-[0.15em] uppercase text-[#0F0F0F]/40">{reviews.length} reviews</p>
                          </div>
                        </div>
                        <div className="flex-1 w-full space-y-1.5">
                          {[5, 4, 3, 2, 1].map((star) => {
                            const count = reviews.filter((r: { rating: number }) => r.rating === star).length;
                            const pct = reviews.length ? (count / reviews.length) * 100 : 0;
                            return (
                              <div key={star} className="flex items-center gap-3">
                                <span className="text-[9px] text-[#0F0F0F]/40 w-4">{star}</span>
                                <div className="flex-1 h-1.5 bg-[#0F0F0F]/6">
                                  <div className="h-full bg-[#D4AF37]" style={{ width: `${pct}%` }} />
                                </div>
                                <span className="text-[9px] text-[#0F0F0F]/30 w-5">{count}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {reviews.map((r: { id: number; rating: number; comment?: string; createdAt: string }, idx: number) => (
                        <div key={idx} className="border-b border-[#0F0F0F]/6 pb-8">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-8 h-8 rounded-full bg-[#D4AF37]/15 flex items-center justify-center text-[#D4AF37] font-bold text-sm">
                              {String.fromCharCode(65 + (r.id % 26))}
                            </div>
                            <div>
                              <div className="flex">
                                {[1, 2, 3, 4, 5].map((s) => (
                                  <Star key={s} className={`w-3 h-3 ${s <= r.rating ? "text-[#D4AF37] fill-[#D4AF37]" : "text-[#D4AF37]/25"}`} />
                                ))}
                              </div>
                              <p className="text-[9px] text-[#0F0F0F]/30 mt-0.5">
                                {new Date(r.createdAt).toLocaleDateString("en-IN", { year: "numeric", month: "long" })}
                              </p>
                            </div>
                          </div>
                          <p className="text-sm text-[#0F0F0F]/65 leading-relaxed">{r.comment || "Excellent quality, beautifully crafted."}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-16">
                      <Star className="w-8 h-8 text-[#D4AF37]/30 mx-auto mb-4" />
                      <p className="font-serif text-xl text-[#0F0F0F]/40 mb-2">No reviews yet</p>
                      <p className="text-sm text-[#0F0F0F]/30">Be the first to review this piece.</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "Shipping & Returns" && (
                <div className="space-y-7 text-sm text-[#0F0F0F]/65 leading-relaxed">
                  {(productAny.shippingInfo
                    ? productAny.shippingInfo.split(/\n\n+/).map((block: string, i: number) => {
                        const lines = block.trim().split("\n");
                        return (
                          <div key={i}>
                            <h4 className="text-[10px] tracking-[0.2em] uppercase font-bold text-[#0F0F0F] mb-2">{lines[0]}</h4>
                            {lines.slice(1).join(" ").trim() && <p>{lines.slice(1).join(" ").trim()}</p>}
                          </div>
                        );
                      })
                    : [
                        { title: "Free Standard Shipping", body: "Complimentary shipping on all orders above ₹5,000 across India. Standard delivery takes 5–7 business days. Tracked and fully insured." },
                        { title: "Express Delivery", body: "Need it sooner? Express delivery (2–3 business days) is available for ₹299. Available in all major metros." },
                        { title: "International Shipping", body: "We ship worldwide. International orders are delivered in 10–15 business days via DHL Express. Duties and taxes may apply." },
                        { title: "Easy 30-Day Returns", body: "Not in love with your purchase? Return it within 30 days in original, unworn condition. We'll arrange a free pickup and process your refund within 5–7 business days." },
                      ].map(({ title, body }) => (
                        <div key={title}>
                          <h4 className="text-[10px] tracking-[0.2em] uppercase font-bold text-[#0F0F0F] mb-2">{title}</h4>
                          <p>{body}</p>
                        </div>
                      ))
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ════ RELATED PRODUCTS ════ */}
        {relatedProducts && relatedProducts.length > 0 && (
          <div className="mt-20 sm:mt-28 pt-14 sm:pt-16 border-t border-[#0F0F0F]/8">
            <div className="flex items-end justify-between mb-8 sm:mb-10">
              <div>
                <p className="text-[#D4AF37] text-[10px] tracking-[0.3em] uppercase font-semibold mb-2">Curated For You</p>
                <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl text-[#0F0F0F]">You May Also Love</h2>
              </div>
              <div className="hidden md:flex gap-2">
                <button onClick={() => scrollCarousel("left")} className="w-10 h-10 border border-[#0F0F0F]/15 hover:border-[#D4AF37] flex items-center justify-center transition-colors">
                  <ChevronLeft className="w-4 h-4 text-[#0F0F0F]" />
                </button>
                <button onClick={() => scrollCarousel("right")} className="w-10 h-10 border border-[#0F0F0F]/15 hover:border-[#D4AF37] flex items-center justify-center transition-colors">
                  <ChevronRight className="w-4 h-4 text-[#0F0F0F]" />
                </button>
              </div>
            </div>

            <div ref={carouselRef} className="flex gap-4 sm:gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scroll-smooth" style={{ scrollbarWidth: "none" }}>
              {relatedProducts.map((p: Parameters<typeof ProductCard>[0]["product"], i: number) => (
                <div key={p.id} className="flex-shrink-0 w-48 sm:w-64 md:w-72 snap-start">
                  <ProductCard product={p} index={i} />
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* ════ LIGHTBOX ════ */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setLightboxOpen(false)}
            className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center px-4"
          >
            <motion.img
              initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.85, opacity: 0 }}
              src={images[selectedImage]} alt={product.name}
              className="max-h-[90vh] max-w-[90vw] object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            <button onClick={() => setLightboxOpen(false)} className="absolute top-6 right-6 text-white/60 hover:text-white text-[11px] tracking-[0.2em] uppercase">
              ✕ Close
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
