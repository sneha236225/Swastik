import express from "express";
import { authMiddleware } from "../../middleware/authMiddleware.js";
import { isAdmin } from "../../middleware/adminMiddleware.js";
import {
  getSettings,
  updateSettings,
} from "../../controllers/admin/settings.admin.controller.js";
const router = express.Router();

router.get("/", authMiddleware, isAdmin, getSettings);
router.put("/update", authMiddleware, isAdmin, updateSettings);
export default router;
