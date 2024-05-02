import { Router } from "express";
import {
  addBooking,
  getBookingsByHotel,
  getBookingById,
  updateBooking,
  deleteBooking,
  getActiveBookingByRoomId,
  cancelBooking,
  getBookingDetailsById,
  updateBookingInfo,
  addToCheckin,
  lastActiveBookingValidator,
  getPerDayTotalBookingList,
  getPerDayTotalCheckedInList,
  getPerDayTotalCheckedOutList,
  getPerDayTotalCanceledBookingList,
  getBookingsByRoom,
} from "../../controllers/Manager/booking.controller.js";
import { checkToken } from "../../middlewares/checkToken.js";
import {
  checkedOut,
  getCheckoutInfoByRoom,
} from "../../controllers/Manager/checkout.controller.js";

const router = Router();

// add room
router.post("/add-booking", checkToken, addBooking);
router.get("/get-bookings-by-hotel", checkToken, getBookingsByHotel);
router.get("/get-bookings-by-room", checkToken, getBookingsByRoom);
router.get("/get-booking-by-id/:booking_id", checkToken, getBookingById);
router.get("/get-active-booking-by-room/:room_id", checkToken, getActiveBookingByRoomId);
router.get("/last-active-booking-validator/:booking_id", checkToken, lastActiveBookingValidator);
router.get(
  "/get-booking-details/:booking_id",
  checkToken,
  getBookingDetailsById
);
router.get("/get-perday-total-booking-list", checkToken, getPerDayTotalBookingList);
router.get("/get-perday-total-checkedin-list", checkToken, getPerDayTotalCheckedInList);
router.get("/get-perday-total-checkedout-list", checkToken, getPerDayTotalCheckedOutList);
router.get("/get-perday-total-canceled-booking-list", checkToken, getPerDayTotalCanceledBookingList);
router.patch("/update-booking/:booking_id", checkToken, updateBooking);
router.patch("/update-booking-info/:booking_id", checkToken, updateBookingInfo);
router.post("/get-checkoutinfo-by-rooms", checkToken, getCheckoutInfoByRoom);
router.post("/checkout", checkToken, checkedOut);
router.post("/add-to-checkin", checkToken, addToCheckin);

router.post("/cancel-booking/:booking_id", checkToken, cancelBooking);
// router.delete('/delete-booking/:booking_id', checkToken, deleteBooking);

export default router;
