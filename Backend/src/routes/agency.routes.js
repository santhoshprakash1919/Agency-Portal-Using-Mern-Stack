import { Router } from "express";
import { createAgency, getAgencies, updateAgency } from "../controllers/agency.controller.js";
import { adminOnly, protect } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", protect, getAgencies);
router.post("/", protect, adminOnly, createAgency);
router.put("/:id", protect, adminOnly, updateAgency);
router.patch("/:id", protect, adminOnly, updateAgency);

export default router;
