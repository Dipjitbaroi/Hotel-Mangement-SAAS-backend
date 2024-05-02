import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
import Room from "./room.model.js";
import { FoodOrder } from "./food.model.js";
import Hotel from "../hotel.model.js";
import PoolBills from "../Manager/pool.model.js";
import GymBills from "../Manager/gym.model.js";
import { BookingInfo, Booking } from "./booking.model.js";
const ImageSchema = new mongoose.Schema({
  driving_lic_img: { type: Array, required: false, default: "" },
  passport: { type: Array, required: false, default: "" },
  nid: { type: Array, required: false, default: "" },
});

const checkoutSchema = new mongoose.Schema(
  {
    room_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Room",
    },
    hotel_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Hotel",
    },
    booking_info_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "BookingInfo",
    },
    booking_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Booking",
    },
    food_order_ids: [
      {
        type: mongoose.Schema.Types.ObjectId,
        required: false,
        ref: "FoodOrder",
      },
    ],
    pool_bill_ids: [
      {
        type: mongoose.Schema.Types.ObjectId,
        required: false,
        ref: "PoolBills",
      },
    ],
    gym_bill_ids: [
      {
        type: mongoose.Schema.Types.ObjectId,
        required: false,
        ref: "GymBills",
      },
    ],
    guestName: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: false,
    },
    mobileNumber: {
      type: String,
      required: false,
      default: "",
    },
    emergency_contact: {
      type: String,
      required: false,
      default: "",
    },
    invoice_no: {
      type: String,
      required: false,
    },
    adult: {
      type: Number,
      required: false,
      default: 0,
    },
    children: {
      type: Number,
      required: false,
      default: 0,
    },
    bookingMethod: {
      type: String,
      enum: ["Online", "Offline"],
      required: false,
    },
    total_rent: {
      type: Number,
      required: true,
    },
    room_discount: {
      type: Number,
      required: false,
      default: 0,
    },
    total_rent_after_dis: {
      type: Number,
      required: true,
    },
    room_posted_bills: {
      type: Number,
      required: false,
      default: 0,
    },
    total_posted_bills: {
      type: Number,
      required: false,
      default: 0,
    },
    total_tax: {
      type: Number,
      required: false,
      default: 0,
    },
    total_additional_charges: {
      type: Number,
      required: false,
      default: 0,
    },
    total_additional_charge_comment: {
      type: String,
      required: false,
    },
    total_service_charges: {
      type: Number,
      required: false,
      default: 0,
    },
    total_payable_amount: {
      type: Number,
      required: false,
      default: 0,
    },
    paid_amount: {
      type: Number,
      required: false,
      default: 0,
    },
    total_unpaid_amount: {
      type: Number,
      required: false,
      default: 0,
    },
    total_balance: {
      type: Number,
      required: false,
      default: 0,
    },
    refunded_amount: {
      type: Number,
      required: false,
      default: 0,
    },
    deleted: {
      type: Boolean,
      required: false,
      default: false,
    },
    nationality: {
      type: String,
      required: false,
      default: "",
    },
    doc_number: {
      type: String,
      required: false,
      default: "",
    },
    doc_images: ImageSchema,
    from: { type: Date, required: true },
    checkin_date: { type: Date, required: false },
    to: { type: Date, required: true },
    no_of_days: {
      type: Number,
      required: true,
    },
    rent_per_day: {
      type: Number,
      required: true,
    },
    total_room_rent: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);
// Apply the mongoose-paginate-v2 plugin to your schema
checkoutSchema.plugin(mongoosePaginate);
const CheckOutData = mongoose.model("CheckOutData", checkoutSchema);

export default CheckOutData;
