import pg from "pg";
import bcrypt from "bcryptjs";

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function query(text, params) {
  return pool.query(text, params);
}

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || "";

async function seed() {
  console.log("Seeding database...");

  // Admin user
  const passwordHash = await bcrypt.hash("Pearl@Admin2024", 10);
  await query(`
    INSERT INTO users (email, password_hash, name, role)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (email) DO NOTHING
  `, ["admin@pearlis.com", passwordHash, "Admin", "admin"]);
  console.log("✓ Admin user");

  // Categories
  const categories = [
    { name: "Rings", slug: "rings", description: "Exquisite rings for every occasion", image_url: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600" },
    { name: "Necklaces", slug: "necklaces", description: "Timeless necklaces and chains", image_url: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600" },
    { name: "Pendants", slug: "pendants", description: "Beautiful pendants and charms", image_url: "https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=600" },
    { name: "Bracelets", slug: "bracelets", description: "Elegant bracelets and bangles", image_url: "https://images.unsplash.com/photo-1573408301185-9519f94816a3?w=600" },
    { name: "Earrings", slug: "earrings", description: "Statement earrings for every style", image_url: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600" },
    { name: "Accessories", slug: "accessories", description: "Luxury accessories and more", image_url: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600" },
  ];
  for (const cat of categories) {
    await query(`
      INSERT INTO categories (name, slug, image_url, description, product_count)
      VALUES ($1, $2, $3, $4, 0)
      ON CONFLICT (slug) DO NOTHING
    `, [cat.name, cat.slug, cat.image_url, cat.description]);
  }
  console.log("✓ Categories");

  // Products
  const products = [
    { name: "Solitaire Diamond Ring", slug: "solitaire-diamond-ring", category: "rings", price: "450", discount_price: "399", material: "18K White Gold", is_featured: true, is_new: true, is_trending: true, stock: 10, images: JSON.stringify(["https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600","https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?w=600"]), description: "A breathtaking solitaire diamond ring crafted in 18K white gold." },
    { name: "Pearl Drop Necklace", slug: "pearl-drop-necklace", category: "necklaces", price: "280", discount_price: null, material: "Sterling Silver", is_featured: true, is_new: false, is_trending: true, stock: 15, images: JSON.stringify(["https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600","https://images.unsplash.com/photo-1596944924591-168c9a1a08a7?w=600"]), description: "Lustrous freshwater pearl pendant on a delicate sterling silver chain." },
    { name: "Gold Lotus Pendant", slug: "gold-lotus-pendant", category: "pendants", price: "195", discount_price: "175", material: "22K Gold", is_featured: true, is_new: true, is_trending: false, stock: 20, images: JSON.stringify(["https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=600","https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=600"]), description: "Sacred lotus pendant in 22K gold, symbolizing purity and grace." },
    { name: "Diamond Tennis Bracelet", slug: "diamond-tennis-bracelet", category: "bracelets", price: "620", discount_price: "580", material: "Platinum", is_featured: true, is_new: false, is_trending: true, stock: 8, images: JSON.stringify(["https://images.unsplash.com/photo-1573408301185-9519f94816a3?w=600","https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600"]), description: "Timeless tennis bracelet featuring brilliant-cut diamonds in platinum." },
    { name: "Chandelier Earrings", slug: "chandelier-earrings", category: "earrings", price: "165", discount_price: null, material: "18K Yellow Gold", is_featured: false, is_new: true, is_trending: true, stock: 12, images: JSON.stringify(["https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600","https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600"]), description: "Glamorous chandelier earrings with cascading diamond clusters." },
    { name: "Emerald Cocktail Ring", slug: "emerald-cocktail-ring", category: "rings", price: "390", discount_price: "350", material: "18K Gold", is_featured: false, is_new: true, is_trending: false, stock: 6, images: JSON.stringify(["https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?w=600","https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600"]), description: "Vivid Colombian emerald in a hand-crafted 18K gold cocktail setting." },
    { name: "Rose Gold Bangle Set", slug: "rose-gold-bangle-set", category: "bracelets", price: "240", discount_price: null, material: "18K Rose Gold", is_featured: false, is_new: false, is_trending: true, stock: 18, images: JSON.stringify(["https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600","https://images.unsplash.com/photo-1573408301185-9519f94816a3?w=600"]), description: "Set of three sleek rose gold bangles, perfect for stacking." },
    { name: "Sapphire Stud Earrings", slug: "sapphire-stud-earrings", category: "earrings", price: "210", discount_price: "185", material: "White Gold", is_featured: false, is_new: false, is_trending: false, stock: 14, images: JSON.stringify(["https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600","https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=600"]), description: "Deep blue Ceylon sapphires set in classic white gold studs." },
    { name: "Layered Gold Necklace", slug: "layered-gold-necklace", category: "necklaces", price: "320", discount_price: "290", material: "14K Gold", is_featured: false, is_new: true, is_trending: true, stock: 11, images: JSON.stringify(["https://images.unsplash.com/photo-1596944924591-168c9a1a08a7?w=600","https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600"]), description: "Effortlessly chic three-layer gold necklace for everyday luxury." },
    { name: "Moonstone Silver Pendant", slug: "moonstone-silver-pendant", category: "pendants", price: "145", discount_price: null, material: "Sterling Silver", is_featured: false, is_new: false, is_trending: true, stock: 22, images: JSON.stringify(["https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=600","https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=600"]), description: "Ethereal blue moonstone in a handcrafted sterling silver bezel." },
    { name: "Luxury Watch Chain", slug: "luxury-watch-chain", category: "accessories", price: "180", discount_price: "160", material: "Gold Plated", is_featured: false, is_new: false, is_trending: false, stock: 9, images: JSON.stringify(["https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600","https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=600"]), description: "Premium gold-plated chain, the perfect accessory for any timepiece." },
    { name: "Diamond Eternity Band", slug: "diamond-eternity-band", category: "rings", price: "550", discount_price: "499", material: "Platinum", is_featured: true, is_new: true, is_trending: true, stock: 5, images: JSON.stringify(["https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600","https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?w=600"]), description: "Full-cut diamonds encircling a classic platinum eternity band." },
  ];

  for (const p of products) {
    const catResult = await query(`SELECT id FROM categories WHERE slug = $1`, [p.category]);
    const catId = catResult.rows[0]?.id || null;
    await query(`
      INSERT INTO products (name, slug, description, price, discount_price, category_id, category, material, images, stock, is_new, is_trending, is_featured, rating, review_count, tags, sizes, material_variants)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9::jsonb,$10,$11,$12,$13,4.5,0,'[]'::jsonb,'[]'::jsonb,'[]'::jsonb)
      ON CONFLICT (slug) DO NOTHING
    `, [p.name, p.slug, p.description, p.price, p.discount_price, catId, p.category, p.material, p.images, p.stock, p.is_new, p.is_trending, p.is_featured]);
    // Update category product count
    await query(`UPDATE categories SET product_count = product_count + 1 WHERE id = $1`, [catId]);
  }
  console.log("✓ Products");

  // Coupons
  await query(`
    INSERT INTO coupons (code, discount_type, discount_value, min_order_amount, is_active)
    VALUES ('PEARLIS10', 'percentage', 10, 60.24, true),
           ('WELCOME2000', 'fixed', 24.10, 180.72, true)
    ON CONFLICT (code) DO NOTHING
  `);
  console.log("✓ Coupons");

  // Blog posts
  const blogs = [
    { title: "The Art of Jewellery Crafting", slug: "art-of-jewellery-crafting", excerpt: "Discover the ancient techniques behind our handcrafted pieces.", content: "At Pearlis, every piece is born from generations of craft mastery. Our artisans blend ancient goldsmithing traditions with modern precision to create jewellery that lasts lifetimes.", image_url: "https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=800", author: "Pearlis Team" },
    { title: "Choosing the Perfect Diamond", slug: "choosing-perfect-diamond", excerpt: "A complete guide to the 4 Cs: Cut, Clarity, Colour and Carat.", content: "When selecting a diamond, understanding the four Cs is essential. Cut determines brilliance, colour affects warmth, clarity reflects purity, and carat measures size.", image_url: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800", author: "Pearlis Team" },
    { title: "Summer 2024 Jewellery Trends", slug: "summer-2024-trends", excerpt: "From layered necklaces to statement rings — this season's must-haves.", content: "This summer is all about bold self-expression. Layered necklaces, chunky gold hoops and colourful gemstone cocktail rings are dominating the trend landscape.", image_url: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800", author: "Pearlis Style" },
  ];
  for (const b of blogs) {
    await query(`
      INSERT INTO blogs (title, slug, excerpt, content, image_url, author, tags)
      VALUES ($1,$2,$3,$4,$5,$6,'[]'::jsonb)
      ON CONFLICT (slug) DO NOTHING
    `, [b.title, b.slug, b.excerpt, b.content, b.image_url, b.author]);
  }
  console.log("✓ Blogs");

  // Site settings — enable Razorpay
  const paymentSetting = {
    codEnabled: true,
    razorpayEnabled: true,
    razorpayKeyId: RAZORPAY_KEY_ID,
  };
  await query(`
    INSERT INTO site_settings (key, value)
    VALUES ('payment', $1::jsonb)
    ON CONFLICT (key) DO UPDATE SET value = $1::jsonb, updated_at = NOW()
  `, [JSON.stringify(paymentSetting)]);
  console.log("✓ Payment settings (Razorpay enabled)");

  // Announcement setting
  await query(`
    INSERT INTO site_settings (key, value)
    VALUES ('announcement', '{"enabled":true,"text":"FREE SHIPPING ABOVE ₹5,000 | CODE PEARLIS10 FOR 10% OFF","link":"/shop"}'::jsonb)
    ON CONFLICT (key) DO NOTHING
  `);
  console.log("✓ Announcement settings");

  console.log("\n✅ Seed complete!");
  await pool.end();
}

seed().catch(err => {
  console.error("Seed failed:", err);
  pool.end();
  process.exit(1);
});
