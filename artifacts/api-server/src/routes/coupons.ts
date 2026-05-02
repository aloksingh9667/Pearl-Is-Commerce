import { Router } from "express";
import { db } from "@workspace/db";
import { couponsTable, newsletterTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAdmin } from "../lib/auth";

const router = Router();

function toCoupon(c: any) {
  return {
    id: c.id, code: c.code, discountType: c.discountType,
    discountValue: parseFloat(c.discountValue),
    minOrderAmount: c.minOrderAmount ? parseFloat(c.minOrderAmount) : null,
    maxUses: c.maxUses, usedCount: c.usedCount, isActive: c.isActive,
    expiresAt: c.expiresAt?.toISOString() || null,
  };
}

router.get("/coupons", requireAdmin, async (req, res) => {
  try {
    const coupons = await db.select().from(couponsTable);
    res.json(coupons.map(toCoupon));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed" });
  }
});

router.post("/coupons", requireAdmin, async (req, res) => {
  try {
    const body = req.body;
    const [coupon] = await db.insert(couponsTable).values({
      code: body.code.toUpperCase(), discountType: body.discountType,
      discountValue: body.discountValue.toString(),
      minOrderAmount: body.minOrderAmount?.toString(),
      maxUses: body.maxUses,
      expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
    }).returning();
    res.status(201).json(toCoupon(coupon));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to create coupon" });
  }
});

router.delete("/coupons/:id", requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(couponsTable).where(eq(couponsTable.id, id));
    res.json({ success: true, message: "Deleted" });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to delete coupon" });
  }
});

router.post("/newsletter/subscribe", async (req, res) => {
  try {
    const { email } = req.body;
    try {
      await db.insert(newsletterTable).values({ email });
    } catch {
      // Already subscribed - that's ok
    }
    res.json({ success: true, message: "Subscribed successfully" });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to subscribe" });
  }
});

export default router;
