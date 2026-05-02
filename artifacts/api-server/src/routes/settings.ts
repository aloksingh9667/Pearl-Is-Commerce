import { Router } from "express";
import { db } from "@workspace/db";
import { siteSettingsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAdmin } from "../lib/auth";

const router = Router();

// Default settings seeded on first request
const DEFAULT_SETTINGS: Record<string, any> = {
  branding: {
    siteName: "Pearlis",
    tagline: "Fine Jewellery",
    logoUrl: "",
    faviconUrl: "",
  },
  general: {
    siteName: "Pearlis",
    tagline: "Fine Jewellery",
    currency: "INR",
    currencySymbol: "₹",
    conversionRate: 83,
  },
  announcement: {
    enabled: true,
    text: "FREE SHIPPING ABOVE ₹5,000 | CODE PEARLIS10 FOR 10% OFF",
    link: "/shop",
  },
  payment: {
    codEnabled: true,
    razorpayEnabled: false,
    razorpayKeyId: "",
  },
  contact: {
    email: "concierge@pearlis.com",
    phone: "+91 98765 43210",
    address: "124 Luxury Lane, Mumbai, Maharashtra 400001, India",
    hours: "Mon-Sat 10am-7pm IST",
    whatsapp: "+91 98765 43210",
  },
  social: {
    instagram: "https://instagram.com/pearlisjewels",
    facebook: "https://facebook.com/pearlisjewels",
    twitter: "https://twitter.com/pearlisjewels",
    pinterest: "https://pinterest.com/pearlisjewels",
    youtube: "",
  },
  instagram: {
    enabled: true,
    username: "pearlisjewels",
    posts: [] as string[],
  },
  videos: [] as Array<{ title: string; url: string; thumbnail: string }>,
  atelierVideo: "",
  flashSale: {
    enabled: true,
    title: "Flash Sale",
    subtitle: "Up to 30% Off",
    endsAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
};

async function ensureSettings() {
  for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
    const existing = await db.select().from(siteSettingsTable).where(eq(siteSettingsTable.key, key));
    if (existing.length === 0) {
      await db.insert(siteSettingsTable).values({ key, value });
    }
  }
}

// GET all settings (public)
router.get("/settings", async (req, res) => {
  try {
    await ensureSettings();
    const settings = await db.select().from(siteSettingsTable);
    const result: Record<string, any> = {};
    for (const s of settings) {
      result[s.key] = s.value;
    }
    res.json(result);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to get settings" });
  }
});

// GET single setting by key (public)
router.get("/settings/:key", async (req, res) => {
  try {
    const [setting] = await db.select().from(siteSettingsTable).where(eq(siteSettingsTable.key, req.params.key));
    if (!setting) {
      const defaultVal = DEFAULT_SETTINGS[req.params.key];
      if (defaultVal !== undefined) {
        res.json({ key: req.params.key, value: defaultVal });
        return;
      }
      res.status(404).json({ error: "Setting not found" });
      return;
    }
    res.json({ key: setting.key, value: setting.value });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed" });
  }
});

// PUT single setting (admin only)
router.put("/settings/:key", requireAdmin, async (req, res) => {
  try {
    const { value } = req.body;
    const existing = await db.select().from(siteSettingsTable).where(eq(siteSettingsTable.key, req.params.key));
    if (existing.length === 0) {
      const [setting] = await db.insert(siteSettingsTable).values({
        key: req.params.key,
        value,
      }).returning();
      res.json({ key: setting.key, value: setting.value });
    } else {
      const [setting] = await db.update(siteSettingsTable)
        .set({ value, updatedAt: new Date() })
        .where(eq(siteSettingsTable.key, req.params.key))
        .returning();
      res.json({ key: setting.key, value: setting.value });
    }
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to update setting" });
  }
});

export default router;
