/**
 * createAdmin.mjs
 * Run from the Backend folder:  node src/createAdmin.mjs
 *
 * Directly inserts/updates the admin user in MongoDB using bcrypt,
 * reading credentials from Backend/.env
 */
import { createRequire } from "module";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);

// Load .env one folder up from src/
dotenv.config({ path: join(__dirname, "../.env") });

const MONGO_URL = process.env.MONGO_URL;
if (!MONGO_URL) {
  console.error("❌  MONGO_URL not set in .env");
  process.exit(1);
}

const email    = (process.env.ADMIN_EMAIL    || "admin@sindhugencies.com").trim().toLowerCase();
const name     = (process.env.ADMIN_NAME     || "Admin").trim();
const password = (process.env.ADMIN_PASSWORD || "Admin@123").trim();

async function run() {
  console.log("🔌  Connecting to MongoDB…");
  await mongoose.connect(MONGO_URL);
  console.log("✅  Connected");

  const db         = mongoose.connection.db;
  const collection = db.collection("users");

  const hashed = await bcrypt.hash(password, 10);

  const result = await collection.updateOne(
    { email },
    {
      $set: {
        name,
        email,
        password: hashed,
        role: "admin",
        updatedAt: new Date(),
      },
      $setOnInsert: { createdAt: new Date() },
    },
    { upsert: true }
  );

  if (result.upsertedCount > 0) {
    console.log(`✅  Admin user CREATED — ${email}`);
  } else {
    console.log(`✅  Admin user UPDATED — ${email}`);
  }

  console.log(`\n   📧  Email    : ${email}`);
  console.log(`   🔑  Password : ${password}`);
  console.log(`   👤  Role     : admin\n`);

  await mongoose.disconnect();
  console.log("🔌  Disconnected. Done.");
}

run().catch((err) => {
  console.error("❌  Error:", err.message);
  process.exit(1);
});