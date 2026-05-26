import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    unitPrice: {
      type: Number,
      default: 0,
      min: 0,
    },
    gstPercent: {
      type: Number,
      enum: [0, 5, 12, 18, 28],
      default: 0,
    },
    total: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { _id: false }
);

const statusTimelineSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      required: true,
    },
    changedAt: {
      type: Date,
      default: Date.now,
    },
    note: {
      type: String,
      trim: true,
    },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      unique: true,
      sparse: true,
    },
    storeName: {
      type: String,
      trim: true,
    },
    customerName: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
    },
    items: {
      type: [orderItemSchema],
      default: [],
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },
    quantity: {
      type: Number,
      min: 1,
    },
    subtotal: {
      type: Number,
      default: 0,
      min: 0,
    },
    gstTotal: {
      type: Number,
      default: 0,
      min: 0,
    },
    grandTotal: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "packed", "dispatched", "delivered", "cancelled"],
      default: "pending",
    },
    paymentStatus: {
      type: String,
      enum: ["unpaid", "partial", "paid"],
      default: "unpaid",
    },
    notes: {
      type: String,
      trim: true,
    },
    statusTimeline: {
      type: [statusTimelineSchema],
      default: [],
    },
  },
  { timestamps: true }
);

orderSchema.pre("save", async function preSave() {
  if (this.isNew && !this.orderNumber) {
    const count = await this.constructor.countDocuments();
    this.orderNumber = `SA-${new Date().getFullYear()}-${String(count + 1).padStart(5, "0")}`;
  }

  if (!this.statusTimeline.length) {
    this.statusTimeline = [
      {
        status: this.status || "pending",
        changedAt: new Date(),
        note: "Order created",
      },
    ];
  }
});

export default mongoose.models.Order || mongoose.model("Order", orderSchema);
