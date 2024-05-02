import { Router } from "express";
import {
  addFood,
  getfoodById,
  addOrder,
  getFoodByHotelId,
  deleteFood,
  deleteOrder,
  getOrdersByHotelId,
  updateFood,
  getFoodCategoriesByHotelId,
  addFoodCategory,
  updateFoodCategory,
  deleteFoodCategory,
  getFoodCategoryById,
  updateOrder,
  getOrderById,
  getOrdersByDate,
} from "../../controllers/Manager/food.controller.js";
import { checkToken } from "../../middlewares/checkToken.js";

const router = Router();

// Food routes
router.post("/add-food", checkToken, addFood);
router.get("/get-foods-by-hotel", checkToken, getFoodByHotelId);
router.get("/get-orders-by-hotel", checkToken, getOrdersByHotelId);
router.get("/get-orders-by-date", checkToken, getOrdersByDate);
// router.get("/get--orders", getSoldOrdersByDates);
router.get("/get-food-by-id/:foodId", checkToken, getfoodById);
router.patch("/update-food/:food_id", checkToken, updateFood);
router.delete("/delete-food/:food_id", checkToken, deleteFood);
router.delete("/delete-order/:order_id", checkToken, deleteOrder);
router.post("/add-order", checkToken, addOrder);
router.get("/get-order-by-id/:order_id", checkToken, getOrderById);
router.patch("/update-order/:order_id", checkToken, updateOrder);

// Food category routes
router.get("/get-food-categories-by-hotel", checkToken, getFoodCategoriesByHotelId);
router.get("/get-food-category-by-id/:category_id", checkToken, getFoodCategoryById);
router.post("/add-food-category", checkToken, addFoodCategory);
router.patch("/update-food-category/:category_id", checkToken, updateFoodCategory);
router.delete("/delete-food-category/:category_id", checkToken, deleteFoodCategory);

export default router;
