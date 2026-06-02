import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
    agency: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Agency",
      required: [true, "Agency is required"],
    },
    category: {
      type: String,
      enum: ["Beverages", "Snacks", "Dairy", "Personal Care", "Household", "Staples", "Other"],
      default: "Other",
    },
    sku: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    // ── Pricing ──
    price: { type: Number, default: 0, min: 0 },   // retail/piece price
    mrp:   { type: Number, default: 0, min: 0 },   // MRP on packet

    // ── Unit pricing ──
    piecePrice:    { type: Number, default: 0, min: 0 }, // price per single piece
    boxPrice:      { type: Number, default: 0, min: 0 }, // price per box
    bagPrice:      { type: Number, default: 0, min: 0 }, // price per bag
    piecesPerBox:  { type: Number, default: 0, min: 0 }, // how many pieces in 1 box
    piecesPerBag:  { type: Number, default: 0, min: 0 }, // how many pieces in 1 bag

    // which unit options to show on public page
    availableUnits: {
      type: [String],
      enum: ["piece", "box", "bag", "kg", "litre", "pack"],
      default: ["piece"],
    },

    gstPercent: {
      type: Number,
      enum: [0, 5, 12, 18, 28],
      default: 5,
    },
    stock:             { type: Number, default: 0, min: 0 },
    lowStockThreshold: { type: Number, default: 10, min: 0 },
    isActive:          { type: Boolean, default: true },
  },
  { timestamps: true }
);

productSchema.index({ name: 1, agency: 1 }, { unique: true });

export default mongoose.models.Product || mongoose.model("Product", productSchema);
