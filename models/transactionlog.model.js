import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
const transactionlogSchema = new mongoose.Schema(
  {
    manager_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
    },
    booking_info_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
    },
    dedicated_to: {
      type: String,
      required: true,
      enum: ["license", "hotel"],
    },
    tran_id: {
      type: String,
      required: false,
    },
    payment_method: {
      type: String,
      required: true,
      enum: ["Cash", "Card", "Mobile_Banking", "Oyo", "Fab"],
    },
    bill_from: {
      type: Date,
      required: false,
    },
    bill_to: {
      type: Date,
      required: false,
    },
    from: {
      type: String,
      required: true,
    },
    to: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      default: 0,
    },
    payment_for: {
      type: String,
      required: false,
      enum: [
        "Renew",
        "Purchase",
        "Booking",
        "BookingCanceled",
        "CheckIn",
        "CheckOut",
        "FoodPay",
        "Deposit",
        "CashBack",
      ],
    },
    remark: {
      type: String,
      required: false,
    },
  },
  { timestamps: true }
);

transactionlogSchema.plugin(mongoosePaginate);

const TransactionLog = mongoose.model("TransactionLog", transactionlogSchema);

export default TransactionLog;
