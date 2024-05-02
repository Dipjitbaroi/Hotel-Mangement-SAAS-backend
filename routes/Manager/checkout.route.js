import { Router } from "express";

import { checkToken } from "../../middlewares/checkToken.js";
import { addCheckoutData, getCheckoutDataByBookingId } from "../../controllers/Manager/checkout.controller.js";

const router = Router();

router.post("/add-checkout-data", checkToken, addCheckoutData);
router.get("/get-checkout-data-by-booking-id/:booking_id", checkToken, getCheckoutDataByBookingId)

export default router;
