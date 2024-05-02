import express from "express";
import {
  addGymBill,
  getGymBillsByHotelId,
  getGymBillById,
  updateGymBill,
} from "../../controllers/Manager/gym.controller.js";
import { checkToken } from "../../middlewares/checkToken.js";

const router = express.Router();

// Add Gym Bill
router.post("/add-gym-bill", checkToken, addGymBill);

// Get Gym Bills by Hotel ID
router.get("/get-gym-bills-by-hotel", checkToken, getGymBillsByHotelId);

// Get Gym Bill by ID
router.get("/get-gym-bill/:bill_id", checkToken, getGymBillById);

// Update Gym Bill by ID
router.patch("/update-gym-bill/:bill_id", checkToken, updateGymBill);

export default router;
