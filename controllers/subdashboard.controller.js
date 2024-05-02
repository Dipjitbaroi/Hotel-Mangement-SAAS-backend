import {
  DailySubDashData,
  MonthlySubDashData,
  StaticSubDashData,
} from "../models/subdashboard.model.js";

export const addStaticSubDashData = async (req, res) => {
  try {
    // Extract data from the request body
    const { user_id, user_role } = req.body;

    // Create a new instance of StaticSubDashData
    const newStaticSubDashData = new StaticSubDashData({
      user_id,
      user_role,
    });

    // Save the new instance to the database
    await newStaticSubDashData.save();

    // Respond with a success message
    return res
      .status(201)
      .json({ message: "Successfully added static sub-dashboard data" });
  } catch (error) {
    console.error("Error adding static sub-dashboard data:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getSubDashboardInfo = async (req, res) => {
  try {
    const userId = req.params.user_id;
    const currentDate = new Date();

    const convertedDate = new Date(currentDate.toLocaleDateString());
    // Adjust for the local time zone
    const offset = convertedDate.getTimezoneOffset();
    convertedDate.setMinutes(convertedDate.getMinutes() - offset);
    // Set time to midnight
    convertedDate.setHours(0, 0, 0, 0);
    // Convert to ISO string
    const date = convertedDate.toISOString();

    const permanent_datas = await StaticSubDashData.findOne({
      user_id: userId,
    });

    if (!permanent_datas) {
      return res.status(404).json({ message: "permanent_datas not found" });
    }
    // Calculate the start date for fetching the last 12 months
    const startDate = new Date(currentDate); // Create a new date object based on currentDate
    startDate.setMonth(currentDate.getMonth() - 11);

    const monthly_datas = await MonthlySubDashData.find({
      user_id: userId,
      createdAt: { $gte: startDate, $lte: currentDate },
    });
    const daily_datas = await DailySubDashData.find({
      user_id: userId,
      date,
    });
    // Fetch daily datas for the last 7 days
    const lastWeekStartDate = new Date(date);
    lastWeekStartDate.setDate(currentDate.getDate() - 6);

    const lastWeekStartDateIso = lastWeekStartDate.toISOString();
    const one_day_datas = await DailySubDashData.find({
      user_id: userId,
      date: { $gte: lastWeekStartDateIso, $lte: date },
    });

    // Calculate last_week_expenses as the sum of today_expenses for the last 7 days
    const last_week_hotel_expenses = one_day_datas.reduce(
      (sum, dailyData) => sum + dailyData.today_hotel_expenses,
      0
    );
    const last_week_hotel_income = one_day_datas.reduce(
      (sum, dailyData) => sum + dailyData.today_hotel_income,
      0
    );
    const last_week_hotel_profit = one_day_datas.reduce(
      (sum, dailyData) => sum + dailyData.today_hotel_profit,
      0
    );
    const last_week_restaurant_expenses = one_day_datas.reduce(
      (sum, dailyData) => sum + dailyData.today_restaurant_expenses,
      0
    );
    const last_week_restaurant_income = one_day_datas.reduce(
      (sum, dailyData) => sum + dailyData.today_restaurant_income,
      0
    );
    const last_week_restaurant_profit = one_day_datas.reduce(
      (sum, dailyData) => sum + dailyData.today_restaurant_profit,
      0
    );

    res.status(200).json({
      success: true,
      message: "Succesfully fetched subdashboard informations",
      daily_datas: daily_datas,
      permanent_datas: permanent_datas,
      monthly_datas: monthly_datas,
      last_week_data: {
        last_week_hotel_expenses: last_week_hotel_expenses,
        last_week_hotel_income: last_week_hotel_income,
        last_week_hotel_profit: last_week_hotel_profit,
        last_week_restaurant_expenses: last_week_restaurant_expenses,
        last_week_restaurant_income: last_week_restaurant_income,
        last_week_restaurant_profit: last_week_restaurant_profit,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to get dashboard" });
  }
};
