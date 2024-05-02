import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
import Room from "./room.model.js";
import Table from "./table.model.js";
const foodSchema = new mongoose.Schema(
  {
    hotel_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    food_name: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: false,
      enum: ["Available", "Unavailable"],
      default: "Available",
    },
    category: {
      type: String,
      required: true,
    },
    serveyor_quantity: {
      type: String,
      required: false,
    },
    type_of_alcohol: {
      type: String,
      required: false,
    },
    price: {
      type: Number,
      required: true,
    },
    images: {
      type: Array,
      required: false,
    },
    description: {
      type: String,
      required: false,
    },
  },
  { timestamps: true }
);
const itemsSchema = new mongoose.Schema({
  item: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  serveyor_quantity: {
    type: String,
    required: false,
    default: "1",
  },
  quantity: {
    type: Number,
    required: true,
  },
  total: {
    type: Number,
    required: true,
  },
});
const foodCategorySchema = new mongoose.Schema({
  hotel_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  category_name: {
    type: String,
    required: true,
  },
});
// Food Order List
const foodOrderSchema = new mongoose.Schema(
  {
    room_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
      ref: "Room",
    },
    booking_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
    },
    table_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
      ref: "Table",
    },
    hotel_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    dedicated_to: {
      type: String,
      required: true,
      enum: ["room", "table"],
    },
    unique_id: {
      type: String,
      required: false,
    },
    current_order: {
      type: Boolean,
      required: false,
    },
    order_status: {
      type: String,
      required: false,
      enum: ["Current", "CheckedOut"],
      default: "Current",
    },
    items: [itemsSchema],
    total_price: {
      type: Number,
      required: true,
    },
    discount: {
      type: Number,
      required: false,
      default: 0,
    },
    service_charge: {
      type: Number,
      required: false,
      default: 0,
    },
    tax: {
      type: Number,
      required: false,
      default: 0,
    },
    grand_total: {
      type: Number,
      required: false,
      default: 0,
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
    payment_status: {
      type: String,
      required: true,
      enum: ["Pending", "Paid", "Partial"],
      default: "Pending",
    },
  },
  { timestamps: true }
);
// Apply the mongoose-paginate-v2 plugin to your schema
foodSchema.plugin(mongoosePaginate);
foodOrderSchema.plugin(mongoosePaginate);
const Food = mongoose.model("Food", foodSchema);
const FoodCategory = mongoose.model("FoodCategory", foodCategorySchema);
const FoodOrder = mongoose.model("FoodOrder", foodOrderSchema);

export { Food, FoodOrder, FoodCategory };
