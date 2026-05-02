import { useState } from "react";
import { useListCoupons, useDeleteCoupon, useCreateCoupon, getListCouponsQueryKey } from "@workspace/api-client-react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Plus, Trash2, X, Tag } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

const fmtINR = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;
const fromINR = (n: number) => n / 83;

type CouponForm = {
  code: string; discountType: "percentage" | "fixed";
  discountValue: string; minOrderAmount: string;
  maxUses: string; expiresAt: string;
};

const emptyForm: CouponForm = {
  code: "", discountType: "percentage",
  discountValue: "", minOrderAmount: "",
  maxUses: "", expiresAt: "",
};

export default function AdminCoupons() {
  const { data: coupons, isLoading } = useListCoupons();
  const deleteCoupon = useDeleteCoupon();
  const createCoupon = useCreateCoupon();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<CouponForm>(emptyForm);
  const [saving, setSaving] = useState(false);

  const set = (f: keyof CouponForm, v: string) => setForm(p => ({ ...p, [f]: v }));

  const handleDelete = (id: number) => {
    if (!confirm("Delete this coupon?")) return;
    deleteCoupon.mutate({ id }, {
      onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListCouponsQueryKey() }); toast({ title: "Coupon Deleted" }); },
      onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
    });
  };

  const handleCreate = () => {
    if (!form.code || !form.discountValue) {
      toast({ title: "Code and discount value are required", variant: "destructive" }); return;
    }
    setSaving(true);

    const discountValue = form.discountType === "percentage"
      ? parseFloat(form.discountValue)
      : fromINR(parseFloat(form.discountValue));

    const minOrderAmount = form.minOrderAmount
      ? fromINR(parseFloat(form.minOrderAmount))
      : undefined;

    createCoupon.mutate({
      data: {
        code: form.code.toUpperCase(),
        discountType: form.discountType,
        discountValue,
        minOrderAmount,
        maxUses: form.maxUses ? parseInt(form.maxUses) : undefined,
        expiresAt: form.expiresAt || undefined,
      } as any,
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListCouponsQueryKey() });
        toast({ title: "Coupon Created" });
        setShowModal(false);
        setForm(emptyForm);
        setSaving(false);
      },
      onError: (e: any) => { toast({ title: "Error", description: e.message, variant: "destructive" }); setSaving(false); },
    });
  };

  const fmtDiscount = (coupon: any) =>
    coupon.discountType === "percentage"
      ? `${coupon.discountValue}%`
      : fmtINR(Math.round(coupon.discountValue * 83));

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-8">
        <h1 className="font-serif text-3xl">Coupons</h1>
        <Button className="rounded-none uppercase tracking-widest text-xs gap-2" onClick={() => { setForm(emptyForm); setShowModal(true); }}>
          <Plus className="w-4 h-4" /> Create Coupon
        </Button>
      </div>

      <div className="bg-card border border-border">
        {isLoading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-accent" /></div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead>Code</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead>Min Order</TableHead>
                <TableHead>Uses</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(coupons || []).map((coupon: any) => (
                <TableRow key={coupon.id} className="border-border">
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Tag className="w-3.5 h-3.5 text-accent" />
                      <span className="font-mono font-medium tracking-widest uppercase">{coupon.code}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium text-accent">{fmtDiscount(coupon)}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {coupon.minOrderAmount ? fmtINR(Math.round(coupon.minOrderAmount * 83)) : "—"}
                  </TableCell>
                  <TableCell className="text-sm">{coupon.usedCount || 0} / {coupon.maxUses || "∞"}</TableCell>
                  <TableCell>
                    <span className={`text-xs px-2 py-1 uppercase tracking-widest ${coupon.isActive ? "bg-green-50 text-green-700" : "bg-muted text-muted-foreground"}`}>
                      {coupon.isActive ? "Active" : "Inactive"}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {coupon.expiresAt ? format(new Date(coupon.expiresAt), "MMM d, yyyy") : "Never"}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" className="rounded-none h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => handleDelete(coupon.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
            onClick={() => setShowModal(false)}>
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }}
              className="bg-background border border-border w-full max-w-md"
              onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center p-6 border-b border-border">
                <h2 className="font-serif text-2xl">Create Coupon</h2>
                <button onClick={() => setShowModal(false)} className="p-1 hover:bg-muted rounded-sm"><X className="w-5 h-5" /></button>
              </div>
              <div className="p-6 space-y-4">
                <F label="Coupon Code *">
                  <Input value={form.code} onChange={e => set("code", e.target.value.toUpperCase())} className="rounded-none font-mono tracking-widest uppercase" placeholder="PEARLIS10" />
                </F>
                <div className="grid grid-cols-2 gap-4">
                  <F label="Discount Type">
                    <Select value={form.discountType} onValueChange={v => set("discountType", v as any)}>
                      <SelectTrigger className="rounded-none"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">Percentage (%)</SelectItem>
                        <SelectItem value="fixed">Fixed (₹)</SelectItem>
                      </SelectContent>
                    </Select>
                  </F>
                  <F label={form.discountType === "percentage" ? "Discount %" : "Discount Amount (₹)"}>
                    <Input type="number" value={form.discountValue} onChange={e => set("discountValue", e.target.value)} className="rounded-none"
                      placeholder={form.discountType === "percentage" ? "10" : "2000"} />
                    {form.discountValue && form.discountType === "percentage" && (
                      <p className="text-xs text-muted-foreground mt-1">{form.discountValue}% off</p>
                    )}
                    {form.discountValue && form.discountType === "fixed" && (
                      <p className="text-xs text-accent mt-1">₹{parseInt(form.discountValue).toLocaleString("en-IN")} off</p>
                    )}
                  </F>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <F label="Min Order Amount (₹)">
                    <Input type="number" value={form.minOrderAmount} onChange={e => set("minOrderAmount", e.target.value)} className="rounded-none" placeholder="5000" />
                    {form.minOrderAmount && <p className="text-xs text-muted-foreground mt-1">₹{parseInt(form.minOrderAmount).toLocaleString("en-IN")}</p>}
                  </F>
                  <F label="Max Uses">
                    <Input type="number" value={form.maxUses} onChange={e => set("maxUses", e.target.value)} className="rounded-none" placeholder="Unlimited" />
                  </F>
                </div>
                <F label="Expiry Date (Optional)">
                  <Input type="date" value={form.expiresAt} onChange={e => set("expiresAt", e.target.value)} className="rounded-none" />
                </F>
              </div>
              <div className="flex justify-end gap-3 p-6 border-t border-border">
                <Button variant="outline" className="rounded-none uppercase tracking-widest text-xs" onClick={() => setShowModal(false)}>Cancel</Button>
                <Button className="rounded-none uppercase tracking-widest text-xs gap-2" onClick={handleCreate} disabled={saving}>
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  Create Coupon
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
