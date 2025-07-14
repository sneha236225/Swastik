import express from "express";
import { authMiddleware } from "../../middleware/authMiddleware.js";
import { isAdmin } from "../../middleware/adminMiddleware.js";
import {
  checkCashbackEligibility,
  releaseCashback,
} from "../../controllers/admin/cashback.admin.controller.js";

const router = express.Router();

router.get("/check/:id", authMiddleware, isAdmin, checkCashbackEligibility);
router.post("/release/:id", authMiddleware, isAdmin, releaseCashback);

export default router;
