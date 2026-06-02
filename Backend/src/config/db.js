import mongoose from "mongoose";

const connectDB = async (retries = 3) => {
  // Auto-reconnect if connection drops later
  mongoose.connection.on("disconnected", () => {
    console.log("[DB] Disconnected — reconnecting in 5s...");
    setTimeout(() => connectDB(3), 5000);
  });

  for (let i = 0; i < retries; i++) {
    try {
      const conn = await mongoose.connect(process.env.MONGO_URL, {
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
        maxIdleTimeMS: 270000,
      });
      console.log(`[DB] Connected: ${conn.connection.host}`);
      return conn;
    } catch (err) {
      console.error(`[DB] Attempt ${i + 1}/${retries} failed:`, err.message);
      if (i < retries - 1) {
        const delay = Math.pow(2, i) * 1000;
        console.log(`[DB] Retrying in ${delay / 1000}s...`);
        await new Promise((r) => setTimeout(r, delay));
      } else {
        console.error("[DB] All attempts failed — exiting");
        process.exit(1);
      }
    }
  }
};

export default connectDB;