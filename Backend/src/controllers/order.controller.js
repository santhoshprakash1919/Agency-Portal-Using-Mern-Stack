import { asyncHandler } from "../middleware/error.middleware.js";
import Customer from "../Models/Customer.js";
import Order from "../Models/Order.js";
import Product from "../Models/Product.js";

const buildPagination = (page, limit, total) => ({
  total,
  page,
  limit,
  pages: Math.max(Math.ceil(total / limit), 1),
});

const populateOrder = (query) =>
  query
    .populate("customer", "shopName ownerName phone area")
    .populate("product")
    .populate({
      path: "items.product",
      populate: { path: "agency" },
    });

const buildOrderItems = async (payloadItems = [], legacyProduct, legacyQuantity) => {
  const normalizedItems =
    Array.isArray(payloadItems) && payloadItems.length
      ? payloadItems
      : legacyProduct
        ? [{ product: legacyProduct, quantity: legacyQuantity || 1 }]
        : [];

  if (!normalizedItems.length) {
    const error = new Error("At least one order item is required");
    error.statusCode = 400;
    throw error;
  }

  const ids = normalizedItems.map((item) => item.product);
  const products = await Product.find({ _id: { $in: ids } });
  const productMap = new Map(products.map((product) => [String(product._id), product]));

  return normalizedItems.map((item) => {
    const product = productMap.get(String(item.product));
    if (!product) {
      const error = new Error(`Product not found for item ${item.product}`);
      error.statusCode = 400;
      throw error;
    }

    const quantity = Number(item.quantity) || 1;
    const unitPrice = Number(item.unitPrice ?? product.price ?? 0);
    const gstPercent = Number(item.gstPercent ?? product.gstPercent ?? 0);
    const taxableAmount = unitPrice * quantity;
    const total = Number((taxableAmount + taxableAmount * (gstPercent / 100)).toFixed(2));

    return {
      product: product._id,
      quantity,
      unitPrice,
      gstPercent,
      total,
    };
  });
};

const calculateTotals = (items) => {
  const subtotal = Number(
    items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0).toFixed(2)
  );
  const grandTotal = Number(items.reduce((sum, item) => sum + item.total, 0).toFixed(2));
  const gstTotal = Number((grandTotal - subtotal).toFixed(2));

  return { subtotal, gstTotal, grandTotal };
};

const syncLegacyCustomerFields = async (payload) => {
  if (!payload.customer) {
    return payload;
  }

  const customer = await Customer.findById(payload.customer);
  if (!customer) {
    const error = new Error("Customer not found");
    error.statusCode = 400;
    throw error;
  }

  return {
    ...payload,
    storeName: payload.storeName || customer.shopName,
    customerName: payload.customerName || customer.ownerName || customer.shopName,
    phone: payload.phone || customer.phone,
  };
};

export const getOrders = asyncHandler(async (req, res) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.max(Number(req.query.limit) || 20, 1);
  const skip = (page - 1) * limit;
  const { status, paymentStatus, search, customer } = req.query;

  const filter = {};
  if (status) {
    filter.status = status;
  }
  if (paymentStatus) {
    filter.paymentStatus = paymentStatus;
  }
  if (customer) {
    filter.customer = customer;
  }
  if (search) {
    filter.$or = [
      { orderNumber: { $regex: search.trim(), $options: "i" } },
      { customerName: { $regex: search.trim(), $options: "i" } },
      { storeName: { $regex: search.trim(), $options: "i" } },
      { phone: { $regex: search.trim(), $options: "i" } },
    ];
  }

  const [orders, total] = await Promise.all([
    populateOrder(Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit)),
    Order.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: orders,
    meta: buildPagination(page, limit, total),
  });
});

export const getOrder = asyncHandler(async (req, res) => {
  const order = await populateOrder(Order.findById(req.params.id));
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  res.json({
    success: true,
    data: order,
  });
});

export const getPublicOrderInvoice = asyncHandler(async (req, res) => {
  const order = await populateOrder(Order.findOne({ orderNumber: req.params.orderNumber }));
  if (!order) {
    res.status(404);
    throw new Error("Invoice not found");
  }

  res.json({
    success: true,
    data: order,
  });
});

export const createOrder = asyncHandler(async (req, res) => {
  const payload = await syncLegacyCustomerFields(req.body);
  const items = await buildOrderItems(payload.items, payload.product, payload.quantity);
  const totals = calculateTotals(items);

  const order = await Order.create({
    ...payload,
    items,
    product: payload.product || items[0]?.product,
    quantity: payload.quantity || items[0]?.quantity,
    ...totals,
  });

  const populated = await populateOrder(Order.findById(order._id));

  res.status(201).json({
    success: true,
    message: "Order created successfully",
    data: populated,
  });
});

export const updateOrder = asyncHandler(async (req, res) => {
  const existingOrder = await Order.findById(req.params.id);
  if (!existingOrder) {
    res.status(404);
    throw new Error("Order not found");
  }

  const payload = await syncLegacyCustomerFields({ ...existingOrder.toObject(), ...req.body });
  const items =
    req.body.items || req.body.product || req.body.quantity
      ? await buildOrderItems(payload.items, payload.product, payload.quantity)
      : existingOrder.items;
  const totals = calculateTotals(items);
  const statusChanged = req.body.status && req.body.status !== existingOrder.status;

  Object.assign(existingOrder, payload, totals, {
    items,
    product: payload.product || items[0]?.product || existingOrder.product,
    quantity: payload.quantity || items[0]?.quantity || existingOrder.quantity,
  });

  if (statusChanged) {
    existingOrder.statusTimeline.push({
      status: req.body.status,
      changedAt: new Date(),
      note: req.body.statusNote || "Status updated",
    });
  }

  await existingOrder.save();

  const populated = await populateOrder(Order.findById(existingOrder._id));
  res.json({
    success: true,
    message: "Order updated successfully",
    data: populated,
  });
});

export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, note } = req.body;
  const validStatuses = ["pending", "confirmed", "packed", "dispatched", "delivered", "cancelled"];

  if (!validStatuses.includes(status)) {
    res.status(400);
    throw new Error("Invalid order status");
  }

  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  order.status = status;
  order.statusTimeline.push({
    status,
    changedAt: new Date(),
    note: note || "Status updated",
  });
  await order.save();

  const populated = await populateOrder(Order.findById(order._id));

  res.json({
    success: true,
    message: "Order status updated successfully",
    data: populated,
  });
});

export const deleteOrder = asyncHandler(async (req, res) => {
  const order = await Order.findByIdAndDelete(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  res.json({
    success: true,
    message: "Order deleted successfully",
  });
});
