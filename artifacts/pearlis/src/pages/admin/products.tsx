import { useState, useRef } from "react";
import { useListProducts, useDeleteProduct, useCreateProduct, useUpdateProduct, getListProductsQueryKey } from "@workspace/api-client-react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Plus, Edit, Trash2, X, ImagePlus, Upload, Video, PlusCircle, MinusCircle, Check } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

const toINR = (usd: number) => Math.round(usd * 83);
const fmt = (inr: number) => `₹${inr.toLocaleString("en-IN")}`;
const fromINR = (inr: number) => inr / 83;

type Spec = { key: string; value: string };

const ALL_RING_SIZES = ["4", "5", "6", "7", "8", "9", "10", "11", "12", "13"];
const ALL_NECKLACE_LENGTHS = ["14\"", "16\"", "18\"", "20\"", "22\"", "24\""];
const ALL_MATERIAL_VARIANTS = [
  "14K Yellow Gold",
  "18K Yellow Gold",
  "18K White Gold",
  "18K Rose Gold",
  "22K Yellow Gold",
  "Platinum",
  "Sterling Silver",
  "Diamond",
];

const CATEGORIES = ["rings", "necklaces", "bracelets", "earrings", "pendants", "accessories"] as const;

type ProductForm = {
  name: string; description: string; category: string; material: string;
  price: string; discountPrice: string; stock: string;
  images: string[]; videoUrl: string;
  isNew: boolean; isTrending: boolean; isFeatured: boolean;
  tags: string;
  specifications: Spec[];
  craftStory: string;
  craftPoints: string[];
  shippingInfo: string;
  sizes: string[];
  materialVariants: string[];
};

const DEFAULT_CRAFT_POINTS = [
  "Handcrafted by certified artisans",
  "BIS Hallmarked for purity assurance",
  "Ethically sourced gemstones",
  "Comes in a Pearlis signature gift box",
];

const DEFAULT_SHIPPING_INFO = `Free Standard Shipping
Complimentary shipping on all orders above ₹5,000 across India. Standard delivery takes 5–7 business days. Tracked and fully insured.

Express Delivery
Need it sooner? Express delivery (2–3 business days) is available for ₹299. Available in all major metros.

International Shipping
We ship worldwide. International orders are delivered in 10–15 business days via DHL Express. Duties and taxes may apply.

Easy 30-Day Returns
Not in love with your purchase? Return it within 30 days in original, unworn condition. We'll arrange a free pickup and process your refund within 5–7 business days.`;

const emptyForm: ProductForm = {
  name: "", description: "", category: "rings", material: "18K Yellow Gold",
  price: "", discountPrice: "", stock: "0",
  images: [""], videoUrl: "",
  isNew: false, isTrending: false, isFeatured: false,
  tags: "",
  specifications: [{ key: "", value: "" }],
  craftStory: "Each Pearlis piece is handcrafted by master artisans with decades of experience, combining traditional Indian jewellery techniques with contemporary design sensibilities.",
  craftPoints: [...DEFAULT_CRAFT_POINTS],
  shippingInfo: DEFAULT_SHIPPING_INFO,
  sizes: [],
  materialVariants: ["18K Yellow Gold"],
};

function toForm(p: any): ProductForm {
  return {
    name: p.name || "",
    description: p.description || "",
    category: p.category || "rings",
    material: p.material || "18K Yellow Gold",
    price: p.price ? String(toINR(p.price)) : "",
    discountPrice: p.discountPrice ? String(toINR(p.discountPrice)) : "",
    stock: String(p.stock || 0),
    images: p.images?.length ? p.images : [""],
    videoUrl: p.videoUrl || "",
    isNew: p.isNew ?? false,
    isTrending: p.isTrending ?? false,
    isFeatured: p.isFeatured ?? false,
    tags: (p.tags || []).join(", "),
    specifications: p.specifications?.length ? p.specifications : [{ key: "", value: "" }],
    craftStory: p.craftStory || emptyForm.craftStory,
    craftPoints: p.craftPoints?.length ? p.craftPoints : [...DEFAULT_CRAFT_POINTS],
    shippingInfo: p.shippingInfo || DEFAULT_SHIPPING_INFO,
    sizes: p.sizes || [],
    materialVariants: p.materialVariants?.length ? p.materialVariants : ["18K Yellow Gold"],
  };
}

