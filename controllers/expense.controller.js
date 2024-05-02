import { DashboardTable } from "../models/dashboard.model.js";
import Expense from "../models/expense.model.js"; // Adjust the path based on your project structure
import {
  DailySubDashData,
  MonthlySubDashData,
  StaticSubDashData,
} from "../models/subdashboard.model.js";
import User from "../models/user.model.js";

export const addExpense = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { hotel_id, date, spendedfor, items, total_amount } = req.body;
    const profit_after_expense = 0 - total_amount;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const newDate = new Date(date);

    const month_name = newDate.toLocaleString("en-US", { month: "long" }); // Full month name
    const year = newDate.getFullYear().toString();

    const localDate = newDate.toISOString();

    const existingExpense = await Expense.findOne({
      date: localDate,
      hotel_id,
      spendedfor,
    });
    if (existingExpense) {
      existingExpense.items = [...existingExpense.items, ...items];
      existingExpense.total_amount += total_amount;
      await existingExpense.save();

      const existingStaticSubDashData = await StaticSubDashData.findOne({
        user_id: userId,
      });
      const existingDailySubDashData = await DailySubDashData.findOne({
        user_id: userId,
        date: localDate,
      });
      const existingMonthlySubDashData = await MonthlySubDashData.findOne({
        user_id: userId,
        month_name,
        year,
      });

      const managerDashboardTable = await DashboardTable.findOne({
        user_id: userId,
        month_name,
        year,
      });
      if (managerDashboardTable) {
        managerDashboardTable.total_expense += total_amount;
        managerDashboardTable.total_profit -= total_amount;
        await managerDashboardTable.save();
      }
      if (!managerDashboardTable) {
        // Create a new dashboard table entry
        const newDashboardTable = new DashboardTable({
          user_id: userId,
          user_role: user.role,
          month_name,
          year,
          total_expense: total_amount,
          total_profit: profit_after_expense,
        });
        // Save the new dashboard table to the database
        await newDashboardTable.save();
      }
      const ownerDashboardTable = await DashboardTable.findOne({
        user_id: user.parent_id,
        month_name,
        year,
      });
      if (ownerDashboardTable) {
        ownerDashboardTable.total_expense += total_amount;
        ownerDashboardTable.total_profit -= total_amount;
        await ownerDashboardTable.save();
      }
      if (!ownerDashboardTable) {
        const newDashboardTable = new DashboardTable({
          user_id: user.parent_id,
          user_role: "owner",
          month_name,
          year,
          total_expense: total_amount,
          total_profit: profit_after_expense,
        });
        // Save the new dashboard table to the database
        await newDashboardTable.save();
      }
      if (spendedfor === "hotel") {
        existingDailySubDashData.today_hotel_expenses += total_amount;
        existingDailySubDashData.today_hotel_profit -= total_amount;
        existingMonthlySubDashData.total_hotel_expenses += total_amount;
        existingMonthlySubDashData.total_hotel_profit -= total_amount;
        existingStaticSubDashData.total_hotel_expenses += total_amount;
        existingStaticSubDashData.total_hotel_profit -= total_amount;
      }
      if (spendedfor === "restaurant") {
        existingDailySubDashData.today_restaurant_expenses += total_amount;
        existingDailySubDashData.today_restaurant_profit -= total_amount;
        existingMonthlySubDashData.total_restaurant_expenses += total_amount;
        existingMonthlySubDashData.total_restaurant_profit -= total_amount;
        existingStaticSubDashData.total_restaurant_expenses += total_amount;
        existingStaticSubDashData.total_restaurant_profit -= total_amount;
      }

      await existingDailySubDashData.save();
      await existingMonthlySubDashData.save();
      await existingStaticSubDashData.save();
    }
    if (!existingExpense) {
      // Create a new expense instance
      const newExpense = new Expense({
        hotel_id,
        date: localDate,
        spendedfor,
        items,
        total_amount,
      });
      try {
        // Save the expense to the database
        await newExpense.save();
      } catch (saveError) {
        console.error("Error saving to database:", saveError);
        return res.status(500).json({ message: "Error saving to database" });
      }
      const managerDashboardTable = await DashboardTable.findOne({
        user_id: userId,
        month_name,
        year,
      });

      if (managerDashboardTable) {
        managerDashboardTable.total_expense += total_amount;
        managerDashboardTable.total_profit -= total_amount;
        await managerDashboardTable.save();
      } else {
        // Create a new dashboard table entry
        const newDashboardTable = new DashboardTable({
          user_id: userId,
          user_role: user.role,
          month_name,
          year,
          total_expense: total_amount,
          total_profit: profit_after_expense,
        });
        // Save the new dashboard table to the database
        await newDashboardTable.save();
      }
      const ownerDashboardTable = await DashboardTable.findOne({
        user_id: user.parent_id,
        month_name: month_name,
        year: year,
      });

      if (ownerDashboardTable) {
        ownerDashboardTable.total_expense += total_amount;
        ownerDashboardTable.total_profit -= total_amount;
        await ownerDashboardTable.save();
      } else {
        const newDashboardTable = new DashboardTable({
          user_id: user.parent_id,
          user_role: "owner",
          month_name,
          year,
          total_expense: total_amount,
          total_profit: profit_after_expense,
        });
        // Save the new dashboard table to the database
        await newDashboardTable.save();
      }
      const existingStaticSubDashData = await StaticSubDashData.findOne({
        user_id: userId,
      });
      if (spendedfor === "hotel") {
        existingStaticSubDashData.total_hotel_expenses += total_amount;
        existingStaticSubDashData.total_hotel_profit -= total_amount;
      }
      if (spendedfor === "restaurant") {
        existingStaticSubDashData.total_restaurant_expenses += total_amount;
        existingStaticSubDashData.total_restaurant_profit -= total_amount;
      }
      await existingStaticSubDashData.save();
      const existingDailySubDashData = await DailySubDashData.findOne({
        user_id: userId,
        date: localDate,
      });
      if (existingDailySubDashData) {
        if (spendedfor === "hotel") {
          existingDailySubDashData.today_hotel_expenses += total_amount;
          existingDailySubDashData.today_hotel_profit -= total_amount;
        }
        if (spendedfor === "restaurant") {
          existingDailySubDashData.today_restaurant_expenses += total_amount;
          existingDailySubDashData.today_restaurant_profit -= total_amount;
        }
        await existingDailySubDashData.save();
      }
      if (!existingDailySubDashData) {
        if (spendedfor === "hotel") {
          const newDailySubDashData = new DailySubDashData({
            user_id: userId,
            user_role: user.role,
            date: localDate,
            today_hotel_expenses: total_amount,
            today_hotel_profit: profit_after_expense,
          });
          await newDailySubDashData.save();
        }
        if (spendedfor === "restaurant") {
          const newDailySubDashData = new DailySubDashData({
            user_id: userId,
            user_role: user.role,
            date: localDate,
            today_restaurant_expenses: total_amount,
            today_restaurant_profit: profit_after_expense,
          });
          await newDailySubDashData.save();
        }
      }
      const existingMonthlySubDashData = await MonthlySubDashData.findOne({
        user_id: userId,
        month_name,
        year,
      });
      if (existingMonthlySubDashData) {
        if (spendedfor === "hotel") {
          existingMonthlySubDashData.total_hotel_expenses += total_amount;
          existingMonthlySubDashData.total_hotel_profit -= total_amount;
        }
        if (spendedfor === "restaurant") {
          existingMonthlySubDashData.total_restaurant_expenses += total_amount;
          existingMonthlySubDashData.total_restaurant_profit -= total_amount;
        }
        await existingMonthlySubDashData.save();
      }
      if (!existingMonthlySubDashData) {
        if (spendedfor === "hotel") {
          const newMonthlySubDashData = new MonthlySubDashData({
            user_id: userId,
            user_role: user.role,
            month_name,
            year,
            total_hotel_expenses: total_amount,
            total_hotel_profit: profit_after_expense,
          });
          await newMonthlySubDashData.save();
        }
        if (spendedfor === "restaurant") {
          const newMonthlySubDashData = new MonthlySubDashData({
            user_id: userId,
            user_role: user.role,
            month_name,
            year,
            total_restaurant_expenses: total_amount,
            total_restaurant_profit: profit_after_expense,
          });
          await newMonthlySubDashData.save();
        }
      }
    }
    return res.status(201).json({ message: "Successfully added expenses" });
  } catch (error) {
    console.error("Error adding expense:", error);
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

export const reduceExpense = async (req, res) => {
  try {
    const userId = req.user.userId;
    const expenseId = req.params.expense_id;
    const { items, password, reduced_amount } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (user.role === "manager") {
      const parent = await User.findById(user.parent_id);
      if (!parent) {
        return res.status(404).json({ message: "Parent not found" });
      }
      const isPasswordValid = await parent.comparePassword(password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid password" });
      }
    }
    if (user.role === "owner") {
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid password" });
      }
    }

    const existingExpense = await Expense.findOne({
      _id: expenseId,
    });
    if (!existingExpense) {
      return res.status(404).json({ message: "Expense not found" });
    }
    existingExpense.items = items;
    existingExpense.total_amount -= reduced_amount;
    await existingExpense.save();

    const newDate = new Date(existingExpense.date);

    const month_name = newDate.toLocaleString("en-US", { month: "long" }); // Full month name
    const year = newDate.getFullYear().toString();

    const localDate = existingExpense.date;

    const existingStaticSubDashData = await StaticSubDashData.findOne({
      user_id: userId,
    });
    const existingDailySubDashData = await DailySubDashData.findOne({
      user_id: userId,
      date: localDate,
    });
    const existingMonthlySubDashData = await MonthlySubDashData.findOne({
      user_id: userId,
      month_name,
      year,
    });

    const managerDashboardTable = await DashboardTable.findOne({
      user_id: userId,
      month_name,
      year,
    });
    if (managerDashboardTable) {
      managerDashboardTable.total_expense -= reduced_amount;
      managerDashboardTable.total_profit += reduced_amount;
      await managerDashboardTable.save();
    }
    const ownerDashboardTable = await DashboardTable.findOne({
      user_id: user.parent_id,
      month_name,
      year,
    });
    if (ownerDashboardTable) {
      ownerDashboardTable.total_expense -= reduced_amount;
      ownerDashboardTable.total_profit += reduced_amount;
      await ownerDashboardTable.save();
    }
    if (existingExpense.spendedfor === "hotel") {
      existingDailySubDashData.today_hotel_expenses -= reduced_amount;
      existingDailySubDashData.today_hotel_profit += reduced_amount;
      existingMonthlySubDashData.total_hotel_expenses -= reduced_amount;
      existingMonthlySubDashData.total_hotel_profit += reduced_amount;
      existingStaticSubDashData.total_hotel_expenses -= reduced_amount;
      existingStaticSubDashData.total_hotel_profit += reduced_amount;
    }
    if (existingExpense.spendedfor === "restaurant") {
      existingDailySubDashData.today_restaurant_expenses -= reduced_amount;
      existingDailySubDashData.today_restaurant_profit += reduced_amount;
      existingMonthlySubDashData.total_restaurant_expenses -= reduced_amount;
      existingMonthlySubDashData.total_restaurant_profit += reduced_amount;
      existingStaticSubDashData.total_restaurant_expenses -= reduced_amount;
      existingStaticSubDashData.total_restaurant_profit += reduced_amount;
    }

    await existingDailySubDashData.save();
    await existingMonthlySubDashData.save();
    await existingStaticSubDashData.save();

    return res.status(201).json({ message: "Successfully reduced expenses" });
  } catch (error) {
    console.error("Error adding expense:", error);
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

// Controller to partially update an existing item by its ID using PATCH
export const updateExpense = async (req, res) => {
  try {
    const expenseId = req.params.expense_id; // Assuming you pass the item ID in the URL
    const updateFields = req.body; // Fields to be updated
    const password = req.body.password;
    const userId = req.user.userId;
    // Ensure at least one field is being updated
    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({ message: "No fields to update provided" });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (user.role === "manager") {
      const parent = await User.findById(user.parent_id);
      if (!parent) {
        return res.status(404).json({ message: "Parent not found" });
      }
      const isPasswordValid = await parent.comparePassword(password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid password" });
      }
    }
    if (user.role === "owner") {
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid password" });
      }
    }
    const updatedExpense = await Expense.findByIdAndUpdate(
      expenseId,
      { $set: updateFields }, // Use $set to update only the provided fields
      { new: true }
    );

    if (!updatedExpense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    res.status(200).json({ message: "Successfully updated Expense" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update Expense" });
  }
};

export const getExpenses = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      spendedfor,
      hotel_id,
      fromDate,
      toDate,
    } = req.query;

    // Build the query object based on the provided filters
    const query = {};
    if (hotel_id) {
      query.hotel_id = hotel_id;
    }
    if (spendedfor) {
      query.spendedfor = spendedfor;
    }
    if (fromDate && toDate) {
      // If both fromDate and toDate are provided, use $gte and $lte for the date range filter
      query.date = { $gte: fromDate, $lte: toDate };
    }
    // Use the paginate function to get paginated results
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { date: -1 },
    };
    const expenses = await Expense.paginate(query, options);
    const totalAmount = await Expense.aggregate([
      { $match: query },
      { $group: { _id: null, total: { $sum: "$total_amount" } } },
    ]);

    // Extract the total value from the array
    const totalAmountValue = totalAmount.length > 0 ? totalAmount[0].total : 0;

    // Update the expenses object with the correct total value
    expenses.total = totalAmountValue;
    return res.status(200).json(expenses);
  } catch (error) {
    console.error("Error fetching expenses:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getExpenseById = async (req, res) => {
  try {
    const { expense_id } = req.params;

    // Find the expense by ID
    const expense = await Expense.findById(expense_id);

    if (!expense) {
      return res.status(404).json({ error: "Expense not found" });
    }

    return res.status(200).json(expense);
  } catch (error) {
    console.error("Error fetching expense by ID:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
