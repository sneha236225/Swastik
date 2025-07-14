import express from "express";
import {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  markOrderAsReturned
} from "../../controllers/admin/order.admin.controller.js";

import { authMiddleware } from "../../middleware/authMiddleware.js";
import { isAdmin } from "../../middleware/adminMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, isAdmin, createOrder);
router.get("/", authMiddleware, isAdmin, getAllOrders);
router.get("/:id", authMiddleware, isAdmin, getOrderById);
router.put("/:id/status", authMiddleware, isAdmin, updateOrderStatus);
router.put("/:id/return", authMiddleware, isAdmin, markOrderAsReturned);

export default router;
