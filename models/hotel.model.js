import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
import User from "./user.model.js";

const ImageSchema = new mongoose.Schema({
  driving_lic_img: { type: Array, required: false, default: "" },
  trade_lic_img: { type: Array, required: false, default: "" },
  profile_img: { type: String, required: false, default: "" },
  utilities: { type: Array, required: false, default: "" },
  passport: { type: Array, required: false, default: "" },
  pancard: { type: Array, required: false, default: "" },
  nid: { type: Array, required: false, default: "" },
});

const hotelSchema = new mongoose.Schema(
  {
    owner_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    branch_name: {
      type: String,
      required: false,
      default: "",
    },
    status: {
      type: String,
      required: false,
      enum: ["Active", "Deleted"],
      default: "Active",
    },
    address: {
      type: String,
      required: false,
    },
    email: {
      type: String,
      required: false,
    },
    phone_no: {
      type: String,
      required: false,
      default: "",
    },
    manager_acc: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
      ref: "User",
    },
  },
  { timestamps: true }
);

hotelSchema.plugin(mongoosePaginate);

const Hotel = mongoose.model("Hotel", hotelSchema);

export default Hotel;
