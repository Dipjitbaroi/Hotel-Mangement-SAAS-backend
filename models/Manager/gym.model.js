import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
const gymBillSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    hotel_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
    },
    room_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
    },
    members: {
      type: String,
      required: false,
    },
    price: {
      type: Number,
      required: true,
    },
    paid_amount: {
      type: Number,
      required: false,
      default: 0,
    },
    unpaid_amount: {
      type: Number,
      required: false,
      default: 0,
    },
    status: {
      type: String,
      required: true,
      enum: ["Pending", "Paid", "Partial"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

// Apply the mongoose-paginate-v2 plugin to your schema
gymBillSchema.plugin(mongoosePaginate);

const GymBills = mongoose.model("GymBills", gymBillSchema);

export default GymBills;
