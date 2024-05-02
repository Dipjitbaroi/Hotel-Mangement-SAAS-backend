import { Router } from "express";
import {
  addRoom,
  getRoomById,
  updateRoom,
  deleteRoom,
  getRoomsByHotelId,
  getRoomPostedBills,
  getAvailableRoomsByDate,
} from "../../controllers/Manager/room.controller.js";
import { checkToken } from "../../middlewares/checkToken.js";

const router = Router();

// add room
router.post("/add-room", checkToken, addRoom);
router.get("/get-room-by-id/:room_id", checkToken, getRoomById);
router.get("/get-rooms-by-hotel", checkToken, getRoomsByHotelId);
router.get("/get-available-rooms-by-date/:hotel_id", checkToken, getAvailableRoomsByDate);
router.get("/get-room-posted-bills/:room_id", checkToken, getRoomPostedBills);
router.patch("/update-room/:room_id", checkToken, updateRoom);
router.delete("/delete-room/:room_id", checkToken, deleteRoom);

export default router;
