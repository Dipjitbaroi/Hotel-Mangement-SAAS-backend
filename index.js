import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import cron from "node-cron";
import path from "path";
import foodRoute from "./routes/Manager/food.route.js";
import hotelsRoute from "./routes/hotels.route.js";
import uploadRoute from "./routes/upload.js";
import userRoute from "./routes/users.route.js";
import transactionRoute from "./routes/transaction.route.js";
import statusRoute from "./routes/status.route.js";
import reportRoute from "./routes/report.route.js";
import itemRoute from "./routes/Manager/item.route.js";
import barRoute from "./routes/Manager/bar.route.js";
import gymRoute from "./routes/Manager/gym.route.js";
import poolRoute from "./routes/Manager/pool.route.js";
import dashboardRoute from "./routes/dashboard.route.js";
import subdashboardRoute from "./routes/subdashboard.route.js";
import hotelBalanceRoute from "./routes/hotel.balance.route.js";
import expenseRoute from "./routes/expense.route.js";
import { fileURLToPath } from "url";
import bookingRoute from "./routes/Manager/booking.route.js";
import checkoutRoute from "./routes/Manager/checkout.route.js";
import roomRoute from "./routes/Manager/room.route.js";
import tableRoute from "./routes/Manager/table.route.js";
import { checkLicenseRenewal } from "./utils.js";
import { EventEmitter } from 'events';
dotenv.config();
const app = express();
const port = process.env.PORT || 5001;
EventEmitter.defaultMaxListeners = 15; 
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use(express.json());
// Specify the allowed origins
const allowedOrigins = [
  "https://dakhotel.com",
  "https://www.dakhotel.com",
  "http://localhost:3000",
];

const corsOptions = {
  origin: allowedOrigins,
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};

app.use(cors(corsOptions));

mongoose.connect(process.env.DB_CONNECTION_STR, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", () => {
  console.log("Connected to the database");
  // Schedule the cron job
  cron.schedule("1 0 * * *", () => {
    console.log("Running license expired check at", new Date().toISOString());
    checkLicenseRenewal();
  });
});

// routes
app.use('/uploads', express.static('uploads'));
app.use("/users", userRoute);
app.use("/transactions", transactionRoute);
app.use("/status", statusRoute);
app.use("/reports", reportRoute);
app.use("/hotels", hotelsRoute);
app.use("/rooms", roomRoute);
app.use("/tables", tableRoute);
app.use("/foods", foodRoute);
app.use("/bookings", bookingRoute);
app.use("/items", itemRoute);
app.use("/bar", barRoute);
app.use("/gym", gymRoute);
app.use("/pool", poolRoute);
app.use("/dashboards", dashboardRoute);
app.use("/subdashboards", subdashboardRoute);
app.use("/balances", hotelBalanceRoute);
app.use("/expenses", expenseRoute);
app.use("/checkouts", checkoutRoute);

app.use("/", uploadRoute);

// Define your routes here

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
