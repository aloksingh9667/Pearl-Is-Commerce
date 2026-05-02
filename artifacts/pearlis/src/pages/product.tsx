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
} from "lucide-react";

const INR = (n: number) =>
  "₹" + Math.round(n).toLocaleString("en-IN");

const RING_SIZES = ["5", "6", "7", "8", "9", "10", "11", "12"];
const MATERIALS = ["14K Yellow Gold", "18K Yellow Gold", "18K White Gold", "Platinum"];

const TABS = ["Description", "Specifications", "Reviews", "Shipping & Returns"] as const;
type Tab = (typeof TABS)[number];

export default function ProductDetail() {
  const [, params] = useRoute("/product/:id");
  const productId = parseInt(params?.id || "0");
  const { toast } = useToast();

  /* ─── state ─── */
  const [selectedImage, setSelectedImage] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedMaterial, setSelectedMaterial] = useState(MATERIALS[0]);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<Tab>("Description");
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);

  /* ─── data ─── */
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

  /* ─── handlers ─── */
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imgRef.current) return;
    const rect = imgRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({ x, y });
  };

  const handleAddToCart = () => {
    if (!product) return;
    addToCart.mutate(
      { data: { productId: product.id, quantity } },
      {
        onSuccess: () => {
          toast({
            title: "Added to bag",
            description: `${product.name} × ${quantity} added to your shopping bag.`,
          });
        },
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
        {
          onSuccess: () =>
            toast({ title: "Saved to wishlist", description: product?.name }),
        }
      );
    }
  };

  const scrollCarousel = (dir: "left" | "right") => {
    if (!carouselRef.current) return;
    carouselRef.current.scrollBy({ left: dir === "right" ? 320 : -320, behavior: "smooth" });
  };

  /* ─── loading / not found ─── */
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

  const images = product.images?.length ? product.images : ["https://images.unsplash.com/photo-1573408301185-9519f94815b5?auto=format&fit=crop&q=85&w=900"];
  const price = product.price * 83;
  const discountPrice = product.discountPrice ? product.discountPrice * 83 : null;

  return (
    <div className="min-h-screen bg-[#FAF8F3] flex flex-col">
      <Navbar />
      <div style={{ height: "100px" }} />

      {/* ── Breadcrumb ── */}
      <div className="max-w-[1440px] mx-auto px-6 py-4">
        <nav className="flex items-center gap-2 text-[10px] tracking-[0.2em] uppercase text-[#0F0F0F]/40">
          <Link href="/" className="hover:text-[#D4AF37] transition-colors">Home</Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-[#D4AF37] transition-colors">Shop</Link>
          <span>/</span>
          <span className="text-[#0F0F0F]/70">{product.name}</span>
        </nav>
      </div>

      {/* ════════════════ MAIN PRODUCT SECTION ════════════════ */}
      <section className="max-w-[1440px] mx-auto px-6 pb-24">
        <div className="flex flex-col lg:flex-row gap-12 xl:gap-20">

          {/* ──────────── LEFT: Image Gallery ──────────── */}
          <div className="lg:w-[52%] flex flex-col-reverse md:flex-row gap-4">

            {/* Thumbnails */}
            <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto md:max-h-[620px] pb-2 md:pb-0 md:pr-1 flex-shrink-0">
              {images.map((img: string, i: number) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`flex-shrink-0 w-16 h-20 md:w-20 md:h-24 overflow-hidden border-2 transition-all duration-200 ${
                    selectedImage === i
                      ? "border-[#D4AF37]"
                      : "border-transparent hover:border-[#D4AF37]/40"
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>

            {/* Main image with zoom */}
            <div className="flex-1 relative">
              <div
                ref={imgRef}
                className="relative overflow-hidden aspect-[4/5] bg-[#F0EDE6] cursor-zoom-in"
                onMouseEnter={() => setIsZoomed(true)}
                onMouseLeave={() => setIsZoomed(false)}
                onMouseMove={handleMouseMove}
                onClick={() => setLightboxOpen(true)}
              >
                <img
                  src={images[selectedImage]}
                  alt={product.name}
                  className={`w-full h-full object-cover transition-transform duration-200 ${
                    isZoomed ? "scale-150" : "scale-100"
                  }`}
                  style={
                    isZoomed
                      ? { transformOrigin: `${zoomPos.x}% ${zoomPos.y}%` }
                      : {}
                  }
                  draggable={false}
                />
                {/* Zoom hint */}
                {!isZoomed && (
                  <div className="absolute bottom-4 right-4 flex items-center gap-1.5 bg-white/80 backdrop-blur-sm px-3 py-1.5 text-[9px] tracking-[0.2em] uppercase text-[#0F0F0F]/60 font-medium">
                    <ZoomIn className="w-3 h-3" /> Hover to zoom
                  </div>
                )}
                {/* prev/next arrows */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={(e) => { e.stopPropagation(); setSelectedImage((p) => (p - 1 + images.length) % images.length); }}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 hover:bg-white flex items-center justify-center shadow transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4 text-[#0F0F0F]" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setSelectedImage((p) => (p + 1) % images.length); }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 hover:bg-white flex items-center justify-center shadow transition-colors"
                    >
                      <ChevronRight className="w-4 h-4 text-[#0F0F0F]" />
                    </button>
                  </>
                )}
              </div>

              {/* Image counter */}
              <p className="text-center text-[9px] tracking-[0.2em] uppercase text-[#0F0F0F]/30 mt-3">
                {selectedImage + 1} / {images.length}
              </p>
            </div>
          </div>

          {/* ──────────── RIGHT: Product Info ──────────── */}
          <div className="lg:w-[48%] flex flex-col">

            {/* Category + badges */}
            <div className="flex items-center gap-3 mb-4">
              <span className="text-[9px] tracking-[0.3em] uppercase text-[#D4AF37] font-semibold">{product.category}</span>
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
            <h1 className="font-serif text-3xl md:text-4xl xl:text-5xl text-[#0F0F0F] leading-tight mb-4">
              {product.name}
            </h1>

            {/* Rating */}
            {reviews && reviews.length > 0 && (
              <div className="flex items-center gap-2 mb-5">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`w-3.5 h-3.5 ${s <= Math.round(avgRating) ? "text-[#D4AF37] fill-[#D4AF37]" : "text-[#D4AF37]/30"}`}
                    />
                  ))}
                </div>
                <span className="text-[10px] text-[#0F0F0F]/50 tracking-wide">
                  {avgRating.toFixed(1)} · {reviews.length} review{reviews.length !== 1 ? "s" : ""}
                </span>
              </div>
            )}

            {/* Divider */}
            <div className="w-12 h-px bg-[#D4AF37] mb-6" />

            {/* Price */}
            <div className="flex items-end gap-4 mb-8">
              {discountPrice ? (
                <>
                  <span className="font-serif text-3xl text-[#0F0F0F]">{INR(discountPrice)}</span>
                  <span className="text-lg text-[#0F0F0F]/30 line-through pb-0.5">{INR(price)}</span>
                  <span className="text-[10px] tracking-[0.15em] uppercase bg-[#D4AF37]/15 text-[#D4AF37] px-2 py-1 font-bold pb-0.5">
                    Save {Math.round((1 - discountPrice / price) * 100)}%
                  </span>
                </>
              ) : (
                <span className="font-serif text-3xl text-[#0F0F0F]">{INR(price)}</span>
              )}
            </div>

            {/* Material selector */}
            <div className="mb-7">
              <p className="text-[9px] tracking-[0.25em] uppercase text-[#0F0F0F]/50 font-semibold mb-3">
                Material: <span className="text-[#0F0F0F]">{selectedMaterial}</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {MATERIALS.map((m) => (
                  <button
                    key={m}
                    onClick={() => setSelectedMaterial(m)}
                    className={`px-3 py-2 text-[10px] tracking-[0.15em] uppercase font-medium border transition-all duration-200 ${
                      selectedMaterial === m
                        ? "border-[#D4AF37] bg-[#D4AF37]/8 text-[#0F0F0F]"
                        : "border-[#0F0F0F]/15 text-[#0F0F0F]/50 hover:border-[#D4AF37]/60 hover:text-[#0F0F0F]"
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* Size selector (for rings) */}
            {product.category?.toLowerCase().includes("ring") && (
              <div className="mb-7">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[9px] tracking-[0.25em] uppercase text-[#0F0F0F]/50 font-semibold">
                    Ring Size: <span className="text-[#0F0F0F]">{selectedSize ?? "Select"}</span>
                  </p>
                  <button className="text-[9px] tracking-[0.15em] uppercase text-[#D4AF37] underline underline-offset-2 font-semibold">
                    Size Guide
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {RING_SIZES.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSelectedSize(s)}
                      className={`w-10 h-10 text-sm font-medium border transition-all duration-200 ${
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
            <div className="mb-8">
              <p className="text-[9px] tracking-[0.25em] uppercase text-[#0F0F0F]/50 font-semibold mb-3">Quantity</p>
              <div className="flex items-center border border-[#0F0F0F]/15 w-fit">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-11 h-11 flex items-center justify-center hover:bg-[#0F0F0F]/5 transition-colors"
                >
                  <Minus className="w-3.5 h-3.5 text-[#0F0F0F]" />
                </button>
                <span className="w-12 h-11 flex items-center justify-center font-medium text-[#0F0F0F] text-sm border-x border-[#0F0F0F]/15">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => Math.min(product.stock || 10, q + 1))}
                  className="w-11 h-11 flex items-center justify-center hover:bg-[#0F0F0F]/5 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5 text-[#0F0F0F]" />
                </button>
              </div>
            </div>

            {/* CTA row */}
            <div className="flex gap-3 mb-8">
              <button
                onClick={handleAddToCart}
                disabled={addToCart.isPending}
                className="flex-1 h-14 bg-[#0F0F0F] hover:bg-[#1a1a1a] text-white text-[10px] tracking-[0.3em] uppercase font-bold transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {addToCart.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Add to Bag"
                )}
              </button>
              <button
                onClick={handleWishlist}
                className={`w-14 h-14 border flex items-center justify-center transition-all duration-200 ${
                  isWishlisted
                    ? "border-[#D4AF37] bg-[#D4AF37]/10"
                    : "border-[#0F0F0F]/15 hover:border-[#D4AF37]"
                }`}
              >
                <Heart
                  className={`w-5 h-5 transition-colors ${isWishlisted ? "text-[#D4AF37] fill-[#D4AF37]" : "text-[#0F0F0F]/50"}`}
                />
              </button>
              <button className="w-14 h-14 border border-[#0F0F0F]/15 hover:border-[#D4AF37] flex items-center justify-center transition-colors">
                <Share2 className="w-4 h-4 text-[#0F0F0F]/50" />
              </button>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-3 border-t border-[#0F0F0F]/8 pt-7 mb-8">
              {[
                { icon: Truck, label: "Free Shipping", sub: "Above ₹5,000" },
                { icon: ShieldCheck, label: "Certified", sub: "BIS Hallmarked" },
                { icon: RefreshCcw, label: "30-Day Returns", sub: "Hassle-free" },
              ].map(({ icon: Icon, label, sub }) => (
                <div key={label} className="flex flex-col items-center text-center gap-2">
                  <Icon className="w-5 h-5 text-[#D4AF37]" />
                  <div>
                    <p className="text-[9px] tracking-[0.15em] uppercase font-semibold text-[#0F0F0F]">{label}</p>
                    <p className="text-[9px] text-[#0F0F0F]/40 mt-0.5">{sub}</p>
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

        {/* ════════════════ TABS SECTION ════════════════ */}
        <div className="mt-20 border-t border-[#0F0F0F]/8 pt-12">

          {/* Tab headers */}
          <div className="flex gap-0 border-b border-[#0F0F0F]/8 mb-12 overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`relative px-6 py-4 text-[10px] tracking-[0.2em] uppercase font-semibold whitespace-nowrap transition-colors ${
                  activeTab === tab ? "text-[#0F0F0F]" : "text-[#0F0F0F]/35 hover:text-[#0F0F0F]/70"
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <motion.div
                    layoutId="tab-indicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#D4AF37]"
                  />
                )}
              </button>
            ))}
          </div>

          {/* Tab content */}
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
                  <p>{product.description}</p>
                  <p>
                    Each Pearlis piece is handcrafted by master artisans with decades of experience, combining
                    traditional Indian jewellery techniques with contemporary design sensibilities. This piece
                    undergoes rigorous quality checks before leaving our atelier.
                  </p>
                  <ul className="space-y-2 mt-6">
                    {[
                      "Handcrafted by certified artisans",
                      "BIS Hallmarked for purity assurance",
                      "Ethically sourced gemstones",
                      "Comes in a Pearlis signature gift box",
                      "Certificate of authenticity included",
                    ].map((pt) => (
                      <li key={pt} className="flex items-center gap-3 text-[11px] tracking-wide">
                        <span className="w-1 h-1 rounded-full bg-[#D4AF37] flex-shrink-0" />
                        {pt}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {activeTab === "Specifications" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-0 divide-y sm:divide-y-0 sm:divide-x-0">
                  {[
                    ["Metal", selectedMaterial],
                    ["Purity", selectedMaterial.includes("18K") ? "75% Pure Gold" : selectedMaterial.includes("14K") ? "58.5% Pure Gold" : "95% Pure Platinum"],
                    ["Finish", "High Polish"],
                    ["Material", product.material || "Precious Metal"],
                    ["Stock", product.stock > 0 ? `${product.stock} units available` : "Made to Order (4-6 weeks)"],
                    ["SKU", `PRL-${String(product.id).padStart(5, "0")}`],
                    ["Category", product.category],
                    ["Weight", "Approx. 4–7g"],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between items-center py-4 border-b border-[#0F0F0F]/6">
                      <span className="text-[10px] tracking-[0.15em] uppercase text-[#0F0F0F]/40 font-semibold">{k}</span>
                      <span className="text-sm text-[#0F0F0F]/80 font-medium">{v}</span>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "Reviews" && (
                <div>
                  {reviews && reviews.length > 0 ? (
                    <div className="space-y-8">
                      {/* Summary bar */}
                      <div className="flex items-center gap-8 p-6 bg-white border border-[#0F0F0F]/6 mb-8">
                        <div className="text-center">
                          <p className="font-serif text-5xl text-[#0F0F0F]">{avgRating.toFixed(1)}</p>
                          <div className="flex justify-center mt-2 mb-1">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star key={s} className={`w-3.5 h-3.5 ${s <= Math.round(avgRating) ? "text-[#D4AF37] fill-[#D4AF37]" : "text-[#D4AF37]/25"}`} />
                            ))}
                          </div>
                          <p className="text-[9px] tracking-[0.15em] uppercase text-[#0F0F0F]/40">{reviews.length} reviews</p>
                        </div>
                        <div className="flex-1 space-y-1.5">
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

                      {/* Review list */}
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
                <div className="space-y-8 text-sm text-[#0F0F0F]/65 leading-relaxed">
                  {[
                    {
                      title: "Free Standard Shipping",
                      body: "Complimentary shipping on all orders above ₹5,000 across India. Standard delivery takes 5–7 business days. Tracked and fully insured.",
                    },
                    {
                      title: "Express Delivery",
                      body: "Need it sooner? Express delivery (2–3 business days) is available for ₹299. Available in all major metros.",
                    },
                    {
                      title: "International Shipping",
                      body: "We ship worldwide. International orders are delivered in 10–15 business days via DHL Express. Duties and taxes may apply.",
                    },
                    {
                      title: "Easy 30-Day Returns",
                      body: "Not in love with your purchase? Return it within 30 days in original, unworn condition. We'll arrange a free pickup and process your refund within 5–7 business days.",
                    },
                  ].map(({ title, body }) => (
                    <div key={title}>
                      <h4 className="text-[10px] tracking-[0.2em] uppercase font-bold text-[#0F0F0F] mb-2">{title}</h4>
                      <p>{body}</p>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ════════════════ RELATED PRODUCTS ════════════════ */}
        {relatedProducts && relatedProducts.length > 0 && (
          <div className="mt-28 pt-16 border-t border-[#0F0F0F]/8">
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="text-[#D4AF37] text-[10px] tracking-[0.3em] uppercase font-semibold mb-2">Curated For You</p>
                <h2 className="font-serif text-3xl md:text-4xl text-[#0F0F0F]">You May Also Love</h2>
              </div>
              <div className="hidden md:flex gap-2">
                <button
                  onClick={() => scrollCarousel("left")}
                  className="w-10 h-10 border border-[#0F0F0F]/15 hover:border-[#D4AF37] flex items-center justify-center transition-colors"
                >
                  <ChevronLeft className="w-4 h-4 text-[#0F0F0F]" />
                </button>
                <button
                  onClick={() => scrollCarousel("right")}
                  className="w-10 h-10 border border-[#0F0F0F]/15 hover:border-[#D4AF37] flex items-center justify-center transition-colors"
                >
                  <ChevronRight className="w-4 h-4 text-[#0F0F0F]" />
                </button>
              </div>
            </div>

            {/* Scrollable carousel */}
            <div
              ref={carouselRef}
              className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scroll-smooth hide-scrollbar"
              style={{ scrollbarWidth: "none" }}
            >
              {relatedProducts.map((p: Parameters<typeof ProductCard>[0]["product"], i: number) => (
                <div key={p.id} className="flex-shrink-0 w-64 md:w-72 snap-start">
                  <ProductCard product={p} index={i} />
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* ════════════ LIGHTBOX ════════════ */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightboxOpen(false)}
            className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center px-4"
          >
            <motion.img
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              src={images[selectedImage]}
              alt={product.name}
              className="max-h-[90vh] max-w-[90vw] object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              onClick={() => setLightboxOpen(false)}
              className="absolute top-6 right-6 text-white/60 hover:text-white text-[11px] tracking-[0.2em] uppercase"
            >
              ✕ Close
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
