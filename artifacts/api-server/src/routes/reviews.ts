import { Router } from "express";
import { db } from "@workspace/db";
import { reviewsTable, productsTable } from "@workspace/db";
import { eq, avg, count } from "drizzle-orm";

const router = Router();

function toReview(r: any) {
  return {
    id: r.id,
    productId: r.productId,
    userId: r.userId,
    userName: r.userName,
    rating: r.rating,
    comment: r.comment,
    createdAt: r.createdAt?.toISOString(),
  };
}

router.get("/products/:id/reviews", async (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    const reviews = await db.select().from(reviewsTable).where(eq(reviewsTable.productId, productId));
    res.json(reviews.map(toReview));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed" });
  }
});

router.post("/products/:id/reviews", async (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    const { rating, comment, userName } = req.body;
    const [review] = await db.insert(reviewsTable).values({
      productId, rating, comment, userName: userName || "Anonymous",
    }).returning();

    const [stats] = await db.select({
      avgRating: avg(reviewsTable.rating),
      reviewCount: count(reviewsTable.id),
    }).from(reviewsTable).where(eq(reviewsTable.productId, productId));

    if (stats) {
      await db.update(productsTable).set({
        rating: (parseFloat(stats.avgRating || "0")).toFixed(2),
        reviewCount: Number(stats.reviewCount),
      }).where(eq(productsTable.id, productId));
    }

    res.status(201).json(toReview(review));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to create review" });
  }
});

export default router;
