import { useState, useRef } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Plus, Edit, Trash2, X, Upload, Video, Play } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

type VideoItem = {
  id: number; title: string; description?: string;
  videoUrl: string; thumbnailUrl?: string; category?: string;
  isFeatured: boolean; isPublished: boolean; createdAt: string;
};

type VideoForm = {
  title: string; description: string; videoUrl: string;
  thumbnailUrl: string; category: string;
  isFeatured: boolean; isPublished: boolean;
};

const emptyForm: VideoForm = {
  title: "", description: "", videoUrl: "", thumbnailUrl: "",
  category: "lookbook", isFeatured: false, isPublished: true,
};

const CATEGORIES = ["lookbook", "behind the scenes", "product", "campaign"];

async function fetchVideos(): Promise<VideoItem[]> {
  const res = await fetch("/api/videos/all", {
    headers: { "x-admin-token": btoa("admin@pearlis.com:Pearl@Admin2024") },
  });
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
}

async function saveVideo(data: VideoForm, id?: number, token?: string) {
  const url = id ? `/api/videos/${id}` : "/api/videos";
  const method = id ? "PUT" : "POST";
  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json", "x-admin-token": btoa("admin@pearlis.com:Pearl@Admin2024") },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to save");
  return res.json();
}

async function deleteVideo(id: number) {
  const res = await fetch(`/api/videos/${id}`, {
    method: "DELETE",
    headers: { "x-admin-token": btoa("admin@pearlis.com:Pearl@Admin2024") },
  });
  if (!res.ok) throw new Error("Failed to delete");
  return res.json();
}

