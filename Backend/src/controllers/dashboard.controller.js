import { asyncHandler } from "../middleware/error.middleware.js";
import Order from "../Models/Order.js";
import Product from "../Models/Product.js";

export const getStats = asyncHandler(async (req, res) => {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [todayOrders, monthlyRevenue, pendingOrders, lowStockAlerts] = await Promise.all([
    Order.countDocuments({ createdAt: { $gte: startOfToday } }),
    Order.aggregate([
      { $match: { createdAt: { $gte: startOfMonth }, status: { $ne: "cancelled" } } },
      { $group: { _id: null, total: { $sum: "$grandTotal" } } },
    ]),
    Order.countDocuments({ status: { $in: ["pending", "confirmed", "packed", "dispatched"] } }),
    Product.countDocuments({ $expr: { $lte: ["$stock", "$lowStockThreshold"] } }),
  ]);

  res.json({
    success: true,
    data: {
      todayOrders,
      monthlyRevenue: monthlyRevenue[0]?.total || 0,
      pendingOrders,
      lowStockAlerts,
    },
  });
});

export const getWeeklyOrders = asyncHandler(async (req, res) => {
  const start = new Date();
  start.setDate(start.getDate() - 6);
  start.setHours(0, 0, 0, 0);

  const results = await Order.aggregate([
    { $match: { createdAt: { $gte: start } } },
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
          day: { $dayOfMonth: "$createdAt" },
        },
        orders: { $sum: 1 },
        revenue: { $sum: "$grandTotal" },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
  ]);

  res.json({
    success: true,
    data: results.map((item) => ({
      date: `${item._id.year}-${String(item._id.month).padStart(2, "0")}-${String(item._id.day).padStart(2, "0")}`,
      orders: item.orders,
      revenue: item.revenue,
    })),
  });
});
