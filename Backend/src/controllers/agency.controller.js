import { asyncHandler } from "../middleware/error.middleware.js";
import Agency from "../Models/Agency.js";
import Product from "../Models/Product.js";

export const getAgencies = asyncHandler(async (req, res) => {
  const agencies = await Agency.find().sort({ name: 1 }).lean();
  const counts = await Product.aggregate([{ $group: { _id: "$agency", productCount: { $sum: 1 } } }]);
  const countMap = new Map(counts.map((item) => [String(item._id), item.productCount]));

  res.json({
    success: true,
    data: agencies.map((agency) => ({
      ...agency,
      productCount: countMap.get(String(agency._id)) || 0,
    })),
  });
});

export const createAgency = asyncHandler(async (req, res) => {
  const agency = await Agency.create(req.body);

  res.status(201).json({
    success: true,
    message: "Agency created successfully",
    data: agency,
  });
});

export const updateAgency = asyncHandler(async (req, res) => {
  const agency = await Agency.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!agency) {
    res.status(404);
    throw new Error("Agency not found");
  }

  res.json({
    success: true,
    message: "Agency updated successfully",
    data: agency,
  });
});
