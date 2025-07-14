import express from "express";
import { paymentSuccess } from "../controllers/payment.controller.js";

const router = express.Router();

router.post("/payment-success", paymentSuccess);

export default router;
