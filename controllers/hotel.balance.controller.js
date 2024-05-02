import { BookingInfo } from "../models/Manager/booking.model.js";
import { Dashboard } from "../models/dashboard.model.js";
import TransactionLog from "../models/transactionlog.model.js";
import User from "../models/user.model.js";

export const makePayment = async (req, res) => {
  try {
    const {
      manager_id,
      booking_id,
      amount,
      paymentMethod,
      payment_for,
      tran_id,
      remark,
    } = req.body;
    const manager = await User.findById(manager_id);
    if (!manager) {
      return res.status(404).json({
        success: false,
        message: "Manager not found",
      });
    }
    // Find the BookingInfo based on the provided bookingInfoId
    const bookingInfo = await BookingInfo.findOne({ booking_ids: booking_id });

    if (!bookingInfo) {
      return res.status(404).json({
        success: false,
        message: "BookingInfo not found",
      });
    }
    bookingInfo.paid_amount += amount;
    bookingInfo.total_unpaid_amount -= amount;
    bookingInfo.total_balance += amount;
    await bookingInfo.save();

    const ownerDashboard = await Dashboard.findOne({
      user_id: manager.parent_id,
    });
    ownerDashboard.total_amount += amount;
    await ownerDashboard.save();

    const managerDashboard = await Dashboard.findOne({
      user_id: manager_id,
    });
    managerDashboard.total_amount += amount;
    await managerDashboard.save();

    // Create a new TransactionLog entry
    const newTransactionLog = new TransactionLog({
      manager_id,
      booking_info_id: bookingInfo._id,
      payment_method: paymentMethod,
      dedicated_to: "hotel",
      tran_id,
      from: bookingInfo.guestName,
      to: manager.username,
      amount: amount,
      payment_for: payment_for,
      remark: remark,
    });

    // Save the new TransactionLog entry
    await newTransactionLog.save();

    res.status(200).json({
      success: true,
      data: {
        bookingInfo: bookingInfo,
        transactionLog: newTransactionLog,
      },
      message: "Payment made successfully",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export const cashBack = async (req, res) => {
  try {
    const {
      manager_id,
      bookingInfoId,
      amount,
      paymentMethod,
      tran_id,
      remark,
    } = req.body;

    const manager = await User.findById(manager_id);
    if (!manager) {
      return res.status(404).json({
        success: false,
        message: "Manager not found",
      });
    }
    // Find the BookingInfo based on the provided bookingInfoId
    const bookingInfo = await BookingInfo.findById(bookingInfoId);

    if (!bookingInfo) {
      return res.status(404).json({
        success: false,
        message: "BookingInfo not found",
      });
    }
    bookingInfo.paid_amount -= amount;
    bookingInfo.total_balance -= amount;
    bookingInfo.save();

    const ownerDashboard = await Dashboard.findOne({
      user_id: manager.parent_id,
    });
    ownerDashboard.total_amount -= amount;
    await ownerDashboard.save();

    const managerDashboard = await Dashboard.findOne({
      user_id: manager_id,
    });
    managerDashboard.total_amount -= amount;
    await managerDashboard.save();

    const newTransactionLog = new TransactionLog({
      manager_id,
      booking_info_id: bookingInfoId,
      payment_method: paymentMethod,
      dedicated_to: "hotel",
      tran_id,
      from: bookingInfo.guestName,
      to: manager.username,
      payment_for: "CashBack",
      amount: amount,
      remark: remark,
    });

    // Save the new TransactionLog entry
    await newTransactionLog.save();

    res.status(200).json({
      success: true,
      data: {
        bookingInfo: bookingInfo,
        transactionLog: newTransactionLog,
      },
      message: "Cashback successfully",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export const getFinancialOverview = async (req, res) => {
  try {
    const {
      user_id,
      dedicated_to = "hotel",
      payment_for,
      payment_method,
      page = 1,
      limit = 10,
      fromDate,
      toDate,
    } = req.query;

    const validPaymentFor = [
      "Booking",
      "CheckIn",
      "CheckOut",
      "FoodPay",
      "Deposit",
    ];

    // Validate payment_for field
    if (payment_for && !validPaymentFor.includes(payment_for)) {
      return res.status(404).json({ message: "Invalid payment_for value" });
    }

    let incomeQuery;
    let disbursementQuery;
    const user = await User.findById(user_id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Construct a query to filter transaction logs based on the username
    const query = {
      $or: [{ from: user.username }, { to: user.username }],
      dedicated_to,
    };

    if (fromDate && toDate) {
      // If both fromDate and toDate are provided, use $gte and $lte for the date range filter
      query.createdAt = { $gte: new Date(fromDate), $lte: new Date(toDate) };
    } else if (fromDate) {
      // If only fromDate is provided, use $gte for the minimum date filter
      query.createdAt = { $gte: new Date(fromDate) };
    } else if (toDate) {
      // If only toDate is provided, use $lte for the maximum date filter
      query.createdAt = { $lte: new Date(toDate) };
    }

    if (payment_method) {
      query.payment_method = payment_method;
    }
    disbursementQuery = {
      ...query,
      payment_for: { $in: ["BookingCanceled", "CashBack"] },
    };
    if (payment_for) {
      query.payment_for = payment_for;
    }
    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      sort: { createdAt: -1 },
    };

    const result = await TransactionLog.paginate(query, options);
    // Separate queries for income and disbursement transactions
    if (!query.payment_for) {
      incomeQuery = {
        ...query,
        payment_for: { $nin: ["BookingCanceled", "CashBack"] },
      };
    }
    if (query.payment_for) {
      incomeQuery = {
        ...query,
      };
    }
    console.log({ incomeQuery });
    // Fetch income and disbursement transactions
    const allIncomes = await TransactionLog.find(incomeQuery);
    const disbursementAmount = await TransactionLog.find(disbursementQuery);

    // Calculate total income and disbursement amounts
    const total_income = allIncomes.reduce(
      (acc, report) => acc + report.amount,
      0
    );
    const total_disbursement = disbursementAmount.reduce(
      (acc, report) => acc + report.amount,
      0
    );

    // Calculate net total amount
    const totalAmount = total_income - total_disbursement;
    console.log({ total_income });
    console.log({ total_disbursement });
    console.log({ totalAmount });

    const response = {
      success: true,
      data: {
        docs: result.docs,
        totalDocs: result.totalDocs,
        limit: result.limit,
        totalPages: result.totalPages,
        page: result.page,
        pagingCounter: result.pagingCounter,
        hasPrevPage: result.hasPrevPage,
        hasNextPage: result.hasNextPage,
        prevPage: result.prevPage,
        nextPage: result.nextPage,
        total_amount: totalAmount,
        total_income: total_income,
        total_disbursement: total_disbursement,
      },
      message: "Transactions retrieved successfully",
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error("Error fetching transaction logs:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
