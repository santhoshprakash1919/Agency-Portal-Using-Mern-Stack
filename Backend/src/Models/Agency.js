import mongoose from "mongoose";

const agencySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Agency name is required"],
      trim: true,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
    },
  },
  { timestamps: true }
);

agencySchema.index({ name: 1, category: 1 }, { unique: true });

export default mongoose.models.Agency || mongoose.model("Agency", agencySchema);
