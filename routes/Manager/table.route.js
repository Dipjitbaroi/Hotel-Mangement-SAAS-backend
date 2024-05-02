import { Router } from "express";

import { checkToken } from "../../middlewares/checkToken.js";
import {
  addTable,
  deleteTable,
  getTableById,
  getTablesByHotelId,
  updateTable,
} from "../../controllers/Manager/table.controllers.js";

const router = Router();

// Add Table
router.post("/add-table", checkToken, addTable);

// Get Tables By Hotel ID
router.get("/get-tables-by-hotel", checkToken, getTablesByHotelId);

// Get Table By ID
router.get("/get-table-by-id/:table_id", checkToken, getTableById);

// Update Table
router.patch("/update-table/:table_id", checkToken, updateTable);

// Delete Table
router.delete("/delete-table/:table_id", checkToken, deleteTable);

export default router;
