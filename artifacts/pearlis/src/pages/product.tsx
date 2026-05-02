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
  Loader2, Heart, Share2, ShieldCheck, Truck, RefreshCcw,
  Star, ChevronLeft, ChevronRight, ZoomIn, Award, Minus, Plus, Tag,
} from "lucide-react";
import { BackButton } from "@/components/ui/BackButton";

const INR = (n: number) => "₹" + Math.round(n).toLocaleString("en-IN");
const DEFAULT_RING_SIZES = ["5", "6", "7", "8", "9", "10", "11", "12"];

type Variant = { name: string; productId?: number | null };

function parseVariants(raw: any): Variant[] {
  if (!Array.isArray(raw) || !raw.length) return [];
  if (typeof raw[0] === "string") return raw.map((s: string) => ({ name: s, productId: null }));
  return raw.map((v: any) => ({ name: v.name ?? "", productId: v.productId ? Number(v.productId) : null }));
}

const TABS = ["Description", "Specifications", "Reviews", "Shipping & Returns"] as const;
type Tab = (typeof TABS)[number];

export default function ProductDetail() {
  const [, params] = useRoute("/product/:id");
  const productId = parseInt(params?.id || "0");
  const { toast } = useToast();

  /* ── local state ── */
  const [selectedImage, setSelectedImage] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [activeVariantIdx, setActiveVariantIdx] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<Tab>("Description");
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);

  /* ── base product ── */
  const { data: product, isLoading } = useGetProduct(productId, { query: { enabled: !!productId } });
  const { data: relatedProducts } = useGetRelatedProducts(productId, { query: { enabled: !!productId } });
  const { data: reviews } = useGetProductReviews(productId, { query: { enabled: !!productId } });
  const { data: wishlist } = useGetWishlist();
  const addToCart = useAddToCart();
  const addToWishlist = useAddToWishlist();
  const removeFromWishlist = useRemoveFromWishlist();

  /* ── variant-linked product ── */
  const variants: Variant[] = product ? parseVariants((product as any).materialVariants) : [];
  const activeVariant = activeVariantIdx !== null ? variants[activeVariantIdx] : null;
  const linkedProductId = activeVariant?.productId ? Number(activeVariant.productId) : null;

  const { data: variantProduct, isFetching: variantFetching } = useGetProduct(
    linkedProductId ?? 0,
    { query: { enabled: !!linkedProductId } }
  );

  /* ── display data — variant overrides base ── */
  const dp = (variantProduct ?? product) as any;
  const isWishlisted = wishlist?.some((w: { id: number }) => w.id === productId);
  const avgRating = reviews?.length
    ? reviews.reduce((s: number, r: { rating: number }) => s + r.rating, 0) / reviews.length
    : 0;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imgRef.current) return;
    const rect = imgRef.current.getBoundingClientRect();
    setZoomPos({ x: ((e.clientX - rect.left) / rect.width) * 100, y: ((e.clientY - rect.top) / rect.height) * 100 });
  };

  /* when variant changes reset image index */
  const selectVariant = (idx: number | null) => {
    setActiveVariantIdx(idx);
    setSelectedImage(0);
  };

  const handleAddToCart = () => {
    const cartProductId = linkedProductId ?? productId;
    addToCart.mutate({ data: { productId: cartProductId, quantity } }, {
      onSuccess: () => toast({ title: "Added to bag", description: `${dp?.name} × ${quantity}` }),
    });
  };

  const handleWishlist = () => {
    if (isWishlisted) {
      removeFromWishlist.mutate(productId, {
        onSuccess: () => toast({ title: "Removed from wishlist" }),
      });
    } else {
      addToWishlist.mutate(productId, {
        onSuccess: () => toast({ title: "Saved to wishlist", description: product?.name }),
      });
    }
  };

  const scrollCarousel = (dir: "left" | "right") =>
    carouselRef.current?.scrollBy({ left: dir === "right" ? 280 : -280, behavior: "smooth" });

  /* ── guards ── */
  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAF8F3]">
      <div className="text-center space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-[#D4AF37] mx-auto" />
        <p className="text-[10px] tracking-[0.3em] uppercase text-[#0F0F0F]/40">Loading</p>
      </div>
    </div>
  );
  if (!product) return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAF8F3]">
      <div className="text-center">
        <p className="font-serif text-3xl text-[#0F0F0F] mb-4">Product not found</p>
        <Link href="/shop" className="text-[#D4AF37] text-[11px] tracking-[0.25em] uppercase font-semibold hover:underline">Back to Shop</Link>
      </div>
    </div>
  );

  const sizes: string[] = (product as any).sizes?.length
    ? (product as any).sizes
    : (product.category?.toLowerCase().includes("ring") ? DEFAULT_RING_SIZES : []);

  /* key that drives the animation — changes when linked product changes */
  const displayKey = linkedProductId ?? "base";

  const dpImages = dp?.images?.length
    ? dp.images
    : ["https://images.unsplash.com/photo-1573408301185-9519f94815b5?auto=format&fit=crop&q=85&w=900"];
  const dpPrice = dp ? dp.price * 83 : 0;
  const dpDiscountPrice = dp?.discountPrice ? dp.discountPrice * 83 : null;

  return (
    <div className="min-h-screen bg-[#FAF8F3] flex flex-col">
      <Navbar />
      <div style={{ height: "100px" }} />

      {/* Back */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 pt-4">
        <BackButton />
      </div>

      {/* ── Breadcrumb ── */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-4">
        <nav className="flex items-center gap-2 text-[10px] tracking-[0.2em] uppercase text-[#0F0F0F]/40 flex-wrap">
          <Link href="/" className="hover:text-[#D4AF37] transition-colors">Home</Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-[#D4AF37] transition-colors">Shop</Link>
          {product.category && <>
            <span>/</span>
            <Link href={`/category/${product.category}`} className="hover:text-[#D4AF37] transition-colors capitalize">{product.category}</Link>
          </>}
          <span>/</span>
          <span className="text-[#0F0F0F]/70 truncate max-w-[160px] sm:max-w-none">{product.name}</span>
        </nav>
      </div>

      {/* ════ MAIN SECTION ════ */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 pb-16 sm:pb-24">
        <div className="flex flex-col lg:flex-row gap-8 xl:gap-20">

          {/* ── LEFT: Images (animate on variant change) ── */}
          <div className="lg:w-[52%] flex flex-col gap-3">
            <AnimatePresence mode="wait">
              <motion.div key={`img-${displayKey}`}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}>
                <div className="relative">
                  <div ref={imgRef}
                    className="relative overflow-hidden bg-[#F0EDE6] cursor-zoom-in w-full"
                    style={{ aspectRatio: "4/5" }}
                    onMouseEnter={() => setIsZoomed(true)}
                    onMouseLeave={() => setIsZoomed(false)}
                    onMouseMove={handleMouseMove}
                    onClick={() => setLightboxOpen(true)}>
                    {/* Loading shimmer while fetching variant */}
                    {variantFetching && (
                      <div className="absolute inset-0 bg-[#F0EDE6] animate-pulse z-10 flex items-center justify-center">
                        <Loader2 className="w-6 h-6 animate-spin text-[#D4AF37]/50" />
                      </div>
                    )}
                    <img src={dpImages[selectedImage]} alt={dp?.name || product.name}
                      className={`w-full h-full object-cover transition-transform duration-200 ${isZoomed ? "scale-150" : "scale-100"}`}
                      style={isZoomed ? { transformOrigin: `${zoomPos.x}% ${zoomPos.y}%` } : {}}
                      draggable={false} />
                    {!isZoomed && (
                      <div className="hidden sm:flex absolute bottom-4 right-4 items-center gap-1.5 bg-white/80 backdrop-blur-sm px-3 py-1.5 text-[9px] tracking-[0.2em] uppercase text-[#0F0F0F]/60 font-medium">
                        <ZoomIn className="w-3 h-3" /> Hover to zoom
                      </div>
                    )}
                    {dpImages.length > 1 && (
                      <>
                        <button onClick={e => { e.stopPropagation(); setSelectedImage(p => (p - 1 + dpImages.length) % dpImages.length); }}
                          className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 bg-white/85 hover:bg-white flex items-center justify-center shadow transition-colors">
                          <ChevronLeft className="w-4 h-4 text-[#0F0F0F]" />
                        </button>
                        <button onClick={e => { e.stopPropagation(); setSelectedImage(p => (p + 1) % dpImages.length); }}
                          className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 bg-white/85 hover:bg-white flex items-center justify-center shadow transition-colors">
                          <ChevronRight className="w-4 h-4 text-[#0F0F0F]" />
                        </button>
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 sm:hidden">
                          {dpImages.map((_: string, i: number) => (
                            <button key={i} onClick={e => { e.stopPropagation(); setSelectedImage(i); }}
                              className={`w-1.5 h-1.5 rounded-full transition-colors ${i === selectedImage ? "bg-[#D4AF37]" : "bg-white/50"}`} />
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                  <p className="hidden sm:block text-center text-[9px] tracking-[0.2em] uppercase text-[#0F0F0F]/30 mt-2">
                    {selectedImage + 1} / {dpImages.length}
                  </p>
                </div>

                {dpImages.length > 1 && (
                  <div className="hidden sm:flex gap-2 overflow-x-auto pb-1">
                    {dpImages.map((img: string, i: number) => (
                      <button key={i} onClick={() => setSelectedImage(i)}
                        className={`flex-shrink-0 w-16 h-20 lg:w-20 lg:h-24 overflow-hidden border-2 transition-all duration-200 ${selectedImage === i ? "border-[#D4AF37]" : "border-transparent hover:border-[#D4AF37]/40"}`}>
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* ── RIGHT: Info ── */}
          <div className="lg:w-[48%] flex flex-col">

            {/* Category + badges */}
            <div className="flex items-center gap-3 mb-3 flex-wrap">
              {product.category && (
                <Link href={`/category/${product.category}`}
                  className="flex items-center gap-1.5 text-[9px] tracking-[0.3em] uppercase text-[#D4AF37] font-semibold hover:underline underline-offset-2">
                  <Tag className="w-3 h-3" />{product.category}
                </Link>
              )}
              {product.stock < 5 && product.stock > 0 && (
                <span className="text-[9px] tracking-[0.15em] uppercase bg-red-50 text-red-600 px-2 py-0.5 font-semibold">Only {product.stock} left</span>
              )}
              {product.stock === 0 && (
                <span className="text-[9px] tracking-[0.15em] uppercase bg-[#0F0F0F]/5 text-[#0F0F0F]/50 px-2 py-0.5 font-semibold">Made to Order</span>
              )}
            </div>

            {/* Name + price animate on variant change */}
            <AnimatePresence mode="wait">
              <motion.div key={`info-${displayKey}`}
                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.25 }}>

                <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl xl:text-5xl text-[#0F0F0F] leading-tight mb-4">
                  {dp?.name || product.name}
                </h1>

                {reviews && reviews.length > 0 && (
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex">
                      {[1,2,3,4,5].map(s => <Star key={s} className={`w-3.5 h-3.5 ${s <= Math.round(avgRating) ? "text-[#D4AF37] fill-[#D4AF37]" : "text-[#D4AF37]/30"}`} />)}
                    </div>
                    <span className="text-[10px] text-[#0F0F0F]/50 tracking-wide">
                      {avgRating.toFixed(1)} · {reviews.length} review{reviews.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                )}

                <div className="w-12 h-px bg-[#D4AF37] mb-5" />

                {/* Price */}
                <div className="flex items-end gap-3 sm:gap-4 mb-6 flex-wrap">
                  {dpDiscountPrice ? (
                    <>
                      <span className="font-serif text-2xl sm:text-3xl text-[#0F0F0F]">{INR(dpDiscountPrice)}</span>
                      <span className="text-base sm:text-lg text-[#0F0F0F]/30 line-through pb-0.5">{INR(dpPrice)}</span>
                      <span className="text-[10px] tracking-[0.15em] uppercase bg-[#D4AF37]/15 text-[#D4AF37] px-2 py-1 font-bold">
                        Save {Math.round((1 - dpDiscountPrice / dpPrice) * 100)}%
                      </span>
                    </>
                  ) : (
                    <span className="font-serif text-2xl sm:text-3xl text-[#0F0F0F]">{INR(dpPrice)}</span>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>

            {/* ── Variant selector ── */}
            {variants.length > 0 && (
              <div className="mb-6">
                <p className="text-[9px] tracking-[0.25em] uppercase text-[#0F0F0F]/50 font-semibold mb-3">
                  Material:&nbsp;
                  <span className="text-[#0F0F0F]">
                    {activeVariantIdx !== null ? variants[activeVariantIdx].name : variants[0].name}
                  </span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {variants.map((v, i) => {
                    const isActive = activeVariantIdx === i || (activeVariantIdx === null && i === 0);
                    return (
                      <button key={i} onClick={() => selectVariant(i === 0 && activeVariantIdx === null ? null : i)}
                        className={`relative px-2.5 sm:px-3 py-1.5 sm:py-2 text-[10px] tracking-[0.12em] sm:tracking-[0.15em] uppercase font-medium border transition-all duration-200 ${
                          isActive
                            ? "border-[#D4AF37] bg-[#D4AF37]/8 text-[#0F0F0F]"
                            : "border-[#0F0F0F]/15 text-[#0F0F0F]/50 hover:border-[#D4AF37]/60 hover:text-[#0F0F0F]"
                        }`}>
                        {v.name}
                        {v.productId && (
                          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#D4AF37]" title="Links to a separate product" />
                        )}
                      </button>
                    );
                  })}
                </div>
                {activeVariant?.productId && (
                  <p className="text-[9px] text-[#0F0F0F]/30 mt-2 tracking-wide">
                    Showing details for {activeVariant.name} variant
                  </p>
                )}
              </div>
            )}

            {/* ── Size selector ── */}
            {sizes.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3 gap-2">
                  <p className="text-[9px] tracking-[0.25em] uppercase text-[#0F0F0F]/50 font-semibold">
                    {product.category?.toLowerCase().includes("ring") ? "Ring Size" : "Size"}:&nbsp;
                    <span className="text-[#0F0F0F]">{selectedSize ?? "Select"}</span>
                  </p>
                  <button className="text-[9px] tracking-[0.15em] uppercase text-[#D4AF37] underline underline-offset-2 font-semibold whitespace-nowrap">Size Guide</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {sizes.map(s => (
                    <button key={s} onClick={() => setSelectedSize(s)}
                      className={`w-9 h-9 sm:w-10 sm:h-10 text-xs sm:text-sm font-medium border transition-all duration-200 ${
                        selectedSize === s ? "border-[#D4AF37] bg-[#D4AF37] text-white" : "border-[#0F0F0F]/15 text-[#0F0F0F]/60 hover:border-[#D4AF37]/60"
                      }`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ── Quantity ── */}
            <div className="mb-6">
              <p className="text-[9px] tracking-[0.25em] uppercase text-[#0F0F0F]/50 font-semibold mb-3">Quantity</p>
              <div className="flex items-center border border-[#0F0F0F]/15 w-fit">
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center hover:bg-[#0F0F0F]/5 transition-colors">
                  <Minus className="w-3.5 h-3.5 text-[#0F0F0F]" />
                </button>
                <span className="w-10 sm:w-12 h-10 sm:h-11 flex items-center justify-center font-medium text-[#0F0F0F] text-sm border-x border-[#0F0F0F]/15">{quantity}</span>
                <button onClick={() => setQuantity(q => Math.min(product.stock || 10, q + 1))}
                  className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center hover:bg-[#0F0F0F]/5 transition-colors">
                  <Plus className="w-3.5 h-3.5 text-[#0F0F0F]" />
                </button>
              </div>
            </div>

            {/* ── CTAs ── */}
            <div className="flex gap-2 sm:gap-3 mb-7">
              <button onClick={handleAddToCart} disabled={addToCart.isPending}
                className="flex-1 h-12 sm:h-14 bg-[#0F0F0F] hover:bg-[#1a1a1a] text-white text-[10px] tracking-[0.25em] sm:tracking-[0.3em] uppercase font-bold transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
                {addToCart.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Add to Bag"}
              </button>
              <button onClick={handleWishlist}
                className={`w-12 h-12 sm:w-14 sm:h-14 border flex items-center justify-center transition-all duration-200 ${isWishlisted ? "border-[#D4AF37] bg-[#D4AF37]/10" : "border-[#0F0F0F]/15 hover:border-[#D4AF37]"}`}>
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

            {product.material && (
              <div className="flex items-center gap-2 text-[10px] text-[#0F0F0F]/40">
                <Award className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Base material: {product.material}</span>
              </div>
            )}
          </div>
        </div>

        {/* ════ TABS — description/specs animate on variant change ════ */}
        <div className="mt-14 sm:mt-20 border-t border-[#0F0F0F]/8 pt-10 sm:pt-12">
          <div className="flex gap-0 border-b border-[#0F0F0F]/8 mb-10 sm:mb-12 overflow-x-auto">
            {TABS.map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`relative px-3 sm:px-6 py-4 text-[9px] sm:text-[10px] tracking-[0.15em] sm:tracking-[0.2em] uppercase font-semibold whitespace-nowrap transition-colors ${
                  activeTab === tab ? "text-[#0F0F0F]" : "text-[#0F0F0F]/35 hover:text-[#0F0F0F]/70"
                }`}>
                {tab}
                {activeTab === tab && <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#D4AF37]" />}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={`${activeTab}-${displayKey}`}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }} className="max-w-3xl">

              {activeTab === "Description" && (
                <div className="space-y-4 text-[#0F0F0F]/65 leading-relaxed text-sm">
                  {dp?.description && <p>{dp.description}</p>}
                  {dp?.craftStory
                    ? <p>{dp.craftStory}</p>
                    : <p>Each Pearlis piece is handcrafted by master artisans with decades of experience, combining traditional Indian jewellery techniques with contemporary design sensibilities.</p>
                  }
                  <ul className="space-y-2 mt-6 list-none">
                    {(dp?.craftPoints?.length ? dp.craftPoints : [
                      "Handcrafted by certified artisans",
                      "BIS Hallmarked for purity assurance",
                      "Ethically sourced gemstones",
                      "Comes in a Pearlis signature gift box",
                      "Certificate of authenticity included",
                    ]).map((pt: string) => (
                      <li key={pt} className="flex items-center gap-3 text-[11px] tracking-wide">
                        <span className="w-1 h-1 rounded-full bg-[#D4AF37] flex-shrink-0" />{pt}
                      </li>
                    ))}
                  </ul>
                  {/* Video */}
                  {dp?.videoUrl && (
                    <div className="mt-6 aspect-video w-full bg-black">
                      {dp.videoUrl.startsWith("/api/uploads/") ? (
                        <video src={dp.videoUrl} controls className="w-full h-full" />
                      ) : (
                        <iframe src={dp.videoUrl} className="w-full h-full" allowFullScreen title="Product video" />
                      )}
                    </div>
                  )}
                </div>
              )}

              {activeTab === "Specifications" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-0">
                  {((dp?.specifications?.length > 0 ? dp.specifications : [
                    { key: "Metal", value: activeVariant?.name || product.material || "Precious Metal" },
                    { key: "Category", value: product.category },
                    { key: "Stock", value: product.stock > 0 ? `${product.stock} units available` : "Made to Order (4–6 weeks)" },
                    { key: "SKU", value: `PRL-${String(product.id).padStart(5, "0")}` },
                    { key: "Weight", value: "Approx. 4–7g" },
                    { key: "Finish", value: "High Polish" },
                  ]).map(({ key: k, value: v }: { key: string; value: string }) => (
                    <div key={k} className="flex justify-between items-center py-3 sm:py-4 border-b border-[#0F0F0F]/6">
                      <span className="text-[10px] tracking-[0.15em] uppercase text-[#0F0F0F]/40 font-semibold">{k}</span>
                      <span className="text-sm text-[#0F0F0F]/80 font-medium">{v}</span>
                    </div>
                  )))}
                </div>
              )}

              {activeTab === "Reviews" && (
                reviews && reviews.length > 0 ? (
                  <div className="space-y-8">
                    <div className="flex flex-col sm:flex-row items-start gap-6 p-5 sm:p-6 bg-white border border-[#0F0F0F]/6 mb-8">
                      <div className="text-center flex sm:flex-col items-center gap-3 sm:gap-0">
                        <p className="font-serif text-4xl sm:text-5xl text-[#0F0F0F]">{avgRating.toFixed(1)}</p>
                        <div>
                          <div className="flex justify-center mt-2 mb-1">
                            {[1,2,3,4,5].map(s => <Star key={s} className={`w-3.5 h-3.5 ${s <= Math.round(avgRating) ? "text-[#D4AF37] fill-[#D4AF37]" : "text-[#D4AF37]/25"}`} />)}
                          </div>
                          <p className="text-[9px] tracking-[0.15em] uppercase text-[#0F0F0F]/40">{reviews.length} reviews</p>
                        </div>
                      </div>
                      <div className="flex-1 w-full space-y-1.5">
                        {[5,4,3,2,1].map(star => {
                          const count = reviews.filter((r: { rating: number }) => r.rating === star).length;
                          return (
                            <div key={star} className="flex items-center gap-3">
                              <span className="text-[9px] text-[#0F0F0F]/40 w-4">{star}</span>
                              <div className="flex-1 h-1.5 bg-[#0F0F0F]/6">
                                <div className="h-full bg-[#D4AF37]" style={{ width: `${reviews.length ? (count/reviews.length)*100 : 0}%` }} />
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
                              {[1,2,3,4,5].map(s => <Star key={s} className={`w-3 h-3 ${s <= r.rating ? "text-[#D4AF37] fill-[#D4AF37]" : "text-[#D4AF37]/25"}`} />)}
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
                )
              )}

              {activeTab === "Shipping & Returns" && (
                <div className="space-y-7 text-sm text-[#0F0F0F]/65 leading-relaxed">
                  {(dp?.shippingInfo
                    ? dp.shippingInfo.split(/\n\n+/).map((block: string, i: number) => {
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
                <button onClick={() => scrollCarousel("left")} className="w-10 h-10 border border-[#0F0F0F]/15 hover:border-[#D4AF37] flex items-center justify-center transition-colors"><ChevronLeft className="w-4 h-4" /></button>
                <button onClick={() => scrollCarousel("right")} className="w-10 h-10 border border-[#0F0F0F]/15 hover:border-[#D4AF37] flex items-center justify-center transition-colors"><ChevronRight className="w-4 h-4" /></button>
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
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setLightboxOpen(false)}
            className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center px-4">
            <motion.img initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.85, opacity: 0 }}
              src={dpImages[selectedImage]} alt={dp?.name}
              className="max-h-[90vh] max-w-[90vw] object-contain"
              onClick={e => e.stopPropagation()} />
            <button onClick={() => setLightboxOpen(false)} className="absolute top-6 right-6 text-white/60 hover:text-white text-[11px] tracking-[0.2em] uppercase">✕ Close</button>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
