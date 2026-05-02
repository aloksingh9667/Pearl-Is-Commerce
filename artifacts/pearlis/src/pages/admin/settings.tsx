import { useState, useEffect, useRef } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Save, Plus, Trash2, Settings, CreditCard, Phone, Share2, Instagram, Video, Zap, Megaphone, Palette, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useGetSettings, useUpdateSetting, type SiteSettings } from "@/lib/adminApi";

const TABS = [
  { id: "branding", label: "Branding", icon: Palette },
  { id: "general", label: "General", icon: Settings },
  { id: "announcement", label: "Announcement", icon: Megaphone },
  { id: "payment", label: "Payment", icon: CreditCard },
  { id: "contact", label: "Contact", icon: Phone },
  { id: "social", label: "Social Links", icon: Share2 },
  { id: "instagram", label: "Instagram", icon: Instagram },
  { id: "videos", label: "Videos", icon: Video },
  { id: "flashSale", label: "Flash Sale", icon: Zap },
] as const;

type TabId = typeof TABS[number]["id"];

export default function AdminSettings() {
  const { data: settings, isLoading } = useGetSettings();
  const updateSetting = useUpdateSetting();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<TabId>("branding");
  const [draft, setDraft] = useState<Partial<SiteSettings>>({});

  useEffect(() => {
    if (settings) setDraft(settings);
  }, [settings]);

  const saving = updateSetting.isPending;

  async function save(key: keyof SiteSettings) {
    if (!(key in draft)) return;
    updateSetting.mutate({ key, value: draft[key] }, {
      onSuccess: () => toast({ title: "Saved", description: `${key} settings updated.` }),
      onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
    });
  }

  function update<K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) {
    setDraft(d => ({ ...d, [key]: value }));
  }

  function updateNested<K extends keyof SiteSettings>(sectionKey: K, field: string, value: any) {
    setDraft(d => ({
      ...d,
      [sectionKey]: { ...(d[sectionKey] as any), [field]: value },
    }));
  }

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <h1 className="font-serif text-3xl mb-8">Site Settings</h1>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Tab Sidebar */}
        <nav className="md:w-48 flex md:flex-col gap-1 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0 flex-shrink-0">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2.5 px-4 py-2.5 text-sm text-left whitespace-nowrap transition-colors rounded-sm ${
                activeTab === id ? "bg-accent text-accent-foreground font-medium" : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </button>
          ))}
        </nav>

        {/* Content */}
        <div className="flex-1 bg-card border border-border p-6">
          {/* BRANDING */}
          {activeTab === "branding" && (
            <Section title="Branding" onSave={() => save("branding")} saving={saving}>
              <p className="text-sm text-muted-foreground -mt-2 mb-2">Customize your site name, tagline, logo image, and favicon.</p>
              <Field label="Site Name">
                <Input value={draft.branding?.siteName || ""} onChange={e => updateNested("branding", "siteName", e.target.value)} className="rounded-none" placeholder="Pearlis" />
              </Field>
              <Field label="Tagline">
                <Input value={draft.branding?.tagline || ""} onChange={e => updateNested("branding", "tagline", e.target.value)} className="rounded-none" placeholder="Fine Jewellery" />
              </Field>
              <Field label="Logo Image URL">
                <div className="space-y-2">
                  <Input value={draft.branding?.logoUrl || ""} onChange={e => updateNested("branding", "logoUrl", e.target.value)} className="rounded-none" placeholder="https://... (leave blank for text logo)" />
                  {draft.branding?.logoUrl && (
                    <div className="border border-border p-3 bg-muted/30 flex items-center gap-3">
                      <img src={draft.branding.logoUrl} alt="Logo preview" className="h-10 w-auto object-contain" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                      <span className="text-xs text-muted-foreground">Logo preview</span>
                    </div>
                  )}
                  <LogoUploadButton onUrl={url => updateNested("branding", "logoUrl", url)} label="Upload Logo" />
                </div>
              </Field>
              <Field label="Favicon Image URL">
                <div className="space-y-2">
                  <Input value={draft.branding?.faviconUrl || ""} onChange={e => updateNested("branding", "faviconUrl", e.target.value)} className="rounded-none" placeholder="https://... (leave blank for default favicon)" />
                  {draft.branding?.faviconUrl && (
                    <div className="border border-border p-3 bg-muted/30 flex items-center gap-3">
                      <img src={draft.branding.faviconUrl} alt="Favicon preview" className="h-8 w-8 object-contain" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                      <span className="text-xs text-muted-foreground">Favicon preview (shown in browser tab)</span>
                    </div>
                  )}
                  <LogoUploadButton onUrl={url => updateNested("branding", "faviconUrl", url)} label="Upload Favicon" />
                </div>
              </Field>
            </Section>
          )}

          {/* GENERAL */}
          {activeTab === "general" && (
            <Section title="General" onSave={() => save("general")} saving={saving}>
              <Field label="Site Name">
                <Input value={draft.general?.siteName || ""} onChange={e => updateNested("general", "siteName", e.target.value)} className="rounded-none" />
              </Field>
              <Field label="Tagline">
                <Input value={draft.general?.tagline || ""} onChange={e => updateNested("general", "tagline", e.target.value)} className="rounded-none" />
              </Field>
              <Field label="Currency Symbol">
                <Input value={draft.general?.currencySymbol || "₹"} onChange={e => updateNested("general", "currencySymbol", e.target.value)} className="rounded-none w-24" />
              </Field>
              <Field label="USD → INR Conversion Rate">
                <Input type="number" value={draft.general?.conversionRate || 83} onChange={e => updateNested("general", "conversionRate", Number(e.target.value))} className="rounded-none w-32" />
              </Field>
            </Section>
          )}

          {/* ANNOUNCEMENT */}
          {activeTab === "announcement" && (
            <Section title="Announcement Bar" onSave={() => save("announcement")} saving={saving}>
              <div className="flex items-center gap-3 mb-4">
                <Switch
                  checked={draft.announcement?.enabled ?? true}
                  onCheckedChange={v => updateNested("announcement", "enabled", v)}
                />
                <Label>Show Announcement Bar</Label>
              </div>
              <Field label="Announcement Text">
                <Input value={draft.announcement?.text || ""} onChange={e => updateNested("announcement", "text", e.target.value)} className="rounded-none" placeholder="FREE SHIPPING ABOVE ₹5,000..." />
              </Field>
              <Field label="Link (Optional)">
                <Input value={draft.announcement?.link || ""} onChange={e => updateNested("announcement", "link", e.target.value)} className="rounded-none" placeholder="/shop" />
              </Field>
            </Section>
          )}

          {/* PAYMENT */}
          {activeTab === "payment" && (
            <Section title="Payment Options" onSave={() => save("payment")} saving={saving}>
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 border border-border">
                  <div>
                    <p className="font-medium text-sm">Cash on Delivery (COD)</p>
                    <p className="text-xs text-muted-foreground mt-1">Allow customers to pay when the order arrives</p>
                  </div>
                  <Switch
                    checked={draft.payment?.codEnabled ?? true}
                    onCheckedChange={v => updateNested("payment", "codEnabled", v)}
                  />
                </div>

                <div className="p-4 border border-border space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">Razorpay (Online Payments)</p>
                      <p className="text-xs text-muted-foreground mt-1">UPI, Cards, Net Banking, Wallets</p>
                    </div>
                    <Switch
                      checked={draft.payment?.razorpayEnabled ?? false}
                      onCheckedChange={v => updateNested("payment", "razorpayEnabled", v)}
                    />
                  </div>
                  {draft.payment?.razorpayEnabled && (
                    <Field label="Razorpay Key ID">
                      <Input value={draft.payment?.razorpayKeyId || ""} onChange={e => updateNested("payment", "razorpayKeyId", e.target.value)} className="rounded-none font-mono" placeholder="rzp_live_..." />
                    </Field>
                  )}
                </div>
              </div>
            </Section>
          )}

          {/* CONTACT */}
          {activeTab === "contact" && (
            <Section title="Contact Information" onSave={() => save("contact")} saving={saving}>
              <Field label="Email">
                <Input value={draft.contact?.email || ""} onChange={e => updateNested("contact", "email", e.target.value)} className="rounded-none" placeholder="concierge@pearlis.com" />
              </Field>
              <Field label="Phone">
                <Input value={draft.contact?.phone || ""} onChange={e => updateNested("contact", "phone", e.target.value)} className="rounded-none" placeholder="+91 98765 43210" />
              </Field>
              <Field label="WhatsApp Number">
                <Input value={draft.contact?.whatsapp || ""} onChange={e => updateNested("contact", "whatsapp", e.target.value)} className="rounded-none" placeholder="+91 98765 43210" />
              </Field>
              <Field label="Address">
                <Textarea value={draft.contact?.address || ""} onChange={e => updateNested("contact", "address", e.target.value)} className="rounded-none min-h-[80px]" placeholder="124 Luxury Lane, Mumbai..." />
              </Field>
              <Field label="Business Hours">
                <Textarea value={draft.contact?.hours || ""} onChange={e => updateNested("contact", "hours", e.target.value)} className="rounded-none min-h-[80px]" placeholder="Mon–Sat: 10am–7pm IST" />
              </Field>
            </Section>
          )}

          {/* SOCIAL */}
          {activeTab === "social" && (
            <Section title="Social Media Links" onSave={() => save("social")} saving={saving}>
              {(["instagram", "facebook", "twitter", "pinterest", "youtube"] as const).map(platform => (
                <Field key={platform} label={platform.charAt(0).toUpperCase() + platform.slice(1)}>
                  <Input
                    value={(draft.social as any)?.[platform] || ""}
                    onChange={e => updateNested("social", platform, e.target.value)}
                    className="rounded-none"
                    placeholder={`https://${platform}.com/pearlisjewels`}
                  />
                </Field>
              ))}
            </Section>
          )}

          {/* INSTAGRAM */}
          {activeTab === "instagram" && (
            <Section title="Instagram Feed" onSave={() => save("instagram")} saving={saving}>
              <div className="flex items-center gap-3 mb-4">
                <Switch
                  checked={draft.instagram?.enabled ?? true}
                  onCheckedChange={v => updateNested("instagram", "enabled", v)}
                />
                <Label>Show Instagram Feed Section</Label>
              </div>
              <Field label="Instagram Username">
                <Input
                  value={draft.instagram?.username || ""}
                  onChange={e => updateNested("instagram", "username", e.target.value)}
                  className="rounded-none"
                  placeholder="pearlisjewels"
                />
              </Field>
              <div className="mt-6">
                <Label className="uppercase tracking-widest text-xs text-muted-foreground mb-3 block">Instagram Post Image URLs</Label>
                <div className="space-y-2">
                  {(draft.instagram?.posts || []).map((url, i) => (
                    <div key={i} className="flex gap-2">
                      <Input
                        value={url}
                        onChange={e => {
                          const posts = [...(draft.instagram?.posts || [])];
                          posts[i] = e.target.value;
                          updateNested("instagram", "posts", posts);
                        }}
                        className="rounded-none text-sm"
                        placeholder="https://images.unsplash.com/..."
                      />
                      <Button variant="ghost" size="icon" className="rounded-none h-10 w-10 text-destructive flex-shrink-0"
                        onClick={() => {
                          const posts = (draft.instagram?.posts || []).filter((_, j) => j !== i);
                          updateNested("instagram", "posts", posts);
                        }}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" className="rounded-none text-xs uppercase tracking-widest mt-2 gap-2"
                    onClick={() => updateNested("instagram", "posts", [...(draft.instagram?.posts || []), ""])}>
                    <Plus className="w-3.5 h-3.5" /> Add Photo URL
                  </Button>
                </div>
              </div>
            </Section>
          )}

          {/* VIDEOS */}
          {activeTab === "videos" && (
            <>
              {/* Atelier Section Video */}
              <Section title="Atelier Section Video" onSave={() => save("atelierVideo")} saving={saving}>
                <p className="text-sm text-muted-foreground mb-6">
                  This video plays in the "The Pearlis Atelier" brand story section on the homepage (left panel). Paste a YouTube link or upload a video file.
                </p>
                <Field label="Video URL (YouTube link or uploaded file URL)">
                  <div className="flex gap-2">
                    <Input
                      value={draft.atelierVideo || ""}
                      onChange={e => update("atelierVideo", e.target.value)}
                      className="rounded-none flex-1"
                      placeholder="https://youtu.be/... or https://youtube.com/watch?v=..."
                    />
                    <VideoUploadButton
                      onUrl={url => update("atelierVideo", url)}
                      label="Upload"
                    />
                  </div>
                </Field>
                {draft.atelierVideo && (
                  <div className="mt-3 p-3 bg-muted border border-border text-xs text-muted-foreground flex items-center gap-2">
                    <Video className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{draft.atelierVideo}</span>
                    <button onClick={() => update("atelierVideo", "")} className="shrink-0 text-destructive hover:underline ml-auto">Remove</button>
                  </div>
                )}
              </Section>

              {/* Gallery / Homepage Videos */}
              <Section title="YouTube Videos (Gallery & Homepage)" onSave={() => save("videos")} saving={saving}>
                <p className="text-sm text-muted-foreground mb-6">These videos appear in the Videos Gallery page and the Homepage video section.</p>
                <div className="space-y-4">
                  {(draft.videos || []).map((video, i) => (
                    <div key={i} className="p-4 border border-border space-y-3">
                      <div className="flex justify-between items-center">
                        <p className="text-sm font-medium">Video {i + 1}</p>
                        <Button variant="ghost" size="sm" className="rounded-none h-8 text-destructive hover:bg-destructive/10 gap-1"
                          onClick={() => update("videos", (draft.videos || []).filter((_, j) => j !== i))}>
                          <Trash2 className="w-3.5 h-3.5" /> Remove
                        </Button>
                      </div>
                      <Field label="Title">
                        <Input value={video.title} onChange={e => {
                          const vids = [...(draft.videos || [])];
                          vids[i] = { ...vids[i], title: e.target.value };
                          update("videos", vids);
                        }} className="rounded-none" placeholder="Behind the Scenes..." />
                      </Field>
                      <Field label="Video URL (YouTube link or uploaded file)">
                        <div className="flex gap-2">
                          <Input value={video.url} onChange={e => {
                            const vids = [...(draft.videos || [])];
                            const url = e.target.value;
                            const ytIdMatch = url.match(/(?:embed\/|v=|youtu\.be\/)([^?&/]+)/);
                            const ytId = ytIdMatch?.[1] || "";
                            const autoThumb = ytId ? `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg` : vids[i].thumbnail;
                            vids[i] = { ...vids[i], url, thumbnail: vids[i].thumbnail || autoThumb };
                            update("videos", vids);
                          }} className="rounded-none flex-1" placeholder="https://youtu.be/... or upload below" />
                          <VideoUploadButton
                            onUrl={url => {
                              const vids = [...(draft.videos || [])];
                              vids[i] = { ...vids[i], url };
                              update("videos", vids);
                            }}
                            label="Upload"
                          />
                        </div>
                      </Field>
                      <Field label="Thumbnail (auto-filled from YouTube, or paste image URL)">
                        <div className="flex gap-2 items-start">
                          <Input value={video.thumbnail} onChange={e => {
                            const vids = [...(draft.videos || [])];
                            vids[i] = { ...vids[i], thumbnail: e.target.value };
                            update("videos", vids);
                          }} className="rounded-none flex-1" placeholder="Auto-generated from YouTube URL" />
                          <LogoUploadButton
                            onUrl={url => {
                              const vids = [...(draft.videos || [])];
                              vids[i] = { ...vids[i], thumbnail: url };
                              update("videos", vids);
                            }}
                            label="Upload Thumbnail"
                          />
                        </div>
                      </Field>
                    </div>
                  ))}
                  <Button variant="outline" className="rounded-none text-xs uppercase tracking-widest gap-2"
                    onClick={() => update("videos", [...(draft.videos || []), { title: "", url: "", thumbnail: "" }])}>
                    <Plus className="w-4 h-4" /> Add Video
                  </Button>
                </div>
              </Section>
            </>
          )}

          {/* FLASH SALE */}
          {activeTab === "flashSale" && (
            <Section title="Flash Sale" onSave={() => save("flashSale")} saving={saving}>
              <div className="flex items-center gap-3 mb-4">
                <Switch
                  checked={draft.flashSale?.enabled ?? true}
                  onCheckedChange={v => updateNested("flashSale", "enabled", v)}
                />
                <Label>Show Flash Sale Section on Homepage</Label>
              </div>
              <Field label="Badge Text">
                <Input value={draft.flashSale?.title || ""} onChange={e => updateNested("flashSale", "title", e.target.value)} className="rounded-none" placeholder="Flash Sale" />
              </Field>
              <Field label="Subtitle">
                <Input value={draft.flashSale?.subtitle || ""} onChange={e => updateNested("flashSale", "subtitle", e.target.value)} className="rounded-none" placeholder="Up to 30% Off" />
              </Field>
              <Field label="Sale Ends At (ISO Date)">
                <Input type="datetime-local" value={draft.flashSale?.endsAt ? draft.flashSale.endsAt.slice(0, 16) : ""} onChange={e => updateNested("flashSale", "endsAt", new Date(e.target.value).toISOString())} className="rounded-none" />
              </Field>
            </Section>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

function LogoUploadButton({ onUrl, label }: { onUrl: (url: string) => void; label: string }) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setUploading(true);
    try {
      const token = localStorage.getItem("token");
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: fd });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      onUrl(data.url);
    } catch {
    } finally {
      setUploading(false);
    }
  }

  return (
    <>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={e => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }} />
      <Button variant="outline" size="sm" className="rounded-none text-xs uppercase tracking-widest gap-2 w-fit" onClick={() => inputRef.current?.click()} disabled={uploading}>
        {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
        {uploading ? "Uploading..." : label}
      </Button>
    </>
  );
}

function VideoUploadButton({ onUrl, label }: { onUrl: (url: string) => void; label: string }) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setUploading(true);
    try {
      const token = localStorage.getItem("token");
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: fd });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      onUrl(data.url);
    } catch {
    } finally {
      setUploading(false);
    }
  }

  return (
    <>
      <input ref={inputRef} type="file" accept="video/*" className="hidden" onChange={e => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }} />
      <Button variant="outline" size="sm" className="rounded-none text-xs uppercase tracking-widest gap-2 shrink-0" onClick={() => inputRef.current?.click()} disabled={uploading}>
        {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
        {uploading ? "Uploading..." : label}
      </Button>
    </>
  );
}

function Section({ title, children, onSave, saving }: { title: string; children: React.ReactNode; onSave: () => void; saving: boolean }) {
  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center pb-4 border-b border-border">
        <h2 className="font-serif text-xl">{title}</h2>
        <Button onClick={onSave} disabled={saving} className="rounded-none uppercase tracking-widest text-xs gap-2">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save
        </Button>
      </div>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label className="uppercase tracking-widest text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}
