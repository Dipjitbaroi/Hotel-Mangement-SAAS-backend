import express from "express";
import {
  addPoolBill,
  getPoolBillsByHotelId,
  getPoolBillById,
  updatePoolBill,
} from "../../controllers/Manager/pool.controller.js";
import { checkToken } from "../../middlewares/checkToken.js";

const router = express.Router();

// Add Pool Bill
router.post("/add-pool-bill", checkToken, addPoolBill);

// Get Pool Bills by Hotel ID
router.get("/get-pool-bills-by-hotel", checkToken, getPoolBillsByHotelId);

// Get Pool Bill by ID
router.get("/get-pool-bill/:bill_id", checkToken, getPoolBillById);

// Update Pool Bill by ID
router.patch("/update-pool-bill/:bill_id", checkToken, updatePoolBill);

export default router;
