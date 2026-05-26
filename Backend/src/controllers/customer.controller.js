import { asyncHandler } from "../middleware/error.middleware.js";
import Customer from "../Models/Customer.js";
import Order from "../Models/Order.js";

const buildPagination = (page, limit, total) => ({
  total,
  page,
  limit,
  pages: Math.max(Math.ceil(total / limit), 1),
});

export const getCustomers = asyncHandler(async (req, res) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.max(Number(req.query.limit) || 20, 1);
  const skip = (page - 1) * limit;
  const search = req.query.search?.trim();
  const isActive = req.query.isActive;

  const filter = {};
  if (search) {
    filter.$or = [
      { shopName: { $regex: search, $options: "i" } },
      { ownerName: { $regex: search, $options: "i" } },
      { phone: { $regex: search, $options: "i" } },
      { area: { $regex: search, $options: "i" } },
    ];
  }
  if (isActive === "true" || isActive === "false") {
    filter.isActive = isActive === "true";
  }

  const [customers, total] = await Promise.all([
    Customer.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Customer.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: customers,
    meta: buildPagination(page, limit, total),
  });
});

export const getCustomer = asyncHandler(async (req, res) => {
  const customer = await Customer.findById(req.params.id);
  if (!customer) {
    res.status(404);
    throw new Error("Customer not found");
  }

  res.json({
    success: true,
    data: customer,
  });
});

export const getCustomerOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ customer: req.params.id })
    .populate("customer", "shopName ownerName phone")
    .populate("items.product", "name")
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    data: orders,
  });
});

export const createCustomer = asyncHandler(async (req, res) => {
  const { shopName, phone } = req.body;
  if (!shopName || !phone) {
    res.status(400);
    throw new Error("Shop name and phone are required");
  }

  const customer = await Customer.create(req.body);
  res.status(201).json({
    success: true,
    message: "Customer created successfully",
    data: customer,
  });
});

export const updateCustomer = asyncHandler(async (req, res) => {
  const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!customer) {
    res.status(404);
    throw new Error("Customer not found");
  }

  res.json({
    success: true,
    message: "Customer updated successfully",
    data: customer,
  });
});
