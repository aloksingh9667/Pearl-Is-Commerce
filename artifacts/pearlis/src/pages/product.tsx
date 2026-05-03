import { useRoute, Link } from "wouter";
import {
  useGetProduct,
  useGetRelatedProducts,
  useAddToCart,
  useGetProductReviews,
  useCreateReview,
  useAddToWishlist,
  useRemoveFromWishlist,
  useGetWishlist,
  getGetCartQueryKey,
  getGetProductReviewsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ProductCard } from "@/components/ui/ProductCard";
import { useState, useRef, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2, Heart, Share2, ShieldCheck, Truck, RefreshCcw,
  Star, ChevronLeft, ChevronRight, ZoomIn, Award, Minus, Plus, Tag, Bell, CheckCircle2,
} from "lucide-react";
import { BackButton } from "@/components/ui/BackButton";
import { useRecentlyViewed, recordView } from "@/hooks/useRecentlyViewed";
import { SizeGuideModal } from "@/components/ui/SizeGuideModal";

const INR = (n: number) => "₹" + Math.round(n).toLocaleString("en-IN");

function NotifyMeForm({ productId }: { productId: number }) {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      const res = await fetch("/api/stock-alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, email }),
      });
      if (res.ok) {
        setDone(true);
        toast({ title: "You're on the list!", description: "We'll email you when this item is back in stock." });
      } else {
        const d = await res.json();
        toast({ title: "Error", description: d.error || "Could not subscribe.", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Something went wrong.", variant: "destructive" });
    } finally { setLoading(false); }
  };

  if (done) {
    return (
      <div className="mb-5 border border-[#D4AF37]/40 bg-[#D4AF37]/5 p-4 flex items-center gap-3">
        <CheckCircle2 className="w-5 h-5 text-[#D4AF37] flex-shrink-0" />
        <p className="text-sm text-[#0F0F0F]/70">
          We'll notify you at <strong>{email}</strong> when this item is back in stock.
        </p>
      </div>
    );
  }

  return (
    <div className="mb-5 border border-[#0F0F0F]/10 bg-[#FAF7F2] p-4">
      <div className="flex items-center gap-2 mb-3">
        <Bell className="w-4 h-4 text-[#D4AF37]" />
        <p className="text-[11px] uppercase tracking-[0.2em] font-semibold text-[#0F0F0F]">Notify Me When Available</p>
      </div>
      <p className="text-xs text-[#0F0F0F]/50 mb-3 leading-relaxed">This piece is currently sold out. Leave your email and we'll notify you the moment it's back.</p>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="email"
          required
          placeholder="your@email.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="flex-1 h-10 border border-[#0F0F0F]/15 bg-white px-3 text-sm focus:outline-none focus:border-[#D4AF37] transition-colors rounded-none"
        />
        <button
          type="submit"
          disabled={loading}
          className="h-10 px-4 bg-[#0F0F0F] text-white text-[10px] tracking-[0.2em] uppercase font-semibold flex items-center gap-1.5 hover:bg-[#1a1a1a] transition-colors disabled:opacity-60"
        >
          {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : "Notify Me"}
        </button>
      </form>
    </div>
  );
}
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

  /* ── review form state ── */
  const [reviewName, setReviewName] = useState("");
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewHover, setReviewHover] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  const recentlyViewed = useRecentlyViewed(productId);
  const [showSizeGuide, setShowSizeGuide] = useState(false);

  /* ── base product ── */
  const { data: product, isLoading } = useGetProduct(productId, { query: { enabled: !!productId } });
  const { data: relatedProducts } = useGetRelatedProducts(productId, { query: { enabled: !!productId } });
  const { data: reviews } = useGetProductReviews(productId, { query: { enabled: !!productId } });
  const { data: wishlist } = useGetWishlist();
  const addToCart = useAddToCart();
  const addToWishlist = useAddToWishlist();
  const removeFromWishlist = useRemoveFromWishlist();
  const queryClient = useQueryClient();
  const createReview = useCreateReview();

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
  const isWishlisted = wishlist?.some((w: any) => w.id === productId);
  const avgRating = reviews?.length
    ? reviews.reduce((s: number, r: { rating: number }) => s + r.rating, 0) / reviews.length
    : 0;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imgRef.current) return;
    const rect = imgRef.current.getBoundingClientRect();
    setZoomPos({ x: ((e.clientX - rect.left) / rect.width) * 100, y: ((e.clientY - rect.top) / rect.height) * 100 });
  };

  /* record view once product loads */
  useEffect(() => {
    if (!product) return;
    recordView({
      id: product.id,
      name: product.name,
      price: product.price,
      discountPrice: (product as any).discountPrice ?? null,
      images: (product as any).images?.length
        ? (product as any).images
        : ["https://images.unsplash.com/photo-1573408301185-9519f94815b5?auto=format&fit=crop&q=85&w=900"],
      category: product.category ?? null,
    });
  }, [product?.id]);

  /* when variant changes reset image index */
  const selectVariant = (idx: number | null) => {
    setActiveVariantIdx(idx);
    setSelectedImage(0);
  };

  const handleAddToCart = () => {
    const cartProductId = linkedProductId ?? productId;
    addToCart.mutate({ data: { productId: cartProductId, quantity } }, {
      onSuccess: (updatedCart) => {
        queryClient.setQueryData(getGetCartQueryKey(), updatedCart);
        toast({ title: "Added to bag", description: `${dp?.name} × ${quantity}` });
      },
      onError: () => toast({ title: "Could not add to bag", variant: "destructive" }),
    });
  };

  const handleWishlist = () => {
    if (isWishlisted) {
      removeFromWishlist.mutate({ productId }, {
        onSuccess: () => toast({ title: "Removed from wishlist" }),
      });
    } else {
      addToWishlist.mutate({ productId }, {
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
      {/* Back button row */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 pt-16 sm:pt-20 pb-2">
        <BackButton />
      </div>
      {/* Breadcrumb */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 pb-2 sm:pb-3">
        <nav className="flex flex-wrap items-center gap-x-1 gap-y-1.5 text-[8px] sm:text-[9px] tracking-[0.14em] sm:tracking-[0.18em] uppercase text-[#0F0F0F]/35 overflow-hidden">
          <Link href="/" className="hover:text-[#D4AF37] transition-colors shrink-0">Home</Link>
          <span className="shrink-0">/</span>
          <Link href="/shop" className="hover:text-[#D4AF37] transition-colors shrink-0">Shop</Link>
          {product.category && <>
            <span className="shrink-0">/</span>
            <Link href={`/category/${product.category}`} className="hover:text-[#D4AF37] transition-colors capitalize shrink-0">{product.category}</Link>
          </>}
          <span className="shrink-0">/</span>
          <span className="text-[#0F0F0F]/60 truncate min-w-0 max-w-full">{product.name}</span>
        </nav>
      </div>

      {/* ════ MAIN SECTION ════ */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 pb-16 sm:pb-24">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 xl:gap-20">

          {/* ── LEFT: Images (animate on variant change) ── */}
          <div className="lg:w-[52%] flex flex-col gap-3">
            <AnimatePresence mode="wait">
              <motion.div key={`img-${displayKey}`}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}>
                <div className="relative">
                  <div ref={imgRef}
                    className="relative overflow-hidden bg-[#F0EDE6] cursor-zoom-in w-full"
                    style={{ aspectRatio: "1/1" }}
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
                          className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 w-7 h-7 sm:w-10 sm:h-10 bg-white/85 hover:bg-white flex items-center justify-center shadow transition-colors">
                          <ChevronLeft className="w-4 h-4 text-[#0F0F0F]" />
                        </button>
                        <button onClick={e => { e.stopPropagation(); setSelectedImage(p => (p + 1) % dpImages.length); }}
                          className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 w-7 h-7 sm:w-10 sm:h-10 bg-white/85 hover:bg-white flex items-center justify-center shadow transition-colors">
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
          <div className="lg:w-[48%] flex flex-col mt-0 lg:mt-0">

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

                <h1 className="font-serif text-[1.55rem] sm:text-3xl md:text-4xl xl:text-5xl text-[#0F0F0F] leading-tight mb-4">
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
                <div className="flex items-end gap-2 sm:gap-4 mb-6 flex-wrap">
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
                  <button onClick={() => setShowSizeGuide(true)} className="text-[9px] tracking-[0.15em] uppercase text-[#D4AF37] underline underline-offset-2 font-semibold whitespace-nowrap">Size Guide</button>
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

            {/* ── Out of Stock: Notify Me ── */}
            {product.stock === 0 && <NotifyMeForm productId={productId} />}

            {/* ── CTAs ── */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-7">
              <button onClick={handleAddToCart} disabled={addToCart.isPending || product.stock === 0}
                className="flex-1 h-12 sm:h-14 bg-[#0F0F0F] hover:bg-[#1a1a1a] text-white text-[9px] sm:text-[10px] tracking-[0.22em] sm:tracking-[0.3em] uppercase font-bold transition-colors flex items-center justify-center gap-2 disabled:opacity-40">
                {addToCart.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : product.stock === 0 ? "Out of Stock" : "Add to Bag"}
              </button>
              <button onClick={handleWishlist}
                className={`w-full sm:w-14 h-12 sm:h-14 border flex items-center justify-center transition-all duration-200 ${isWishlisted ? "border-[#D4AF37] bg-[#D4AF37]/10" : "border-[#0F0F0F]/15 hover:border-[#D4AF37]"}`}>
                <Heart className={`w-4 h-4 sm:w-5 sm:h-5 transition-colors ${isWishlisted ? "text-[#D4AF37] fill-[#D4AF37]" : "text-[#0F0F0F]/50"}`} />
              </button>
              <button className="w-full sm:w-14 h-12 sm:h-14 border border-[#0F0F0F]/15 hover:border-[#D4AF37] flex items-center justify-center transition-colors">
                <Share2 className="w-4 h-4 text-[#0F0F0F]/50" />
              </button>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-[#0F0F0F]/8 pt-6 mb-7">
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
        <div className="mt-12 sm:mt-20 border-t border-[#0F0F0F]/8 pt-10 sm:pt-12">
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
                <div className="space-y-10">
                  {/* ── Rating summary + list ── */}
                  {reviews && reviews.length > 0 ? (
                    <div className="space-y-8">
                      <div className="flex flex-col sm:flex-row items-start gap-6 p-5 sm:p-6 bg-white border border-[#0F0F0F]/6">
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
                            const cnt = reviews.filter((r: { rating: number }) => r.rating === star).length;
                            return (
                              <div key={star} className="flex items-center gap-3">
                                <span className="text-[9px] text-[#0F0F0F]/40 w-4">{star}</span>
                                <div className="flex-1 h-1.5 bg-[#0F0F0F]/6">
                                  <div className="h-full bg-[#D4AF37]" style={{ width: `${reviews.length ? (cnt/reviews.length)*100 : 0}%` }} />
                                </div>
                                <span className="text-[9px] text-[#0F0F0F]/30 w-5">{cnt}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      {reviews.map((r: { id: number; userName?: string; rating: number; comment?: string; createdAt: string }, idx: number) => (
                        <div key={idx} className="border-b border-[#0F0F0F]/6 pb-8">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-8 h-8 rounded-full bg-[#D4AF37]/15 flex items-center justify-center text-[#D4AF37] font-bold text-sm">
                              {(r.userName || "A").charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-[#0F0F0F]/80 mb-0.5">{r.userName || "Anonymous"}</p>
                              <div className="flex">
                                {[1,2,3,4,5].map(s => <Star key={s} className={`w-3 h-3 ${s <= r.rating ? "text-[#D4AF37] fill-[#D4AF37]" : "text-[#D4AF37]/25"}`} />)}
                              </div>
                              <p className="text-[9px] text-[#0F0F0F]/30 mt-0.5">
                                {new Date(r.createdAt).toLocaleDateString("en-IN", { year: "numeric", month: "long" })}
                              </p>
                            </div>
                          </div>
                          <p className="text-sm text-[#0F0F0F]/65 leading-relaxed">{r.comment}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Star className="w-8 h-8 text-[#D4AF37]/30 mx-auto mb-4" />
                      <p className="font-serif text-xl text-[#0F0F0F]/40 mb-2">No reviews yet</p>
                      <p className="text-sm text-[#0F0F0F]/30">Be the first to review this piece.</p>
                    </div>
                  )}

                  {/* ── Write a Review form ── */}
                  <div className="border-t border-[#0F0F0F]/8 pt-10">
                    <h3 className="font-serif text-xl text-[#0F0F0F] mb-6">Write a Review</h3>
                    {reviewSubmitted ? (
                      <div className="flex flex-col items-center py-10 text-center">
                        <div className="w-12 h-12 rounded-full bg-[#D4AF37]/10 flex items-center justify-center mb-4">
                          <Star className="w-5 h-5 text-[#D4AF37] fill-[#D4AF37]" />
                        </div>
                        <p className="font-serif text-lg text-[#0F0F0F] mb-2">Thank you for your review!</p>
                        <p className="text-sm text-[#0F0F0F]/40 mb-6">Your feedback helps other customers.</p>
                        <button
                          onClick={() => { setReviewSubmitted(false); setReviewName(""); setReviewRating(0); setReviewComment(""); }}
                          className="text-[10px] tracking-[0.2em] uppercase text-[#D4AF37] hover:text-[#0F0F0F] transition-colors"
                        >
                          Write Another Review
                        </button>
                      </div>
                    ) : (
                      <form
                        onSubmit={e => {
                          e.preventDefault();
                          if (!reviewRating) { toast({ title: "Please select a star rating", variant: "destructive" }); return; }
                          if (!reviewComment.trim()) { toast({ title: "Please write a comment", variant: "destructive" }); return; }
                          createReview.mutate(
                            { id: productId, data: { rating: reviewRating, comment: reviewComment, userName: reviewName || "Anonymous" } },
                            {
                              onSuccess: () => {
                                queryClient.invalidateQueries({ queryKey: getGetProductReviewsQueryKey(productId) });
                                setReviewSubmitted(true);
                                toast({ title: "Review submitted!", description: "Thank you for your feedback." });
                              },
                              onError: () => toast({ title: "Failed to submit", description: "Please try again.", variant: "destructive" }),
                            }
                          );
                        }}
                        className="space-y-5 max-w-lg"
                      >
                        {/* Star selector */}
                        <div>
                          <p className="text-[10px] tracking-[0.2em] uppercase text-[#0F0F0F]/50 font-semibold mb-3">Your Rating *</p>
                          <div className="flex gap-1">
                            {[1,2,3,4,5].map(s => (
                              <button
                                key={s}
                                type="button"
                                onClick={() => setReviewRating(s)}
                                onMouseEnter={() => setReviewHover(s)}
                                onMouseLeave={() => setReviewHover(0)}
                                className="p-0.5 transition-transform hover:scale-110"
                              >
                                <Star className={`w-7 h-7 transition-colors ${s <= (reviewHover || reviewRating) ? "text-[#D4AF37] fill-[#D4AF37]" : "text-[#0F0F0F]/15"}`} />
                              </button>
                            ))}
                            {reviewRating > 0 && (
                              <span className="ml-2 text-xs text-[#0F0F0F]/40 self-center">
                                {["", "Poor", "Fair", "Good", "Very Good", "Excellent"][reviewRating]}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Name */}
                        <div>
                          <label className="text-[10px] tracking-[0.2em] uppercase text-[#0F0F0F]/50 font-semibold block mb-2">Your Name</label>
                          <input
                            type="text"
                            value={reviewName}
                            onChange={e => setReviewName(e.target.value)}
                            placeholder="e.g. Priya S."
                            maxLength={60}
                            className="w-full border border-[#0F0F0F]/12 rounded-none px-3 py-2.5 text-sm focus:outline-none focus:border-[#D4AF37] bg-white placeholder:text-[#0F0F0F]/25"
                          />
                        </div>

                        {/* Comment */}
                        <div>
                          <label className="text-[10px] tracking-[0.2em] uppercase text-[#0F0F0F]/50 font-semibold block mb-2">Your Review *</label>
                          <textarea
                            value={reviewComment}
                            onChange={e => setReviewComment(e.target.value)}
                            placeholder="What did you love about this piece?"
                            rows={4}
                            maxLength={1000}
                            required
                            className="w-full border border-[#0F0F0F]/12 rounded-none px-3 py-2.5 text-sm focus:outline-none focus:border-[#D4AF37] bg-white placeholder:text-[#0F0F0F]/25 resize-none"
                          />
                          <p className="text-[9px] text-[#0F0F0F]/25 mt-1 text-right">{reviewComment.length}/1000</p>
                        </div>

                        <button
                          type="submit"
                          disabled={createReview.isPending}
                          className="flex items-center gap-2 px-8 py-3 bg-[#0F0F0F] text-white text-[10px] tracking-[0.2em] uppercase font-semibold hover:bg-[#D4AF37] hover:text-[#0F0F0F] transition-colors disabled:opacity-50"
                        >
                          {createReview.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                          Submit Review
                        </button>
                      </form>
                    )}
                  </div>
                </div>
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

        {/* ════ RECENTLY VIEWED ════ */}
        {recentlyViewed.length > 0 && (
          <div className="mt-20 sm:mt-28 pt-14 sm:pt-16 border-t border-[#0F0F0F]/8">
            <div className="mb-8 sm:mb-10">
              <p className="text-[#D4AF37] text-[10px] tracking-[0.3em] uppercase font-semibold mb-2">Your Journey</p>
              <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl text-[#0F0F0F]">Recently Viewed</h2>
            </div>
            <div className="flex gap-4 sm:gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scroll-smooth" style={{ scrollbarWidth: "none" }}>
              {recentlyViewed.slice(0, 5).map((p, i) => {
                const img = p.images?.[0] || "https://images.unsplash.com/photo-1573408301185-9519f94815b5?auto=format&fit=crop&q=85&w=900";
                const price = Math.round(p.price * 83);
                const discPrice = p.discountPrice ? Math.round(p.discountPrice * 83) : null;
                return (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.07 }}
                    className="flex-shrink-0 w-44 sm:w-56 md:w-64 snap-start group"
                  >
                    <Link href={`/product/${p.id}`}>
                      <div className="relative overflow-hidden bg-[#F0EDE6]" style={{ aspectRatio: "3/4" }}>
                        <img
                          src={img}
                          alt={p.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      <div className="pt-3">
                        {p.category && (
                          <p className="text-[8px] tracking-[0.2em] uppercase text-[#D4AF37] font-semibold mb-1">{p.category}</p>
                        )}
                        <p className="font-serif text-sm sm:text-base text-[#0F0F0F] leading-snug line-clamp-2 mb-1.5">{p.name}</p>
                        <div className="flex items-center gap-2">
                          {discPrice ? (
                            <>
                              <span className="text-sm font-semibold text-[#0F0F0F]">₹{discPrice.toLocaleString("en-IN")}</span>
                              <span className="text-xs text-[#0F0F0F]/35 line-through">₹{price.toLocaleString("en-IN")}</span>
                            </>
                          ) : (
                            <span className="text-sm font-semibold text-[#0F0F0F]">₹{price.toLocaleString("en-IN")}</span>
                          )}
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

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

      <SizeGuideModal
        open={showSizeGuide}
        onClose={() => setShowSizeGuide(false)}
        defaultTab={
          product?.category?.toLowerCase().includes("ring") ? "ring"
          : product?.category?.toLowerCase().includes("bracelet") || product?.category?.toLowerCase().includes("bangle") ? "bracelet"
          : product?.category?.toLowerCase().includes("necklace") ? "necklace"
          : "ring"
        }
      />

      <Footer />
    </div>
  );
}
