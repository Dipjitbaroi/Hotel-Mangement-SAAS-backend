import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const dashboardTableSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    user_role: {
      type: String,
      required: true,
      enum: ["owner", "manager", "admin", "subadmin"],
    },
    month_name: {
      type: String,
      required: false,
    },
    year: {
      type: String,
      required: false,
    },
    total_expired: {
      type: Number,
      required: false,
      default: 0,
    },
    total_renew: {
      type: Number,
      required: false,
      default: 0,
    },
    total_sale: {
      type: Number,
      required: false,
      default: 0,
    },
    total_checkin: {
      type: Number,
      required: false,
      default: 0,
    },
    total_checkout: {
      type: Number,
      required: false,
      default: 0,
    },
    total_booking: {
      type: Number,
      required: false,
      default: 0,
    },
    total_expense: {
      type: Number,
      required: false,
      default: 0,
    },
    total_income: {
      type: Number,
      required: false,
      default: 0,
    },
    total_profit: {
      type: Number,
      required: false,
      default: 0,
    },
  },
  { timestamps: true }
);

const checkinfoSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  user_role: {
    type: String,
    required: true,
    enum: ["owner", "manager", "admin", "subadmin"],
  },
  date: {
    type: Date,
    required: false,
  },
  today_checkin: {
    type: Number,
    required: false,
    default: 0,
  },
  today_checkout: {
    type: Number,
    required: false,
    default: 0,
  },
  today_booking: {
    type: Number,
    required: false,
    default: 0,
  },
  today_canceled_bookings: {
    type: Number,
    required: false,
    default: 0,
  },
  today_remaining_checkin: {
    type: Number,
    required: false,
    default: 0,
  },
  today_remaining_booking: {
    type: Number,
    required: false,
    default: 0,
  },
});

const dashboardSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    user_role: {
      type: String,
      required: true,
      enum: ["owner", "manager", "admin", "subadmin"],
    },
    total_sell_lic: {
      type: Number,
      required: false,
      default: 0,
    },
    total_renew_lic: {
      type: Number,
      required: false,
      default: 0,
    },
    total_active_lic: {
      type: Number,
      required: false,
      default: 0,
    },
    total_expired_lic: {
      type: Number,
      required: false,
      default: 0,
    },
    total_suspended_lic: {
      type: Number,
      required: false,
      default: 0,
    },
    total_amount: {
      type: Number,
      required: false,
      default: 0,
    },
    total_customer: {
      type: Number,
      required: false,
      default: 0,
    },
    total_checkin: {
      type: Number,
      required: false,
      default: 0,
    },
    total_checkout: {
      type: Number,
      required: false,
      default: 0,
    },
    total_booking: {
      type: Number,
      required: false,
      default: 0,
    },
    total_canceled: {
      type: Number,
      required: false,
      default: 0,
    },
    total_active_booking: {
      type: Number,
      required: false,
      default: 0,
    },
    total_active_checkin: {
      type: Number,
      required: false,
      default: 0,
    },
    total_expense: {
      type: Number,
      required: false,
      default: 0,
    },
    total_revenue: {
      type: Number,
      required: false,
      default: 0,
    },
    net_profit: {
      type: Number,
      required: false,
      default: 0,
    },
  },
  { timestamps: true }
);

dashboardTableSchema.pre("save", function (next) {
  // Check if month_name and year are not provided
  if (!this.month_name || !this.year) {
    const currentDate = new Date();
    this.month_name =
      this.month_name || currentDate.toLocaleString("en-US", { month: "long" }); // Full month name
    this.year = this.year || currentDate.getFullYear().toString();
  }

  next();
});
checkinfoSchema.pre("save", function (next) {
  // Check if date is not provided
  if (!this.date) {
    const currentDate = new Date();
    const convertedDate = new Date(currentDate.toLocaleDateString());
    // Adjust for the local time zone
    const offset = convertedDate.getTimezoneOffset();
    convertedDate.setMinutes(convertedDate.getMinutes() - offset);
    // Set time to midnight
    convertedDate.setHours(0, 0, 0, 0);
    // Convert to ISO string
    const isoString = convertedDate.toISOString();
    // You can modify this part based on your specific requirements for formatting the date
    this.date = this.date || isoString;
  }

  next();
});

dashboardSchema.plugin(mongoosePaginate);
dashboardTableSchema.plugin(mongoosePaginate);
checkinfoSchema.plugin(mongoosePaginate);

const Dashboard = mongoose.model("Dashboard", dashboardSchema);
const DashboardTable = mongoose.model("DashboardTable", dashboardTableSchema);
const CheckInfo = mongoose.model("CheckInfo", checkinfoSchema);

export { Dashboard, DashboardTable, CheckInfo };
