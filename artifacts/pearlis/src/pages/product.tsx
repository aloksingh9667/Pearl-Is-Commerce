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

type Variant = { name: string; productId?: number };
type Tab = "Description" | "Specifications" | "Reviews" | "Shipping & Returns";

const TABS: Tab[] = ["Description", "Specifications", "Reviews", "Shipping & Returns"];

function parseVariants(input: unknown): Variant[] {
  if (!input) return [];
  if (Array.isArray(input)) return input.filter(Boolean).map((v: any) => ({ name: String(v?.name ?? v), productId: v?.productId ? Number(v.productId) : undefined }));
  if (typeof input === "string") {
    try {
      const parsed = JSON.parse(input);
      return parseVariants(parsed);
    } catch {
      return input.split(",").map(s => s.trim()).filter(Boolean).map(name => ({ name }));
    }
  }
  return [];
}

export default function ProductPage() {
  const [, params] = useRoute("/product/:id");
  const productId = Number(params?.id || 0);
  const { toast } = useToast();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<Tab>("Description");
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [reviewName, setReviewName] = useState("");
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewHover, setReviewHover] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [activeVariantIdx, setActiveVariantIdx] = useState<number | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const imgRef = useRef<HTMLDivElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const recentlyViewed = useRecentlyViewed(productId);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [isZoomed, setIsZoomed] = useState(false);

  const { data: product, isLoading } = useGetProduct(productId, { query: { enabled: !!productId, queryKey: ["product", productId] } });
  const { data: relatedProducts } = useGetRelatedProducts(productId, { query: { enabled: !!productId, queryKey: ["relatedProducts", productId] } });
  const { data: reviews } = useGetProductReviews(productId, { query: { enabled: !!productId, queryKey: ["productReviews", productId] } });
  const { data: wishlist } = useGetWishlist();
  const addToCart = useAddToCart();
  const addToWishlist = useAddToWishlist();
  const removeFromWishlist = useRemoveFromWishlist();
  const createReview = useCreateReview();

  useEffect(() => {
    if (product) recordView(product);
  }, [product]);

  const variants: Variant[] = product ? parseVariants((product as any).materialVariants) : [];
  const activeVariant = activeVariantIdx !== null ? variants[activeVariantIdx] : null;
  const linkedProductId = activeVariant?.productId ? Number(activeVariant.productId) : null;
  const { data: variantProduct, isFetching: variantFetching } = useGetProduct(linkedProductId ?? 0, { query: { enabled: !!linkedProductId, queryKey: ["variantProduct", linkedProductId] } });

  const dp = (variantProduct ?? product) as any;
  const dpImages = dp?.images?.length ? dp.images : ["https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=85&w=1600"];
  const dpPrice = Math.round((dp?.price ?? 0) * 83);
  const dpDiscountPrice = dp?.discountPrice ? Math.round(dp.discountPrice * 83) : null;
  const isWishlisted = wishlist?.some((w: any) => w.id === productId);
  const avgRating = reviews?.length ? reviews.reduce((s: number, r: { rating: number }) => s + r.rating, 0) / reviews.length : 0;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imgRef.current) return;
    const rect = imgRef.current.getBoundingClientRect();
    setZoomPos({ x: ((e.clientX - rect.left) / rect.width) * 100, y: ((e.clientY - rect.top) / rect.height) * 100 });
  };

  const handleAddToCart = () => {
    addToCart.mutate(
      { data: { productId, quantity, size: undefined } },
      { onSuccess: () => toast({ title: "Added to bag" }) }
    );
  };

  const handleWishlist = () => {
    if (isWishlisted) removeFromWishlist.mutate({ id: productId });
    else addToWishlist.mutate({ data: { productId } });
  };

  const scrollCarousel = (dir: "left" | "right") => {
    carouselRef.current?.scrollBy({ left: dir === "left" ? -320 : 320, behavior: "smooth" });
  };

  if (isLoading || !product) {
    return (
      <div className="min-h-screen bg-[#FAF8F3] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#D4AF37]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F3] flex flex-col overflow-x-hidden">
      <Navbar />
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 pt-10 sm:pt-14 pb-2 overflow-hidden w-full">
        <BackButton className="max-w-full" />
      </div>

      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 pb-14 sm:pb-20 w-full overflow-x-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12 items-start">
          <div className="min-w-0">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="min-w-0"
            >
              <div className="relative overflow-hidden rounded-2xl bg-[#F0EDE6] aspect-[4/5] sm:aspect-square">
                <div
                  ref={imgRef}
                  className="absolute inset-0 cursor-zoom-in"
                  onMouseEnter={() => setIsZoomed(true)}
                  onMouseLeave={() => setIsZoomed(false)}
                  onMouseMove={handleMouseMove}
                  onClick={() => setLightboxOpen(true)}
                >
                  {variantFetching && <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#F0EDE6]/80"><Loader2 className="w-6 h-6 animate-spin text-[#D4AF37]" /></div>}
                  <img
                    src={dpImages[selectedImage]}
                    alt={dp?.name || product.name}
                    className={`w-full h-full object-cover transition-transform duration-500 ${isZoomed ? "scale-110 sm:scale-125" : "scale-100"}`}
                    style={isZoomed ? { transformOrigin: `${zoomPos.x}% ${zoomPos.y}%` } : {}}
                    draggable={false}
                  />
                  {dpImages.length > 1 && (
                    <>
                      <button onClick={e => { e.stopPropagation(); setSelectedImage(p => (p - 1 + dpImages.length) % dpImages.length); }} className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 flex items-center justify-center shadow hover:scale-105 transition-transform">
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button onClick={e => { e.stopPropagation(); setSelectedImage(p => (p + 1) % dpImages.length); }} className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 flex items-center justify-center shadow hover:scale-105 transition-transform">
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
              {dpImages.length > 1 && (
                <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                  {dpImages.map((img: string, i: number) => (
                    <button key={i} onClick={() => setSelectedImage(i)} className={`flex-shrink-0 w-16 h-20 rounded-xl overflow-hidden border-2 ${selectedImage === i ? "border-[#D4AF37]" : "border-transparent"}`}>
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 text-[8px] sm:text-[9px] tracking-[0.18em] uppercase text-[#0F0F0F]/35 min-w-0 mb-3">
              <Link href="/" className="hover:text-[#D4AF37] transition-colors">Home</Link>
              <span>/</span>
              <Link href="/shop" className="hover:text-[#D4AF37] transition-colors">Shop</Link>
              {product.category && <><span>/</span><Link href={`/category/${product.category}`} className="hover:text-[#D4AF37] transition-colors capitalize">{product.category}</Link></>}
              <span>/</span>
              <span className="text-[#0F0F0F]/60 truncate max-w-[12rem] sm:max-w-[26rem]">{product.name}</span>
            </div>

            <div className="flex items-center gap-2.5 mb-3 flex-wrap min-w-0">
              {product.category && <Link href={`/category/${product.category}`} className="flex items-center gap-1.5 text-[9px] tracking-[0.3em] uppercase text-[#D4AF37] font-semibold hover:underline underline-offset-2"><Tag className="w-3 h-3" />{product.category}</Link>}
              {product.stock < 5 && product.stock > 0 && <span className="text-[9px] tracking-[0.15em] uppercase bg-red-50 text-red-600 px-2 py-0.5 font-semibold">Only {product.stock} left</span>}
              {product.stock === 0 && <span className="text-[9px] tracking-[0.15em] uppercase bg-[#0F0F0F]/5 text-[#0F0F0F]/50 px-2 py-0.5 font-semibold">Made to Order</span>}
            </div>

            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="min-w-0">
              <h1 className="font-serif text-[1.35rem] sm:text-3xl md:text-4xl xl:text-5xl text-[#0F0F0F] leading-tight mb-4 break-words">{dp?.name || product.name}</h1>
              {reviews && reviews.length > 0 && (
                <div className="flex items-center gap-2 mb-4 flex-wrap min-w-0">
                  <div className="flex">{[1,2,3,4,5].map(s => <Star key={s} className={`w-3.5 h-3.5 ${s <= Math.round(avgRating) ? "text-[#D4AF37] fill-[#D4AF37]" : "text-[#D4AF37]/30"}`} />)}</div>
                  <span className="text-[10px] text-[#0F0F0F]/50 tracking-wide">{avgRating.toFixed(1)} · {reviews.length} review{reviews.length !== 1 ? "s" : ""}</span>
                </div>
              )}
              <div className="w-12 h-px bg-[#D4AF37] mb-5" />
              <div className="flex flex-wrap items-end gap-2 sm:gap-4 mb-6 min-w-0">
                {dpDiscountPrice ? (
                  <>
                    <span className="font-serif text-2xl sm:text-3xl text-[#0F0F0F]">{INR(dpDiscountPrice)}</span>
                    <span className="text-base sm:text-lg text-[#0F0F0F]/30 line-through pb-0.5">{INR(dpPrice)}</span>
                    <span className="text-[10px] tracking-[0.15em] uppercase bg-[#D4AF37]/15 text-[#D4AF37] px-2 py-1 font-bold rounded-full">Save {Math.round((1 - dpDiscountPrice / dpPrice) * 100)}%</span>
                  </>
                ) : (
                  <span className="font-serif text-2xl sm:text-3xl text-[#0F0F0F]">{INR(dpPrice)}</span>
                )}
              </div>
            </motion.div>

            {variants.length > 0 && (
              <div className="mb-6 min-w-0">
                <p className="text-[9px] tracking-[0.25em] uppercase text-[#0F0F0F]/50 font-semibold mb-3">Material:&nbsp;<span className="text-[#0F0F0F]">{activeVariantIdx !== null ? variants[activeVariantIdx].name : variants[0].name}</span></p>
                <div className="flex flex-wrap gap-2 min-w-0">
                  {variants.map((v, i) => {
                    const isActive = activeVariantIdx === i || (activeVariantIdx === null && i === 0);
                    return (
                      <button key={i} onClick={() => setActiveVariantIdx(i === 0 && activeVariantIdx === null ? null : i)} className={`relative px-2.5 sm:px-3 py-1.5 sm:py-2 text-[9px] sm:text-[10px] tracking-[0.1em] sm:tracking-[0.15em] uppercase font-medium border transition-all duration-200 rounded-full ${isActive ? "border-[#D4AF37] bg-[#D4AF37]/8 text-[#0F0F0F]" : "border-[#0F0F0F]/15 text-[#0F0F0F]/50 hover:border-[#D4AF37]/60 hover:text-[#0F0F0F]"}`}>
                        {v.name}
                        {v.productId && <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#D4AF37]" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="mb-6 min-w-0">
              <div className="flex items-center justify-between mb-3 gap-2 min-w-0">
                <p className="text-[9px] tracking-[0.25em] uppercase text-[#0F0F0F]/50 font-semibold">{product.category?.toLowerCase().includes("ring") ? "Ring Size" : "Size"}: <span className="text-[#0F0F0F]">{selectedSize ?? "Select"}</span></p>
                <button onClick={() => setShowSizeGuide(true)} className="text-[9px] tracking-[0.15em] uppercase text-[#D4AF37] underline underline-offset-2 font-semibold whitespace-nowrap">Size Guide</button>
              </div>
              <div className="flex flex-wrap gap-2 min-w-0">
                {(product as any).sizes?.length ? (product as any).sizes.map((s: string) => <button key={s} onClick={() => setSelectedSize(s)} className={`w-10 h-10 text-xs font-medium border rounded-full transition-all duration-200 ${selectedSize === s ? "border-[#D4AF37] bg-[#D4AF37] text-white" : "border-[#0F0F0F]/15 text-[#0F0F0F]/60 hover:border-[#D4AF37]/60"}`}>{s}</button>) : <button className="w-10 h-10 text-xs font-medium border rounded-full border-[#0F0F0F]/15 text-[#0F0F0F]/40">—</button>}
              </div>
            </div>

            <div className="mb-6 min-w-0">
              <p className="text-[9px] tracking-[0.25em] uppercase text-[#0F0F0F]/50 font-semibold mb-3">Quantity</p>
              <div className="flex items-center border border-[#0F0F0F]/15 w-full sm:w-fit rounded-full overflow-hidden">
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="w-11 h-11 flex items-center justify-center hover:bg-[#0F0F0F]/5 transition-colors"><Minus className="w-3.5 h-3.5 text-[#0F0F0F]" /></button>
                <span className="flex-1 sm:w-12 h-11 flex items-center justify-center font-medium text-[#0F0F0F] text-sm border-x border-[#0F0F0F]/15">{quantity}</span>
                <button onClick={() => setQuantity(q => Math.min(product.stock || 10, q + 1))} className="w-11 h-11 flex items-center justify-center hover:bg-[#0F0F0F]/5 transition-colors"><Plus className="w-3.5 h-3.5 text-[#0F0F0F]" /></button>
              </div>
            </div>

            {product.stock === 0 && <div className="mb-6"> <button className="w-full h-12 rounded-full bg-[#D4AF37] text-white uppercase tracking-[0.2em] text-[10px] font-bold">Notify Me</button></div>}

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-7 min-w-0">
              <button onClick={handleAddToCart} disabled={addToCart.isPending || product.stock === 0} className="w-full min-h-14 sm:min-h-14 rounded-full bg-[#0F0F0F] hover:bg-[#1a1a1a] text-white text-[10px] sm:text-[10px] tracking-[0.2em] sm:tracking-[0.3em] uppercase font-bold transition-all duration-300 flex items-center justify-center gap-2 px-5 py-4 sm:py-0 disabled:opacity-40 hover:shadow-[0_12px_24px_rgba(15,15,15,0.15)]">{addToCart.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : product.stock === 0 ? "Out of Stock" : "Add to Bag"}</button>
              <div className="grid grid-cols-2 gap-2 sm:contents">
                <button onClick={handleWishlist} className={`w-full sm:w-14 min-h-14 sm:min-h-14 rounded-full border flex items-center justify-center transition-all duration-300 ${isWishlisted ? "border-[#D4AF37] bg-[#D4AF37]/10 shadow-[0_10px_22px_rgba(212,175,55,0.15)]" : "border-[#0F0F0F]/15 hover:border-[#D4AF37]"}`}><Heart className={`w-4 h-4 sm:w-5 sm:h-5 transition-colors ${isWishlisted ? "text-[#D4AF37] fill-[#D4AF37]" : "text-[#0F0F0F]/50"}`} /></button>
                <button className="w-full sm:w-14 min-h-14 sm:min-h-14 rounded-full border border-[#0F0F0F]/15 hover:border-[#D4AF37] flex items-center justify-center transition-all duration-300 hover:shadow-[0_10px_22px_rgba(15,15,15,0.08)]"><Share2 className="w-4 h-4 text-[#0F0F0F]/50" /></button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-[#0F0F0F]/8 pt-6 mb-7 min-w-0">
              {[
                { icon: Truck, label: "Free Shipping", sub: "Above ₹5,000" },
                { icon: ShieldCheck, label: "Certified", sub: "BIS Hallmarked" },
                { icon: RefreshCcw, label: "30-Day Returns", sub: "Hassle-free" },
              ].map(({ icon: Icon, label, sub }) => (
                <div key={label} className="flex flex-col items-center text-center gap-1.5 min-w-0">
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-[#D4AF37]" />
                  <div>
                    <p className="text-[8px] sm:text-[9px] tracking-[0.12em] sm:tracking-[0.15em] uppercase font-semibold text-[#0F0F0F] break-words">{label}</p>
                    <p className="text-[8px] sm:text-[9px] text-[#0F0F0F]/40 mt-0.5 break-words">{sub}</p>
                  </div>
                </div>
              ))}
            </div>

            {product.material && <div className="flex items-center gap-2 text-[10px] text-[#0F0F0F]/40 min-w-0"><Award className="w-3.5 h-3.5 text-[#D4AF37]" /><span className="break-words">Base material: {product.material}</span></div>}
          </div>
        </div>

        <div className="mt-12 sm:mt-20 border-t border-[#0F0F0F]/8 pt-10 sm:pt-12 min-w-0">
          <div className="flex gap-0 border-b border-[#0F0F0F]/8 mb-10 sm:mb-12 overflow-x-auto max-w-full">
            {TABS.map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`relative px-3 sm:px-6 py-4 text-[9px] sm:text-[10px] tracking-[0.15em] sm:tracking-[0.2em] uppercase font-semibold whitespace-nowrap transition-colors ${activeTab === tab ? "text-[#0F0F0F]" : "text-[#0F0F0F]/35 hover:text-[#0F0F0F]/70"}`}>
                {tab}
                {activeTab === tab && <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#D4AF37]" />}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={`${activeTab}-${selectedImage}`} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }} className="max-w-3xl min-w-0">
              {activeTab === "Description" && (
                <div className="space-y-4 text-[#0F0F0F]/65 leading-relaxed text-sm min-w-0 break-words">
                  {dp?.description && <p>{dp.description}</p>}
                  {dp?.craftStory ? <p>{dp.craftStory}</p> : <p>Each Pearlis piece is handcrafted by master artisans with decades of experience, combining traditional Indian jewellery techniques with contemporary design sensibilities.</p>}
                  <ul className="space-y-2 mt-6 list-none min-w-0">
                    {(dp?.craftPoints?.length ? dp.craftPoints : ["Handcrafted by certified artisans", "BIS Hallmarked for purity assurance", "Ethically sourced gemstones", "Comes in a Pearlis signature gift box", "Certificate of authenticity included"]).map((pt: string) => <li key={pt} className="flex items-start gap-3 text-[11px] tracking-wide min-w-0"><span className="w-1 h-1 rounded-full bg-[#D4AF37] flex-shrink-0 mt-1.5" />{pt}</li>)}
                  </ul>
                </div>
              )}
              {activeTab === "Specifications" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-0 min-w-0">
                  {((dp?.specifications?.length > 0 ? dp.specifications : [
                    { key: "Metal", value: activeVariant?.name || product.material || "Precious Metal" },
                    { key: "Category", value: product.category },
                    { key: "Stock", value: product.stock > 0 ? `${product.stock} units available` : "Made to Order (4–6 weeks)" },
                    { key: "SKU", value: `PRL-${String(product.id).padStart(5, "0")}` },
                    { key: "Weight", value: "Approx. 4–7g" },
                    { key: "Finish", value: "High Polish" },
                  ]).map(({ key: k, value: v }: { key: string; value: string }) => <div key={k} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1 py-3 sm:py-4 border-b border-[#0F0F0F]/6 min-w-0"><span className="text-[10px] tracking-[0.15em] uppercase text-[#0F0F0F]/40 font-semibold">{k}</span><span className="text-sm text-[#0F0F0F]/80 font-medium break-words text-right sm:text-left">{v}</span></div>))}
                </div>
              )}
              {activeTab === "Reviews" && (
                <div className="space-y-10">
                  {reviews && reviews.length > 0 ? (
                    <div className="space-y-8 min-w-0">
                      <div className="flex flex-col sm:flex-row items-start gap-6 p-5 sm:p-6 bg-white border border-[#0F0F0F]/6 min-w-0 rounded-2xl">
                        <div className="text-center flex sm:flex-col items-center gap-3 sm:gap-0 min-w-0">
                          <p className="font-serif text-4xl sm:text-5xl text-[#0F0F0F]">{avgRating.toFixed(1)}</p>
                          <div>
                            <div className="flex justify-center mt-2 mb-1">{[1,2,3,4,5].map(s => <Star key={s} className={`w-3.5 h-3.5 ${s <= Math.round(avgRating) ? "text-[#D4AF37] fill-[#D4AF37]" : "text-[#D4AF37]/25"}`} />)}</div>
                            <p className="text-[9px] tracking-[0.15em] uppercase text-[#0F0F0F]/40">{reviews.length} reviews</p>
                          </div>
                        </div>
                        <div className="flex-1 w-full space-y-1.5 min-w-0">
                          {[5,4,3,2,1].map(star => {
                            const cnt = reviews.filter((r: { rating: number }) => r.rating === star).length;
                            return <div key={star} className="flex items-center gap-3 min-w-0"><span className="text-[9px] text-[#0F0F0F]/40 w-4">{star}</span><div className="flex-1 h-1.5 bg-[#0F0F0F]/6 overflow-hidden rounded-full"><div className="h-full bg-[#D4AF37]" style={{ width: `${reviews.length ? (cnt / reviews.length) * 100 : 0}%` }} /></div><span className="text-[9px] text-[#0F0F0F]/30 w-5">{cnt}</span></div>;
                          })}
                        </div>
                      </div>
                      {reviews.map((r: { id: number; userName?: string; rating: number; comment?: string; createdAt: string }, idx: number) => (
                        <div key={idx} className="border-b border-[#0F0F0F]/6 pb-8 min-w-0">
                          <div className="flex items-center gap-2 mb-3 min-w-0">
                            <div className="w-8 h-8 rounded-full bg-[#D4AF37]/15 flex items-center justify-center text-[#D4AF37] font-bold text-sm">{(r.userName || "A").charAt(0).toUpperCase()}</div>
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-[#0F0F0F]/80 mb-0.5 truncate">{r.userName || "Anonymous"}</p>
                              <div className="flex">{[1,2,3,4,5].map(s => <Star key={s} className={`w-3 h-3 ${s <= r.rating ? "text-[#D4AF37] fill-[#D4AF37]" : "text-[#D4AF37]/25"}`} />)}</div>
                              <p className="text-[9px] text-[#0F0F0F]/30 mt-0.5">{new Date(r.createdAt).toLocaleDateString("en-IN", { year: "numeric", month: "long" })}</p>
                            </div>
                          </div>
                          <p className="text-sm text-[#0F0F0F]/65 leading-relaxed break-words">{r.comment}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 min-w-0">
                      <Star className="w-8 h-8 text-[#D4AF37]/30 mx-auto mb-4" />
                      <p className="font-serif text-xl text-[#0F0F0F]/40 mb-2">No reviews yet</p>
                      <p className="text-sm text-[#0F0F0F]/30">Be the first to review this piece.</p>
                    </div>
                  )}

                  <div className="border-t border-[#0F0F0F]/8 pt-10">
                    <h3 className="font-serif text-xl text-[#0F0F0F] mb-6">Write a Review</h3>
                    {reviewSubmitted ? (
                      <div className="flex flex-col items-center py-10 text-center min-w-0">
                        <div className="w-12 h-12 rounded-full bg-[#D4AF37]/10 flex items-center justify-center mb-4"><Star className="w-5 h-5 text-[#D4AF37] fill-[#D4AF37]" /></div>
                        <p className="font-serif text-lg text-[#0F0F0F] mb-2">Thank you for your review!</p>
                        <p className="text-sm text-[#0F0F0F]/40 mb-6">Your feedback helps other customers.</p>
                        <button onClick={() => { setReviewSubmitted(false); setReviewName(""); setReviewRating(0); setReviewComment(""); }} className="text-[10px] tracking-[0.2em] uppercase text-[#D4AF37] hover:text-[#0F0F0F] transition-colors">Write Another Review</button>
                      </div>
                    ) : (
                      <form onSubmit={e => { e.preventDefault(); if (!reviewRating) { toast({ title: "Please select a star rating", variant: "destructive" }); return; } if (!reviewComment.trim()) { toast({ title: "Please write a comment", variant: "destructive" }); return; } createReview.mutate({ id: productId, data: { rating: reviewRating, comment: reviewComment, userName: reviewName || "Anonymous" } }, { onSuccess: () => { queryClient.invalidateQueries({ queryKey: getGetProductReviewsQueryKey(productId) }); setReviewSubmitted(true); toast({ title: "Review submitted!", description: "Thank you for your feedback." }); }, onError: () => toast({ title: "Failed to submit", description: "Please try again.", variant: "destructive" }) }); }} className="space-y-5 max-w-lg w-full min-w-0">
                        <div>
                          <p className="text-[10px] tracking-[0.2em] uppercase text-[#0F0F0F]/50 font-semibold mb-3">Your Rating *</p>
                          <div className="flex gap-1 flex-wrap">{[1,2,3,4,5].map(s => <button key={s} type="button" onClick={() => setReviewRating(s)} onMouseEnter={() => setReviewHover(s)} onMouseLeave={() => setReviewHover(0)} className="p-0.5 transition-transform hover:scale-110"><Star className={`w-7 h-7 transition-colors ${s <= (reviewHover || reviewRating) ? "text-[#D4AF37] fill-[#D4AF37]" : "text-[#0F0F0F]/15"}`} /></button>)}{reviewRating > 0 && <span className="ml-2 text-xs text-[#0F0F0F]/40 self-center">{["", "Poor", "Fair", "Good", "Very Good", "Excellent"][reviewRating]}</span>}</div>
                        </div>
                        <div>
                          <label className="text-[10px] tracking-[0.2em] uppercase text-[#0F0F0F]/50 font-semibold block mb-2">Your Name</label>
                          <input type="text" value={reviewName} onChange={e => setReviewName(e.target.value)} placeholder="e.g. Priya S." maxLength={60} className="w-full border border-[#0F0F0F]/12 rounded-none px-3 py-2.5 text-sm focus:outline-none focus:border-[#D4AF37] bg-white placeholder:text-[#0F0F0F]/25" />
                        </div>
                        <div>
                          <label className="text-[10px] tracking-[0.2em] uppercase text-[#0F0F0F]/50 font-semibold block mb-2">Your Review *</label>
                          <textarea value={reviewComment} onChange={e => setReviewComment(e.target.value)} placeholder="What did you love about this piece?" rows={4} maxLength={1000} required className="w-full border border-[#0F0F0F]/12 rounded-none px-3 py-2.5 text-sm focus:outline-none focus:border-[#D4AF37] bg-white placeholder:text-[#0F0F0F]/25 resize-none" />
                          <p className="text-[9px] text-[#0F0F0F]/25 mt-1 text-right">{reviewComment.length}/1000</p>
                        </div>
                        <button type="submit" disabled={createReview.isPending} className="flex items-center gap-2 px-8 py-3 bg-[#0F0F0F] text-white text-[10px] tracking-[0.2em] uppercase font-semibold hover:bg-[#D4AF37] hover:text-[#0F0F0F] transition-colors disabled:opacity-50 rounded-full">{createReview.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}Submit Review</button>
                      </form>
                    )}
                  </div>
                </div>
              )}
              {activeTab === "Shipping & Returns" && (
                <div className="space-y-7 text-sm text-[#0F0F0F]/65 leading-relaxed min-w-0 break-words">
                  {(dp?.shippingInfo ? dp.shippingInfo.split(/\n\n+/).map((block: string, i: number) => { const lines = block.trim().split("\n"); return <div key={i}><h4 className="text-[10px] tracking-[0.2em] uppercase font-bold text-[#0F0F0F] mb-2">{lines[0]}</h4>{lines.slice(1).join(" ").trim() && <p>{lines.slice(1).join(" ").trim()}</p>}</div>; }) : [
                    { title: "Free Standard Shipping", body: "Complimentary shipping on all orders above ₹5,000 across India. Standard delivery takes 5–7 business days. Tracked and fully insured." },
                    { title: "Express Delivery", body: "Need it sooner? Express delivery (2–3 business days) is available for ₹299. Available in all major metros." },
                    { title: "International Shipping", body: "We ship worldwide. International orders are delivered in 10–15 business days via DHL Express. Duties and taxes may apply." },
                    { title: "Easy 30-Day Returns", body: "Not in love with your purchase? Return it within 30 days in original, unworn condition. We'll arrange a free pickup and process your refund within 5–7 business days." },
                  ].map(({ title, body }) => <div key={title}><h4 className="text-[10px] tracking-[0.2em] uppercase font-bold text-[#0F0F0F] mb-2">{title}</h4><p>{body}</p></div>))}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {recentlyViewed.length > 0 && (
          <div className="mt-20 sm:mt-28 pt-14 sm:pt-16 border-t border-[#0F0F0F]/8 min-w-0">
            <div className="mb-8 sm:mb-10"><p className="text-[#D4AF37] text-[10px] tracking-[0.3em] uppercase font-semibold mb-2">Your Journey</p><h2 className="font-serif text-2xl sm:text-3xl md:text-4xl text-[#0F0F0F]">Recently Viewed</h2></div>
            <div className="flex gap-4 sm:gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scroll-smooth max-w-full" style={{ scrollbarWidth: "none" }}>
              {recentlyViewed.slice(0, 5).map((p, i) => {
                const img = p.images?.[0] || "https://images.unsplash.com/photo-1573408301185-9519f94815b5?auto=format&fit=crop&q=85&w=900";
                const price = Math.round(p.price * 83);
                const discPrice = p.discountPrice ? Math.round(p.discountPrice * 83) : null;
                return (
                  <motion.div key={p.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: i * 0.07 }} className="flex-shrink-0 w-40 sm:w-56 md:w-64 snap-start group min-w-0">
                    <Link href={`/product/${p.id}`}>
                      <div className="relative overflow-hidden bg-[#F0EDE6] rounded-2xl" style={{ aspectRatio: "3/4" }}>
                        <img src={img} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      </div>
                      <div className="pt-3">
                        {p.category && <p className="text-[8px] tracking-[0.2em] uppercase text-[#D4AF37] font-semibold mb-1">{p.category}</p>}
                        <p className="font-serif text-sm sm:text-base text-[#0F0F0F] leading-snug line-clamp-2 mb-1.5 break-words">{p.name}</p>
                        <div className="flex items-center gap-2">{discPrice ? <><span className="text-sm font-semibold text-[#0F0F0F]">₹{discPrice.toLocaleString("en-IN")}</span><span className="text-xs text-[#0F0F0F]/35 line-through">₹{price.toLocaleString("en-IN")}</span></> : <span className="text-sm font-semibold text-[#0F0F0F]">₹{price.toLocaleString("en-IN")}</span>}</div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {relatedProducts && relatedProducts.length > 0 && (
          <div className="mt-20 sm:mt-28 pt-14 sm:pt-16 border-t border-[#0F0F0F]/8 min-w-0">
            <div className="flex items-end justify-between mb-8 sm:mb-10 flex-wrap gap-4">
              <div><p className="text-[#D4AF37] text-[10px] tracking-[0.3em] uppercase font-semibold mb-2">Curated For You</p><h2 className="font-serif text-2xl sm:text-3xl md:text-4xl text-[#0F0F0F]">You May Also Love</h2></div>
              <div className="hidden md:flex gap-2"><button onClick={() => scrollCarousel("left")} className="w-10 h-10 rounded-full border border-[#0F0F0F]/15 hover:border-[#D4AF37] flex items-center justify-center transition-colors"><ChevronLeft className="w-4 h-4" /></button><button onClick={() => scrollCarousel("right")} className="w-10 h-10 rounded-full border border-[#0F0F0F]/15 hover:border-[#D4AF37] flex items-center justify-center transition-colors"><ChevronRight className="w-4 h-4" /></button></div>
            </div>
            <div ref={carouselRef} className="flex gap-4 sm:gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scroll-smooth max-w-full" style={{ scrollbarWidth: "none" }}>
              {relatedProducts.map((p: Parameters<typeof ProductCard>[0]["product"], i: number) => <div key={p.id} className="flex-shrink-0 w-40 sm:w-56 md:w-64 snap-start min-w-0"><ProductCard product={p} index={i} /></div>)}
            </div>
          </div>
        )}
      </section>

      <AnimatePresence>
        {lightboxOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setLightboxOpen(false)} className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center px-4">
            <motion.img initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.85, opacity: 0 }} src={dpImages[selectedImage]} alt={dp?.name} className="max-h-[90vh] max-w-[90vw] object-contain" onClick={e => e.stopPropagation()} />
            <button onClick={() => setLightboxOpen(false)} className="absolute top-6 right-6 text-white/60 hover:text-white text-[11px] tracking-[0.2em] uppercase">✕ Close</button>
          </motion.div>
        )}
      </AnimatePresence>

      <SizeGuideModal open={showSizeGuide} onClose={() => setShowSizeGuide(false)} defaultTab={product?.category?.toLowerCase().includes("ring") ? "ring" : product?.category?.toLowerCase().includes("bracelet") || product?.category?.toLowerCase().includes("bangle") ? "bracelet" : product?.category?.toLowerCase().includes("necklace") ? "necklace" : "ring"} />
      <Footer />
    </div>
  );
}
