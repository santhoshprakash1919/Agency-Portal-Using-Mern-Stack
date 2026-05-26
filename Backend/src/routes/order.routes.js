import { Router } from "express";
import {
  createOrder,
  deleteOrder,
  getOrder,
  getOrders,
  getPublicOrderInvoice,
  updateOrder,
  updateOrderStatus,
} from "../controllers/order.controller.js";
import { adminOnly, protect } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", protect, getOrders);
router.get("/public/:orderNumber", getPublicOrderInvoice);
router.get("/:id", protect, getOrder);
router.post("/", createOrder);
router.put("/:id", protect, updateOrder);
router.patch("/:id", protect, updateOrder);
router.patch("/:id/status", protect, updateOrderStatus);
router.delete("/:id", protect, adminOnly, deleteOrder);

export default router;
