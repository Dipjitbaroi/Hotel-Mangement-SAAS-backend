import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
const reportSchema = new mongoose.Schema(
  {
    hotel_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    booking_ids: [
      {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
      },
    ],
    guestName: {
      type: String,
      required: true,
    },
    room_numbers: {
      type: Array,
      required: true,
    },
    payment_method: {
      type: String,
      required: true,
      enum: ["Cash", "Card", "Mobile_Banking"],
    },
    checked_in: {
      type: Date,
      required: true,
    },
    checked_out: {
      type: Date,
      required: true,
    },
    payable_amount: {
      type: Number,
      required: true,
    },
    paid_amount: {
      type: Number,
      required: true,
      default: 0,
    },
    balance_deducted: {
      type: Number,
      required: true,
      default: 0,
    },
    balance_refunded: {
      type: Number,
      required: true,
      default: 0,
    },
    unpaid_amount: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  { timestamps: true }
);

// Apply the mongoose-paginate-v2 plugin to your schema
reportSchema.plugin(mongoosePaginate);

const ManagerReport = mongoose.model("ManagerReport", reportSchema);

export default ManagerReport;
