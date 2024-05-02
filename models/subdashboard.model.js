import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const monthlySchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    user_role: {
      type: String,
      required: true,
      enum: ["owner", "manager"],
    },
    month_name: {
      type: String,
      required: false,
    },
    year: {
      type: String,
      required: false,
    },
    total_hotel_expenses: {
      type: Number,
      required: false,
      default: 0,
    },
    total_hotel_income: {
      type: Number,
      required: false,
      default: 0,
    },
    total_hotel_profit: {
      type: Number,
      required: false,
      default: 0,
    },
    total_restaurant_expenses: {
      type: Number,
      required: false,
      default: 0,
    },
    total_restaurant_income: {
      type: Number,
      required: false,
      default: 0,
    },
    total_restaurant_profit: {
      type: Number,
      required: false,
      default: 0,
    },
  },
  { timestamps: true }
);

const dailySchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  user_role: {
    type: String,
    required: true,
    enum: ["owner", "manager"],
  },
  date: {
    type: Date,
    required: false,
  },
  today_hotel_expenses: {
    type: Number,
    required: false,
    default: 0,
  },
  today_hotel_income: {
    type: Number,
    required: false,
    default: 0,
  },
  today_hotel_profit: {
    type: Number,
    required: false,
    default: 0,
  },
  today_restaurant_expenses: {
    type: Number,
    required: false,
    default: 0,
  },
  today_restaurant_income: {
    type: Number,
    required: false,
    default: 0,
  },
  today_restaurant_profit: {
    type: Number,
    required: false,
    default: 0,
  },
});

const staticSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    user_role: {
      type: String,
      required: true,
      enum: ["owner", "manager"],
    },
    total_restaurant_expenses: {
      type: Number,
      required: false,
      default: 0,
    },
    total_restaurant_income: {
      type: Number,
      required: false,
      default: 0,
    },
    total_restaurant_profit: {
      type: Number,
      required: false,
      default: 0,
    },
    total_hotel_expenses: {
      type: Number,
      required: false,
      default: 0,
    },
    total_hotel_income: {
      type: Number,
      required: false,
      default: 0,
    },
    total_hotel_profit: {
      type: Number,
      required: false,
      default: 0,
    },
  },
  { timestamps: true }
);

dailySchema.plugin(mongoosePaginate);
staticSchema.plugin(mongoosePaginate);
monthlySchema.plugin(mongoosePaginate);

const StaticSubDashData = mongoose.model("StaticSubDashData", staticSchema);
const MonthlySubDashData = mongoose.model("MonthlySubDashData", monthlySchema);
const DailySubDashData = mongoose.model("DailySubDashData", dailySchema);

export { StaticSubDashData, MonthlySubDashData, DailySubDashData };
