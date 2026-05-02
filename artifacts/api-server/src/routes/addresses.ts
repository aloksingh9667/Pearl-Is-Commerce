import { Router } from "express";
import { db } from "@workspace/db";
import { addressesTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "../lib/auth";

const router = Router();

function toAddress(a: any) {
  return {
    id: a.id,
    name: a.name,
    line1: a.line1,
    line2: a.line2,
    city: a.city,
    state: a.state,
    postalCode: a.postalCode,
    country: a.country,
    phone: a.phone,
    isDefault: a.isDefault,
  };
}

router.get("/users/addresses", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const addresses = await db.select().from(addressesTable).where(eq(addressesTable.userId, userId));
    res.json(addresses.map(toAddress));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed" });
  }
});

router.post("/users/addresses", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const body = req.body;
    const [address] = await db.insert(addressesTable).values({
      userId, name: body.name, line1: body.line1, line2: body.line2,
      city: body.city, state: body.state, postalCode: body.postalCode,
      country: body.country, phone: body.phone, isDefault: body.isDefault ?? false,
    }).returning();
    res.status(201).json(toAddress(address));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed" });
  }
});

router.delete("/users/addresses/:id", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const id = parseInt(req.params.id);
    await db.delete(addressesTable).where(and(eq(addressesTable.id, id), eq(addressesTable.userId, userId)));
    res.json({ success: true, message: "Deleted" });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed" });
  }
});

export default router;
