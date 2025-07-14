import express from "express";
import { authMiddleware } from "../../middleware/authMiddleware.js";
import { isAdmin } from "../../middleware/adminMiddleware.js";
import {
  checkBonusEligibility,
  releaseBonus,
} from "../../controllers/admin/bonus.admin.controller.js";

const router = express.Router();

router.get("/check/:id", authMiddleware, isAdmin, checkBonusEligibility);
router.post("/release/:id", authMiddleware, isAdmin, releaseBonus);

export default router;
    