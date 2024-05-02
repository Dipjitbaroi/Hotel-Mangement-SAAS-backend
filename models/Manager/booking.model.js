import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
import Room from "./room.model.js";
import { FoodOrder } from "./food.model.js";
const ImageSchema = new mongoose.Schema({
  driving_lic_img: { type: Array, required: false, default: "" },
  passport: { type: Array, required: false, default: "" },
  nid: { type: Array, required: false, default: "" },
});
const bookingInfoSchema = new mongoose.Schema(
  {
    room_ids: [
      {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Room",
      },
    ],
    hotel_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    booking_ids: [
      {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Booking",
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
    room_discount_amt: {
      type: Number,
      required: false,
      default: 0,
    },
    total_rent_after_dis: {
      type: Number,
      required: true,
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
  },
  { timestamps: true }
);
const bookingSchema = new mongoose.Schema(
  {
    room_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Room",
    },
    hotel_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    booking_info_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
      ref: "BookingInfo",
    },
    food_order_ids: [
      {
        type: mongoose.Schema.Types.ObjectId,
        required: false,
        ref: "FoodOrder",
      },
    ],
    guestName: {
      type: String,
      required: true,
    },
    mobileNumber: {
      type: String,
      required: false,
      default: "",
    },
    bookingMethod: {
      type: String,
      enum: ["Online", "Offline"],
      required: false,
    },
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
    status: {
      type: String,
      enum: ["Active", "CheckedIn", "CheckedOut", "Canceled"],
      required: true,
    },
  },
  { timestamps: true }
);
// Apply the mongoose-paginate-v2 plugin to your schema
bookingSchema.plugin(mongoosePaginate);
const Booking = mongoose.model("Booking", bookingSchema);
const BookingInfo = mongoose.model("BookingInfo", bookingInfoSchema);

export { Booking, BookingInfo };
