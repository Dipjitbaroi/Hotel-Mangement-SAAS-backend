import { Router } from "express";
import { checkToken } from "../../middlewares/checkToken.js";
import {
  addItem,
  assignItemsToRoom,
  deleteItem,
  getItemById,
  getItemsByHotelId,
  updateItem,
} from "../../controllers/Manager/item.controller.js";

const router = Router();

router.post("/add-item", checkToken, addItem);
router.post("/assign-items-to-room", checkToken, assignItemsToRoom);
router.get("/get-item-by-id/:item_id", checkToken, getItemById);
router.get("/get-items-by-hotel", checkToken, getItemsByHotelId);
router.patch("/update-item/:item_id", checkToken, updateItem);
router.delete("/delete-item/:item_id", checkToken, deleteItem);
export default router;
