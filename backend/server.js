import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./src/config/db.js";
import authRoutes from "./src/routes/auth.routes.js";
import paymentRoutes from "./src/routes/payment.routes.js";
import userAdminRoutes from "./src/routes/admin/user.admin.routes.js";
import productAdminRoutes from "./src/routes/admin/product.admin.routes.js";
import orderAdminRoutes from "./src/routes/admin/order.admin.routes.js";
import settingAdminRoutes from "./src/routes/admin/settings.admin.routes.js";
import bonusAdminRoutes from "./src/routes/admin/bonus.admin.routes.js";
import path from "path";
import errorMiddleware from "./src/middleware/errorMiddleware.js";
import cashbackAdminRoutes from "./src/routes/admin/cashback.admin.routes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

connectDB();

app.get("/", (req, res) => {
  res.send("API is running...");
});

const __dirname = path.resolve();
app.use("/uploads", express.static(path.join(__dirname, "/uploads")));

// Auth routes
app.use("/api/auth", authRoutes);

// Payment routes
app.use("/api/payment", paymentRoutes);

// Admin routes
app.use("/api/admin/users", userAdminRoutes);
app.use("/api/admin/products", productAdminRoutes);
app.use("/api/admin/orders", orderAdminRoutes);
app.use("/api/admin/settings", settingAdminRoutes);
app.use("/api/admin/cashback", cashbackAdminRoutes);
app.use("/api/admin/bonus", bonusAdminRoutes);

app.use(errorMiddleware);
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);

