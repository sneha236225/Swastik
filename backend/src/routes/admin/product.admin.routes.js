import express from "express";
import upload from "../../middleware/uploadMiddleware.js";
import {
  addProduct,
  updateProduct,
  updateProductStock
} from "../../controllers/admin/product.admin.controller.js";
import { authMiddleware } from "../../middleware/authMiddleware.js";
import { isAdmin } from "../../middleware/adminMiddleware.js";

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  isAdmin,
  upload.fields([
    { name: "images", maxCount: 5 },
    { name: "videos", maxCount: 3 },
  ]),
  addProduct
);

router.put(
  "/:id",
  authMiddleware,
  isAdmin,
  upload.fields([
    { name: "images", maxCount: 5 },
    { name: "videos", maxCount: 3 },
  ]),
  updateProduct
);

router.put(
  "/:id/stock",
  authMiddleware,
  isAdmin,
  updateProductStock
);

export default router;