const TABS = ["Basic Info", "Variants", "Description", "Specifications", "Shipping & Returns", "Media"] as const;
type Tab = typeof TABS[number];

function adminToken() {
  return localStorage.getItem("token") || "";
}

export default function AdminProducts() {
  const { data, isLoading } = useListProducts({ limit: 200 });
  const deleteProduct = useDeleteProduct();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [modal, setModal] = useState<{ open: boolean; editId: number | null }>({ open: false, editId: null });
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("Basic Info");
  const [uploading, setUploading] = useState(false);
  const [imgUploading, setImgUploading] = useState(false);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const imgInputRef = useRef<HTMLInputElement>(null);

  const openAdd = () => { setForm(emptyForm); setActiveTab("Basic Info"); setModal({ open: true, editId: null }); };
  const openEdit = (product: any) => { setForm(toForm(product)); setActiveTab("Basic Info"); setModal({ open: true, editId: product.id }); };
  const closeModal = () => setModal({ open: false, editId: null });
  const set = (field: keyof ProductForm, value: any) => setForm(f => ({ ...f, [field]: value }));

  const toggleSize = (s: string) => {
    set("sizes", form.sizes.includes(s) ? form.sizes.filter(x => x !== s) : [...form.sizes, s]);
  };

  const toggleMaterialVariant = (m: string) => {
    set("materialVariants", form.materialVariants.includes(m) ? form.materialVariants.filter(x => x !== m) : [...form.materialVariants, m]);
  };

  const handleFileUpload = async (file: File, kind: "video" | "image") => {
    const setter = kind === "video" ? setUploading : setImgUploading;
    setter(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${adminToken()}` },
        body: fd,
      });
      if (!res.ok) throw new Error("Upload failed");
      const { url } = await res.json();
      if (kind === "video") {
        set("videoUrl", url);
        toast({ title: "Video uploaded!" });
      } else {
        set("images", [...form.images.filter(Boolean), url]);
        toast({ title: "Image uploaded!" });
      }
    } catch {
      toast({ title: "Upload failed", variant: "destructive" });
    } finally {
      setter(false);
    }
  };

  const handleDelete = (id: number) => {
    if (!confirm("Delete this product?")) return;
    deleteProduct.mutate({ id }, {
      onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() }); toast({ title: "Deleted" }); },
      onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
    });
  };

  const handleSave = async () => {
    if (!form.name || !form.price) { toast({ title: "Name and price are required", variant: "destructive" }); return; }
    setSaving(true);
    const priceINR = parseFloat(form.price);
    const payload = {
      name: form.name, description: form.description,
      category: form.category, material: form.material,
      price: fromINR(priceINR),
      discountPrice: form.discountPrice ? fromINR(parseFloat(form.discountPrice)) : undefined,
      stock: parseInt(form.stock),
      images: form.images.filter(Boolean),
      videoUrl: form.videoUrl || undefined,
      isNew: form.isNew, isTrending: form.isTrending, isFeatured: form.isFeatured,
      tags: form.tags.split(",").map(t => t.trim()).filter(Boolean),
      specifications: form.specifications.filter(s => s.key && s.value),
      craftStory: form.craftStory || undefined,
      craftPoints: form.craftPoints.filter(Boolean),
      shippingInfo: form.shippingInfo || undefined,
      sizes: form.sizes,
      materialVariants: form.materialVariants,
    };

    const invalidate = () => queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });

    if (modal.editId) {
      updateProduct.mutate({ id: modal.editId, data: payload as any }, {
        onSuccess: () => { invalidate(); toast({ title: "Product Updated" }); closeModal(); setSaving(false); },
        onError: (e: any) => { toast({ title: "Error", description: e.message, variant: "destructive" }); setSaving(false); },
      });
    } else {
      createProduct.mutate({ data: payload as any }, {
        onSuccess: () => { invalidate(); toast({ title: "Product Created" }); closeModal(); setSaving(false); },
        onError: (e: any) => { toast({ title: "Error", description: e.message, variant: "destructive" }); setSaving(false); },
      });
    }
  };

  const updateSpec = (i: number, field: keyof Spec, val: string) => {
    const specs = [...form.specifications];
    specs[i] = { ...specs[i], [field]: val };
    set("specifications", specs);
  };

  const updateCraftPoint = (i: number, val: string) => {
    const pts = [...form.craftPoints];
    pts[i] = val;
    set("craftPoints", pts);
  };

  const isRing = form.category === "rings";
  const isNecklace = form.category === "necklaces" || form.category === "bracelets";

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-8">
        <h1 className="font-serif text-3xl">Products <span className="text-muted-foreground text-lg font-sans font-normal ml-2">({data?.total || 0})</span></h1>
        <Button className="rounded-none uppercase tracking-widest text-xs gap-2" onClick={openAdd}>
          <Plus className="w-4 h-4" /> Add Product
        </Button>
      </div>

      <div className="bg-card border border-border">
        {isLoading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-accent" /></div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="w-16">Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price (INR)</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Badges</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.products.map(p => (
                <TableRow key={p.id} className="border-border">
                  <TableCell>
                    <img src={p.images[0]} alt="" className="w-10 h-10 object-cover bg-muted" onError={e => { (e.target as HTMLImageElement).src = "https://placehold.co/40x40?text=No+Img"; }} />
                  </TableCell>
                  <TableCell className="font-medium max-w-[180px] truncate">{p.name}</TableCell>
                  <TableCell className="capitalize text-muted-foreground text-sm">{p.category}</TableCell>
                  <TableCell className="text-sm font-medium">{fmt(toINR(p.price))}</TableCell>
                  <TableCell className="text-sm">{p.discountPrice ? <span className="text-accent">{fmt(toINR(p.discountPrice))}</span> : <span className="text-muted-foreground">—</span>}</TableCell>
                  <TableCell>
                    <span className={`text-xs px-2 py-1 ${p.stock > 0 ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>
                      {p.stock}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {p.isNew && <span className="text-xs px-1.5 py-0.5 bg-blue-50 text-blue-600">New</span>}
                      {p.isTrending && <span className="text-xs px-1.5 py-0.5 bg-orange-50 text-orange-600">Trend</span>}
                      {p.isFeatured && <span className="text-xs px-1.5 py-0.5 bg-accent/10 text-accent">Featured</span>}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" className="rounded-none h-8 w-8" onClick={() => openEdit(p)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="rounded-none h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => handleDelete(p.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* ── Modal ── */}
      <AnimatePresence>
        {modal.open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-start justify-center p-4 overflow-y-auto"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95 }}
              className="bg-background border border-border w-full max-w-2xl my-8"
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex justify-between items-center p-6 border-b border-border">
                <h2 className="font-serif text-2xl">{modal.editId ? "Edit Product" : "Add Product"}</h2>
                <button onClick={closeModal} className="p-1 hover:bg-muted rounded-sm transition-colors"><X className="w-5 h-5" /></button>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-border overflow-x-auto">
                {TABS.map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-3 py-3 text-[10px] uppercase tracking-widest whitespace-nowrap transition-colors ${
                      activeTab === tab
                        ? "border-b-2 border-accent text-accent font-semibold"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="p-6 space-y-5 max-h-[65vh] overflow-y-auto">

                {/* ── Basic Info ── */}
                {activeTab === "Basic Info" && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <F label="Product Name *">
                        <Input value={form.name} onChange={e => set("name", e.target.value)} className="rounded-none" placeholder="Golden Aurora Ring" />
                      </F>
                      <F label="Category">
                        <Select value={form.category} onValueChange={v => set("category", v)}>
                          <SelectTrigger className="rounded-none"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {CATEGORIES.map(c => (
                              <SelectItem key={c} value={c} className="capitalize">{c.charAt(0).toUpperCase() + c.slice(1)}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </F>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <F label="Price (₹) *">
                        <Input type="number" value={form.price} onChange={e => set("price", e.target.value)} className="rounded-none" placeholder="74691" />
                        {form.price && <p className="text-xs text-muted-foreground mt-1">{fmt(parseFloat(form.price) || 0)}</p>}
                      </F>
                      <F label="Discount Price (₹)">
                        <Input type="number" value={form.discountPrice} onChange={e => set("discountPrice", e.target.value)} className="rounded-none" placeholder="66416" />
                        {form.discountPrice && <p className="text-xs text-accent mt-1">{fmt(parseFloat(form.discountPrice) || 0)}</p>}
                      </F>
                      <F label="Stock">
                        <Input type="number" value={form.stock} onChange={e => set("stock", e.target.value)} className="rounded-none" />
                      </F>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <F label="Base Material">
                        <Select value={form.material} onValueChange={v => set("material", v)}>
                          <SelectTrigger className="rounded-none"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {ALL_MATERIAL_VARIANTS.map(m => (
                              <SelectItem key={m} value={m}>{m}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </F>
                      <F label="Tags (comma separated)">
                        <Input value={form.tags} onChange={e => set("tags", e.target.value)} className="rounded-none" placeholder="gold, ring, bridal" />
                      </F>
                    </div>

                    <div className="grid grid-cols-3 gap-4 pt-2">
                      {([["isNew","New Arrival"],["isTrending","Trending"],["isFeatured","Featured"]] as [keyof ProductForm, string][]).map(([key, label]) => (
                        <div key={key} className="flex items-center gap-3 p-3 border border-border">
                          <Switch checked={form[key] as boolean} onCheckedChange={v => set(key, v)} />
                          <Label className="text-xs uppercase tracking-wider cursor-pointer">{label}</Label>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {/* ── Variants ── */}
                {activeTab === "Variants" && (
                  <>
                    {/* Material Variants */}
                    <F label="Material Options (shown as selectable buttons on product page)">
                      <div className="grid grid-cols-2 gap-2 mt-1">
                        {ALL_MATERIAL_VARIANTS.map(m => {
                          const active = form.materialVariants.includes(m);
                          return (
                            <button
                              key={m}
                              type="button"
                              onClick={() => toggleMaterialVariant(m)}
                              className={`flex items-center justify-between px-3 py-2.5 border text-xs tracking-wide transition-all ${
                                active ? "border-accent bg-accent/8 text-foreground font-semibold" : "border-border text-muted-foreground hover:border-accent/50"
                              }`}
                            >
                              {m}
                              {active && <Check className="w-3.5 h-3.5 text-accent flex-shrink-0" />}
                            </button>
                          );
                        })}
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        {form.materialVariants.length === 0 ? "No variants selected — product will show the base material only." : `${form.materialVariants.length} variant(s) selected`}
                      </p>
                    </F>

                    {/* Ring Sizes */}
                    {(isRing) && (
                      <F label="Ring Sizes Available">
                        <div className="flex flex-wrap gap-2 mt-1">
                          {ALL_RING_SIZES.map(s => {
                            const active = form.sizes.includes(s);
                            return (
                              <button
                                key={s}
                                type="button"
                                onClick={() => toggleSize(s)}
                                className={`w-11 h-11 border text-sm font-medium transition-all ${
                                  active ? "border-accent bg-accent text-white" : "border-border text-muted-foreground hover:border-accent/60"
                                }`}
                              >
                                {s}
                              </button>
                            );
                          })}
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          {form.sizes.length === 0 ? "No sizes selected — size selector won't show on product page." : `Sizes: ${form.sizes.join(", ")}`}
                        </p>
                      </F>
                    )}

                    {/* Necklace / Bracelet Lengths */}
                    {isNecklace && (
                      <F label={`${form.category === "bracelets" ? "Bracelet" : "Necklace"} Lengths Available`}>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {ALL_NECKLACE_LENGTHS.map(s => {
                            const active = form.sizes.includes(s);
                            return (
                              <button
                                key={s}
                                type="button"
                                onClick={() => toggleSize(s)}
                                className={`px-3 h-10 border text-xs font-medium tracking-wide transition-all ${
                                  active ? "border-accent bg-accent text-white" : "border-border text-muted-foreground hover:border-accent/60"
                                }`}
                              >
                                {s}
                              </button>
                            );
                          })}
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          {form.sizes.length === 0 ? "No lengths selected — size selector won't show." : `Selected: ${form.sizes.join(", ")}`}
                        </p>
                      </F>
                    )}

                    {!isRing && !isNecklace && (
                      <div className="p-4 border border-dashed border-border text-center">
                        <p className="text-xs text-muted-foreground">Size variants are applicable for rings, necklaces, and bracelets. This category ({form.category}) uses material variants only.</p>
                      </div>
                    )}
                  </>
                )}

                {/* ── Description ── */}
                {activeTab === "Description" && (
                  <>
                    <F label="Short Description">
                      <Textarea value={form.description} onChange={e => set("description", e.target.value)} className="rounded-none min-h-[90px]" placeholder="A hand-engraved lotus flower pendant in 22K gold with enamel detailing." />
                    </F>

                    <F label="Craft Story (longer paragraph shown on product page)">
                      <Textarea value={form.craftStory} onChange={e => set("craftStory", e.target.value)} className="rounded-none min-h-[100px]" />
                    </F>

                    <F label="Quality Highlights (bullet points)">
                      <div className="space-y-2">
                        {form.craftPoints.map((pt, i) => (
                          <div key={i} className="flex gap-2 items-center">
                            <span className="w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0 mt-0.5" />
                            <Input
                              value={pt}
                              onChange={e => updateCraftPoint(i, e.target.value)}
                              className="rounded-none text-sm"
                              placeholder="Handcrafted by certified artisans"
                            />
                            <Button variant="ghost" size="icon" className="rounded-none h-8 w-8 text-muted-foreground hover:text-destructive flex-shrink-0"
                              onClick={() => set("craftPoints", form.craftPoints.filter((_, j) => j !== i))}>
                              <MinusCircle className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                        <Button variant="outline" size="sm" className="rounded-none text-xs uppercase tracking-widest gap-2 mt-1"
                          onClick={() => set("craftPoints", [...form.craftPoints, ""])}>
                          <PlusCircle className="w-3.5 h-3.5" /> Add Point
                        </Button>
                      </div>
                    </F>
                  </>
                )}

                {/* ── Specifications ── */}
                {activeTab === "Specifications" && (
                  <F label="Product Specifications (shown as a table on the product page)">
                    <div className="space-y-2">
                      {form.specifications.map((spec, i) => (
                        <div key={i} className="flex gap-2 items-center">
                          <Input value={spec.key} onChange={e => updateSpec(i, "key", e.target.value)} className="rounded-none text-sm w-36 flex-shrink-0" placeholder="Metal" />
                          <span className="text-muted-foreground text-sm">→</span>
                          <Input value={spec.value} onChange={e => updateSpec(i, "value", e.target.value)} className="rounded-none text-sm flex-1" placeholder="18K Yellow Gold" />
                          <Button variant="ghost" size="icon" className="rounded-none h-8 w-8 text-muted-foreground hover:text-destructive flex-shrink-0"
                            onClick={() => set("specifications", form.specifications.filter((_, j) => j !== i))}>
                            <MinusCircle className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                      <Button variant="outline" size="sm" className="rounded-none text-xs uppercase tracking-widest gap-2 mt-1"
                        onClick={() => set("specifications", [...form.specifications, { key: "", value: "" }])}>
                        <PlusCircle className="w-3.5 h-3.5" /> Add Specification
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-3">Tip: Add Metal, Purity, Weight, Stone, Finish, SKU, etc.</p>
                  </F>
                )}

                {/* ── Shipping & Returns ── */}
                {activeTab === "Shipping & Returns" && (
                  <F label="Shipping & Returns Policy">
                    <Textarea
                      value={form.shippingInfo}
                      onChange={e => set("shippingInfo", e.target.value)}
                      className="rounded-none min-h-[300px] text-sm leading-relaxed font-mono"
                      placeholder="Free Standard Shipping&#10;Details...&#10;&#10;Express Delivery&#10;Details..."
                    />
                    <p className="text-xs text-muted-foreground mt-2">Format: Section title on first line, description below it, blank line between sections.</p>
                  </F>
                )}

                {/* ── Media ── */}
                {activeTab === "Media" && (
                  <>
                    <F label="Product Images">
                      <div className="space-y-2">
                        {form.images.map((img, i) => (
                          <div key={i} className="flex gap-2 items-start">
                            {img && <img src={img} alt="" className="w-10 h-10 object-cover bg-muted flex-shrink-0" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />}
                            <Input
                              value={img}
                              onChange={e => { const imgs = [...form.images]; imgs[i] = e.target.value; set("images", imgs); }}
                              className="rounded-none text-sm"
                              placeholder="https://images.unsplash.com/..."
                            />
                            {form.images.length > 1 && (
                              <Button variant="ghost" size="icon" className="rounded-none h-10 w-10 flex-shrink-0 text-muted-foreground hover:text-destructive"
                                onClick={() => set("images", form.images.filter((_, j) => j !== i))}>
                                <X className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                        <div className="flex gap-2 flex-wrap">
                          <Button variant="outline" size="sm" className="rounded-none text-xs uppercase tracking-widest gap-2"
                            onClick={() => set("images", [...form.images, ""])}>
                            <ImagePlus className="w-3.5 h-3.5" /> Add Image URL
                          </Button>
                          <Button variant="outline" size="sm" className="rounded-none text-xs uppercase tracking-widest gap-2"
                            onClick={() => imgInputRef.current?.click()} disabled={imgUploading}>
                            {imgUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                            Upload from Device
                          </Button>
                          <input
                            ref={imgInputRef}
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={e => {
                              const files = Array.from(e.target.files || []);
                              files.forEach(f => handleFileUpload(f, "image"));
                              e.target.value = "";
                            }}
                          />
                        </div>
                      </div>
                    </F>

                    <F label="Product Video">
                      <div className="space-y-3">
                        <div className="flex gap-2 items-center">
                          <Video className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                          <Input value={form.videoUrl} onChange={e => set("videoUrl", e.target.value)} className="rounded-none flex-1" placeholder="https://www.youtube.com/embed/... or upload below" />
                          {form.videoUrl && <Button variant="ghost" size="icon" className="rounded-none h-10 w-10 text-muted-foreground hover:text-destructive flex-shrink-0" onClick={() => set("videoUrl", "")}><X className="w-4 h-4" /></Button>}
                        </div>

                        <div
                          className="border-2 border-dashed border-border p-6 text-center cursor-pointer hover:border-accent transition-colors"
                          onClick={() => videoInputRef.current?.click()}
                          onDragOver={e => e.preventDefault()}
                          onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFileUpload(f, "video"); }}
                        >
                          <input
                            ref={videoInputRef}
                            type="file"
                            accept="video/mp4,video/webm,video/ogg"
                            className="hidden"
                            onChange={e => { const f = e.target.files?.[0]; if (f) handleFileUpload(f, "video"); }}
                          />
                          {uploading ? (
                            <div className="flex items-center justify-center gap-2">
                              <Loader2 className="w-5 h-5 animate-spin text-accent" />
                              <span className="text-sm text-muted-foreground">Uploading video...</span>
                            </div>
                          ) : (
                            <>
                              <Upload className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
                              <p className="text-sm text-muted-foreground">Drop video here or <span className="text-accent underline underline-offset-2">click to upload</span></p>
                              <p className="text-xs text-muted-foreground/60 mt-1">MP4, WebM, OGG — max 100MB</p>
                            </>
                          )}
                        </div>

                        {form.videoUrl && form.videoUrl.startsWith("/api/uploads/") && (
                          <div className="border border-border p-2 bg-muted/30">
                            <video src={form.videoUrl} controls className="w-full max-h-40" />
                          </div>
                        )}
                      </div>
                    </F>
                  </>
                )}

              </div>

              <div className="flex justify-between items-center p-6 border-t border-border">
                <div className="flex gap-1">
                  {TABS.map((tab) => (
                    <button key={tab} onClick={() => setActiveTab(tab)}
                      className={`w-2 h-2 rounded-full transition-colors ${activeTab === tab ? "bg-accent" : "bg-border"}`}
                      title={tab}
                    />
                  ))}
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" className="rounded-none uppercase tracking-widest text-xs" onClick={closeModal}>Cancel</Button>
                  <Button className="rounded-none uppercase tracking-widest text-xs gap-2" onClick={handleSave} disabled={saving}>
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    {modal.editId ? "Save Changes" : "Create Product"}
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
}

function F({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label className="uppercase tracking-widest text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}
