import mongoose from "mongoose";
import bcrypt from "bcryptjs";

export async function ensureAdminUser() {
  try {
    // Use direct collection access — bypasses ALL Mongoose hooks
    const db = mongoose.connection.db;
    const users = db.collection("users");

    const exists = await users.findOne({
      email: process.env.ADMIN_EMAIL?.toLowerCase()
    });

    if (exists) {
      console.log("[Admin] Admin user already exists, skipping seed.");
      return;
    }

    const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);

    await users.insertOne({
      name: process.env.ADMIN_NAME || "Admin",
      email: process.env.ADMIN_EMAIL?.toLowerCase(),
      phone: null,
      password: hashedPassword,
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    console.log("[Admin] ✅ Admin user created successfully!");
  } catch (err) {
    console.error("[Admin] Failed to seed admin user:", err.message);
  }
}