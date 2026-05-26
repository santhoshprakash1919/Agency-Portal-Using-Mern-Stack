import { Router } from "express";
import { getStats, getWeeklyOrders } from "../controllers/dashboard.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/stats", protect, getStats);
router.get("/weekly-orders", protect, getWeeklyOrders);

export default router;
