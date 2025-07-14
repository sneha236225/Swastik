import express from "express";
import {
  getAllUsers,
  getUserById,
  updateUserStatus,
  updateKycStatus,
  trackUserReferrals,
  getUserPurchases
} from "../../controllers/admin/user.admin.controller.js";
import { authMiddleware } from "../../middleware/authMiddleware.js";
import { isAdmin } from "../../middleware/adminMiddleware.js";

const router = express.Router();

router.get("/", authMiddleware, isAdmin, getAllUsers);
router.get("/:id", authMiddleware, isAdmin, getUserById);
router.put("/:id/status", authMiddleware, isAdmin, updateUserStatus);
router.put("/:id/kyc", authMiddleware, isAdmin, updateKycStatus);
router.get("/:id/referrals", authMiddleware, isAdmin, trackUserReferrals);
router.get("/:id/purchases",authMiddleware,isAdmin,getUserPurchases);


export default router;