export default function AdminVideos() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: videos = [], isLoading } = useQuery({ queryKey: ["admin-videos"], queryFn: fetchVideos });

  const [modal, setModal] = useState<{ open: boolean; editId: number | null }>({ open: false, editId: null });
  const [form, setForm] = useState<VideoForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const set = (f: keyof VideoForm, v: any) => setForm(p => ({ ...p, [f]: v }));

  const openAdd = () => { setForm(emptyForm); setModal({ open: true, editId: null }); };
  const openEdit = (v: VideoItem) => {
    setForm({
      title: v.title, description: v.description || "",
      videoUrl: v.videoUrl, thumbnailUrl: v.thumbnailUrl || "",
      category: v.category || "lookbook",
      isFeatured: v.isFeatured, isPublished: v.isPublished,
    });
    setModal({ open: true, editId: v.id });
  };
  const close = () => setModal({ open: false, editId: null });

  const handleUploadVideo = async (file: File) => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "x-admin-token": btoa("admin@pearlis.com:Pearl@Admin2024") },
        body: fd,
      });
      if (!res.ok) throw new Error("Upload failed");
      const { url } = await res.json();
      set("videoUrl", url);
      toast({ title: "Video uploaded!" });
    } catch {
      toast({ title: "Upload failed", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!form.title || !form.videoUrl) {
      toast({ title: "Title and video URL are required", variant: "destructive" }); return;
    }
    setSaving(true);
    try {
      await saveVideo(form, modal.editId || undefined);
      queryClient.invalidateQueries({ queryKey: ["admin-videos"] });
      toast({ title: modal.editId ? "Video Updated" : "Video Added" });
      close();
    } catch {
      toast({ title: "Error saving video", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this video?")) return;
    try {
      await deleteVideo(id);
      queryClient.invalidateQueries({ queryKey: ["admin-videos"] });
      toast({ title: "Deleted" });
    } catch {
      toast({ title: "Error deleting", variant: "destructive" });
    }
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-8">
        <h1 className="font-serif text-3xl">Videos <span className="text-muted-foreground text-lg font-sans font-normal ml-2">({videos.length})</span></h1>
        <Button className="rounded-none uppercase tracking-widest text-xs gap-2" onClick={openAdd}>
          <Plus className="w-4 h-4" /> Add Video
        </Button>
      </div>

      <div className="bg-card border border-border">
        {isLoading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-accent" /></div>
        ) : !videos.length ? (
          <div className="py-16 text-center">
            <Video className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="font-serif text-xl text-muted-foreground">No videos yet</p>
            <p className="text-sm text-muted-foreground mt-1">Add your first video to get started</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="w-20">Preview</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Featured</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {videos.map(v => {
                const isYT = v.videoUrl.includes("youtube.com") || v.videoUrl.includes("youtu.be");
                const ytId = isYT ? v.videoUrl.match(/(?:embed\/|v=|youtu\.be\/)([^?&/]+)/)?.[1] : null;
                const thumb = v.thumbnailUrl || (ytId ? `https://img.youtube.com/vi/${ytId}/mqdefault.jpg` : null);
                return (
                  <TableRow key={v.id} className="border-border">
                    <TableCell>
                      <div className="w-16 h-10 bg-muted relative flex items-center justify-center overflow-hidden">
                        {thumb ? (
                          <img src={thumb} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <Play className="w-4 h-4 text-muted-foreground" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium max-w-[200px] truncate">{v.title}</TableCell>
                    <TableCell className="capitalize text-muted-foreground text-sm">{v.category}</TableCell>
                    <TableCell>
                      <span className={`text-xs px-2 py-1 uppercase tracking-widest ${v.isPublished ? "bg-green-50 text-green-700" : "bg-muted text-muted-foreground"}`}>
                        {v.isPublished ? "Published" : "Draft"}
                      </span>
                    </TableCell>
                    <TableCell>
                      {v.isFeatured && <span className="text-xs px-2 py-1 bg-accent/10 text-accent uppercase tracking-widest">Featured</span>}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" className="rounded-none h-8 w-8" onClick={() => openEdit(v)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="rounded-none h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => handleDelete(v.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>

      <AnimatePresence>
        {modal.open && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-start justify-center p-4 overflow-y-auto"
            onClick={close}>
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }}
              className="bg-background border border-border w-full max-w-xl my-8"
              onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center p-6 border-b border-border">
                <h2 className="font-serif text-2xl">{modal.editId ? "Edit Video" : "Add Video"}</h2>
                <button onClick={close} className="p-1 hover:bg-muted rounded-sm"><X className="w-5 h-5" /></button>
              </div>

              <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
                <F label="Title *">
                  <Input value={form.title} onChange={e => set("title", e.target.value)} className="rounded-none" placeholder="Behind the Craft — 22K Gold Collection" />
                </F>

                <F label="Description">
                  <Textarea value={form.description} onChange={e => set("description", e.target.value)} className="rounded-none min-h-[70px]" placeholder="A glimpse into our atelier..." />
                </F>

                <div className="grid grid-cols-2 gap-4">
                  <F label="Category">
                    <Select value={form.category} onValueChange={v => set("category", v)}>
                      <SelectTrigger className="rounded-none"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map(c => (
                          <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </F>
                  <F label="Thumbnail URL (optional)">
                    <Input value={form.thumbnailUrl} onChange={e => set("thumbnailUrl", e.target.value)} className="rounded-none text-sm" placeholder="https://..." />
                  </F>
                </div>

                <F label="Video">
                  <div className="space-y-3">
                    <div className="flex gap-2 items-center">
                      <Video className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <Input value={form.videoUrl} onChange={e => set("videoUrl", e.target.value)} className="rounded-none flex-1 text-sm" placeholder="YouTube embed URL or upload below" />
                      {form.videoUrl && <Button variant="ghost" size="icon" className="rounded-none h-10 w-10 flex-shrink-0 text-muted-foreground hover:text-destructive" onClick={() => set("videoUrl", "")}><X className="w-4 h-4" /></Button>}
                    </div>

                    {/* Upload zone */}
                    <div
                      className="border-2 border-dashed border-border p-6 text-center cursor-pointer hover:border-accent transition-colors"
                      onClick={() => videoInputRef.current?.click()}
                      onDragOver={e => e.preventDefault()}
                      onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleUploadVideo(f); }}
                    >
                      <input ref={videoInputRef} type="file" accept="video/mp4,video/webm,video/ogg" className="hidden"
                        onChange={e => { const f = e.target.files?.[0]; if (f) handleUploadVideo(f); }} />
                      {uploading ? (
                        <div className="flex items-center justify-center gap-2">
                          <Loader2 className="w-5 h-5 animate-spin text-accent" />
                          <span className="text-sm text-muted-foreground">Uploading...</span>
                        </div>
                      ) : (
                        <>
                          <Upload className="w-5 h-5 text-muted-foreground mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground">Drop or <span className="text-accent underline underline-offset-2">click to upload</span></p>
                          <p className="text-xs text-muted-foreground/60 mt-1">MP4, WebM — max 100MB</p>
                        </>
                      )}
                    </div>

                    {form.videoUrl && !form.videoUrl.includes("youtube") && form.videoUrl.startsWith("/api/") && (
                      <video src={form.videoUrl} controls className="w-full max-h-36 bg-black rounded-none" />
                    )}
                    {form.videoUrl && (form.videoUrl.includes("youtube.com") || form.videoUrl.includes("youtu.be")) && (
                      <div className="aspect-video">
                        <iframe src={`https://www.youtube.com/embed/${form.videoUrl.match(/(?:embed\/|v=|youtu\.be\/)([^?&/]+)/)?.[1]}`}
                          className="w-full h-full" allow="fullscreen" />
                      </div>
                    )}
                  </div>
                </F>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="flex items-center gap-3 p-3 border border-border">
                    <Switch checked={form.isFeatured} onCheckedChange={v => set("isFeatured", v)} />
                    <Label className="text-xs uppercase tracking-wider">Featured</Label>
                  </div>
                  <div className="flex items-center gap-3 p-3 border border-border">
                    <Switch checked={form.isPublished} onCheckedChange={v => set("isPublished", v)} />
                    <Label className="text-xs uppercase tracking-wider">Published</Label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 p-6 border-t border-border">
                <Button variant="outline" className="rounded-none uppercase tracking-widest text-xs" onClick={close}>Cancel</Button>
                <Button className="rounded-none uppercase tracking-widest text-xs gap-2" onClick={handleSave} disabled={saving}>
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {modal.editId ? "Save Changes" : "Add Video"}
                </Button>
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
