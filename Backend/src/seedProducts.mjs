
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import mongoose from "mongoose";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);

dotenv.config({ path: join(__dirname, "../.env") });

const MONGO_URL = process.env.MONGO_URL;
if (!MONGO_URL) {
  console.error("❌  MONGO_URL not set in .env");
  process.exit(1);
}

// Name-based category/price mapping (add more as needed)
const PRODUCT_RULES = [
  // Beverages
  { match: /bisleri|kinley|aquafina|water/i,          category: "Beverages", price: 20,  gstPercent: 12, unit: "piece" },
  { match: /pepsi|coke|coca|thums|sprite|limca|7up|mountain dew|fanta/i, category: "Beverages", price: 40, gstPercent: 28, unit: "piece" },
  { match: /juice|appy|real|maaza|slice|paper boat/i, category: "Beverages", price: 30,  gstPercent: 12, unit: "piece" },
  { match: /tea|chai|red label|tata tea|brooke bond/i,category: "Beverages", price: 120, gstPercent: 5,  unit: "pack" },
  { match: /coffee|nescafe|bru/i,                      category: "Beverages", price: 150, gstPercent: 5,  unit: "pack" },
  { match: /milk|amul milk|heritage|mother dairy/i,   category: "Dairy",     price: 55,  gstPercent: 5,  unit: "litre" },

  // Dairy
  { match: /butter|amul butter|britannia butter/i,    category: "Dairy",     price: 55,  gstPercent: 12, unit: "piece" },
  { match: /cheese|amul cheese/i,                     category: "Dairy",     price: 95,  gstPercent: 12, unit: "piece" },
  { match: /curd|yogurt|dahi/i,                        category: "Dairy",     price: 45,  gstPercent: 5,  unit: "piece" },
  { match: /paneer/i,                                  category: "Dairy",     price: 90,  gstPercent: 5,  unit: "piece" },

  // Snacks
  { match: /biscuit|parle|britannia|hide.*seek|good.*day|marie|oreo|cream|bourbon/i, category: "Snacks", price: 30, gstPercent: 18, unit: "pack" },
  { match: /chips|lays|kurkure|bingo|act.*ii|popcorn/i, category: "Snacks",  price: 20,  gstPercent: 18, unit: "pack" },
  { match: /wafer|pringles|haldiram/i,                 category: "Snacks",   price: 50,  gstPercent: 18, unit: "pack" },
  { match: /noodles|maggi|yippee|top ramen/i,          category: "Snacks",   price: 15,  gstPercent: 18, unit: "pack" },
  { match: /chocolate|kitkat|5 star|dairy milk|cadbury|munch|bar|gems/i, category: "Snacks", price: 20, gstPercent: 18, unit: "piece" },

  // Spices & Staples
  { match: /salt|tata salt|aashirvaad salt/i,          category: "Spices",   price: 22,  gstPercent: 0,  unit: "kg" },
  { match: /sugar|shakkar/i,                            category: "Staples",  price: 45,  gstPercent: 5,  unit: "kg" },
  { match: /rice|basmati|aashirvaad|india gate/i,      category: "Staples",  price: 65,  gstPercent: 5,  unit: "kg" },
  { match: /flour|atta|maida|wheat/i,                   category: "Staples",  price: 55,  gstPercent: 5,  unit: "kg" },
  { match: /oil|sunflower|groundnut|palm|soyabean|vegetable oil/i, category: "Staples", price: 130, gstPercent: 5, unit: "litre" },
  { match: /mustard|coriander|cumin|turmeric|chilli|pepper|masala|spice/i, category: "Spices", price: 35, gstPercent: 5, unit: "pack" },
  { match: /dal|lentil|toor|moong|chana|rajma|urad/i,  category: "Staples",  price: 80,  gstPercent: 5,  unit: "kg" },

  // Personal Care
  { match: /soap|lux|dove|lifebuoy|dettol|pears|santoor/i, category: "Personal Care", price: 35, gstPercent: 18, unit: "piece" },
  { match: /shampoo|sunsilk|head.*shoulders|pantene|clinic plus/i, category: "Personal Care", price: 90, gstPercent: 18, unit: "piece" },
  { match: /toothpaste|colgate|pepsodent|closeup/i,    category: "Personal Care", price: 60, gstPercent: 18, unit: "piece" },

  // Household
  { match: /detergent|surf|ariel|tide|wheel|rin|henko/i, category: "Household", price: 75, gstPercent: 18, unit: "kg" },
  { match: /dish|vim|pril|exo/i,                        category: "Household", price: 45,  gstPercent: 18, unit: "piece" },
  { match: /floor.*clean|phenyl|lizol|harpic|domex/i,  category: "Household", price: 80,  gstPercent: 18, unit: "piece" },
];

const DEFAULT_FIELDS = { price: 50, category: "Other", unit: "box", gstPercent: 5 };

function inferFields(name) {
  for (const rule of PRODUCT_RULES) {
    if (rule.match.test(name)) {
      return {
        price:      rule.price,
        category:   rule.category,
        unit:       rule.unit,
        gstPercent: rule.gstPercent,
      };
    }
  }
  return DEFAULT_FIELDS;
}

async function run() {
  console.log("🔌  Connecting to MongoDB…");
  await mongoose.connect(MONGO_URL);
  console.log("✅  Connected\n");

  const db         = mongoose.connection.db;
  const collection = db.collection("products");

  const products = await collection.find({}).toArray();
  console.log(`📦  Found ${products.length} products in collection\n`);

  if (!products.length) {
    console.log("⚠️   No products found. Add products first via the admin panel.");
    await mongoose.disconnect();
    return;
  }

  let updated = 0;

  for (const product of products) {
    const inferred = inferFields(product.name || "");

    // Only set fields that are missing / zero / falsy
    const $set = {};
    if (!product.price       || product.price === 0)     $set.price       = inferred.price;
    if (!product.category)                                $set.category    = inferred.category;
    if (!product.unit)                                    $set.unit        = inferred.unit;
    if (product.gstPercent == null)                       $set.gstPercent  = inferred.gstPercent;
    if (product.stock == null || product.stock === 0)     $set.stock       = 100;
    if (product.lowStockThreshold == null)                $set.lowStockThreshold = 10;
    if (product.isActive == null)                         $set.isActive    = true;
    if (product.mrp == null || product.mrp === 0)         $set.mrp         = Math.round(($set.price ?? product.price) * 1.15);

    if (Object.keys($set).length === 0) {
      console.log(`  ✔  ${product.name} — already complete, skipped`);
      continue;
    }

    await collection.updateOne({ _id: product._id }, { $set });
    console.log(`  ✅  ${product.name} → price: ₹${$set.price ?? product.price}, category: ${$set.category ?? product.category}, stock: ${$set.stock ?? product.stock}`);
    updated++;
  }

  console.log(`\n🎉  Done — updated ${updated} / ${products.length} products`);

  // Also make sure all products with isActive=false get set to true
  const activated = await collection.updateMany(
    { isActive: false },
    { $set: { isActive: true } }
  );
  if (activated.modifiedCount > 0) {
    console.log(`✅  Re-activated ${activated.modifiedCount} inactive products`);
  }

  await mongoose.disconnect();
  console.log("🔌  Disconnected. Done.");
}

run().catch((err) => {
  console.error("❌  Error:", err.message);
  process.exit(1);
});
