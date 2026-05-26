import { Router } from "express";
import {
  createProduct,
  deleteProduct,
  getProduct,
  getProducts,
  updateProduct,
  updateStock,
} from "../controllers/product.controller.js";
import { adminOnly, protect } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", getProducts);
router.get("/:id", getProduct);
router.post("/", protect, adminOnly, createProduct);
router.put("/:id", protect, adminOnly, updateProduct);
router.patch("/:id", protect, adminOnly, updateProduct);
router.patch("/:id/stock", protect, adminOnly, updateStock);
router.delete("/:id", protect, adminOnly, deleteProduct);

export default router;
