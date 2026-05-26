import { Router } from "express";
import {
  createCustomer,
  getCustomer,
  getCustomerOrders,
  getCustomers,
  updateCustomer,
} from "../controllers/customer.controller.js";
import { adminOnly, protect } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", protect, getCustomers);
router.get("/:id", protect, getCustomer);
router.get("/:id/orders", protect, getCustomerOrders);
router.post("/", protect, adminOnly, createCustomer);
router.put("/:id", protect, adminOnly, updateCustomer);
router.patch("/:id", protect, adminOnly, updateCustomer);

export default router;
