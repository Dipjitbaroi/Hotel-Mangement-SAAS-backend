import express from "express";
import {
  addBarOrder,
  deleteBarOrder,
  getBarOrderById,
  getBarOrdersByHotelId,
  updateBarOrder,
} from "../../controllers/Manager/bar.controller.js";
import { checkToken } from "../../middlewares/checkToken.js";

const router = express.Router();

// Add Bar Order
router.post("/add-bar-order", checkToken, addBarOrder);

// Get Bar Orders by Hotel ID
router.get(
  "/get-bar-orders-by-hotel",
  checkToken,
  getBarOrdersByHotelId
);

// Get Bar Order by ID
router.get("/get-bar-order/:order_id", checkToken, getBarOrderById);

// Update Bar Order by ID
router.patch("/update-bar-order/:order_id", checkToken, updateBarOrder);

router.delete("/delete-bar-order/:order_id", checkToken, deleteBarOrder);

export default router;
