import mongoose from "mongoose";

const customerSchema = new mongoose.Schema(
  {
    shopName: {
      type: String,
      required: [true, "Shop name is required"],
      trim: true,
    },
    ownerName: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      required: [true, "Phone is required"],
      unique: true,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    area: {
      type: String,
      trim: true,
    },
    gstNumber: {
      type: String,
      trim: true,
    },
    creditLimit: {
      type: Number,
      default: 0,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

customerSchema.index({ shopName: "text", ownerName: "text", phone: "text", area: "text" });

export default mongoose.models.Customer || mongoose.model("Customer", customerSchema);
