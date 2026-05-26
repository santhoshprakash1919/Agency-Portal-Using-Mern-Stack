import { asyncHandler } from "../middleware/error.middleware.js";
import Product from "../Models/Product.js";

const buildPagination = (page, limit, total) => ({
  total,
  page,
  limit,
  pages: Math.max(Math.ceil(total / limit), 1),
});

export const getProducts = asyncHandler(async (req, res) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.max(Number(req.query.limit) || 20, 1);
  const skip = (page - 1) * limit;
  const { search, category, agency, lowStock, isActive } = req.query;

  const filter = {};
  if (search) {
    filter.name = { $regex: search.trim(), $options: "i" };
  }
  if (category) {
    filter.category = category;
  }
  if (agency) {
    filter.agency = agency;
  }
  if (isActive === "true" || isActive === "false") {
    filter.isActive = isActive === "true";
  } else {
    filter.isActive = true;
  }
  if (lowStock === "true") {
    filter.$expr = { $lte: ["$stock", "$lowStockThreshold"] };
  }

  const [products, total] = await Promise.all([
    Product.find(filter).populate("agency").sort({ createdAt: -1 }).skip(skip).limit(limit),
    Product.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: products,
    meta: buildPagination(page, limit, total),
  });
});

export const getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).populate("agency");
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  res.json({
    success: true,
    data: product,
  });
});

export const createProduct = asyncHandler(async (req, res) => {
  const { name, agency } = req.body;
  if (!name || !agency) {
    res.status(400);
    throw new Error("Product name and agency are required");
  }

  const product = await Product.create(req.body);
  const populated = await product.populate("agency");

  res.status(201).json({
    success: true,
    message: "Product created successfully",
    data: populated,
  });
});

export const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  }).populate("agency");

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  res.json({
    success: true,
    message: "Product updated successfully",
    data: product,
  });
});

export const updateStock = asyncHandler(async (req, res) => {
  const { stock } = req.body;
  if (typeof stock !== "number" || stock < 0) {
    res.status(400);
    throw new Error("Stock must be a non-negative number");
  }

  const product = await Product.findByIdAndUpdate(
    req.params.id,
    { stock },
    { new: true, runValidators: true }
  ).populate("agency");

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  res.json({
    success: true,
    message: "Stock updated successfully",
    data: product,
  });
});

export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  res.json({
    success: true,
    message: "Product deleted successfully",
  });
});
