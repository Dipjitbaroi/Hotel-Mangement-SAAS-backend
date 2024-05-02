import mongoose from "mongoose";
import ManagerReport from "../../models/Manager/report.model.js";
import User from "../../models/user.model.js";

export const getReportsByHotelId = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      filter,
      fromDate,
      toDate,
    } = req.query;

    const userId = req.user.userId;
    const user = await User.findById(userId);
    const hotel_id =
      user.assignedHotel.length > 0 ? user.assignedHotel[0] : null;

    const query = { hotel_id };

    // Add search criteria if provided
    if (search) {
      query.guestName = { $regex: search, $options: "i" };
    }

    // Add filter criteria if provided
    if (["Cash", "Card", "Mobile_Banking"].includes(filter)) {
      query.payment_method = filter;
    }

    // Add date range criteria if provided
    if (fromDate && toDate) {
      query.checked_out = { $gte: fromDate, $lte: toDate };
    }

    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      sort: { checked_out: -1 },
    };

    // Use Mongoose pagination to retrieve reports
    const reports = await ManagerReport.paginate(query, options);
    const allReports = await ManagerReport.find(query);
    // Calculate total payable, paid, and unpaid amounts
    const totalPayableAmount = allReports.reduce(
      (acc, report) => acc + report.payable_amount,
      0
    );
    const totalPaidAmount = allReports.reduce(
      (acc, report) => acc + report.paid_amount,
      0
    );
    const totalBalanceDeducted = allReports.reduce(
      (acc, report) => acc + report.balance_deducted,
      0
    );
    const totalBalanceRefunded = allReports.reduce(
      (acc, report) => acc + report.balance_refunded,
      0
    );
    const totalUnpaidAmount = allReports.reduce(
      (acc, report) => acc + report.unpaid_amount,
      0
    );

    const response = {
      success: true,
      data: {
        docs: reports.docs,
        totalDocs: reports.totalDocs,
        limit: reports.limit,
        totalPages: reports.totalPages,
        page: reports.page,
        pagingCounter: reports.pagingCounter,
        hasPrevPage: reports.hasPrevPage,
        hasNextPage: reports.hasNextPage,
        prevPage: reports.prevPage,
        nextPage: reports.nextPage,
        total_payable_amount: totalPayableAmount,
        total_paid_amount: totalPaidAmount,
        total_balance_deducted: totalBalanceDeducted,
        total_balance_refunded: totalBalanceRefunded,
        total_unpaid_amount: totalUnpaidAmount,
      },
      message: "Reports retrieved successfully",
    };
    return res.status(200).json(response);
  } catch (error) {
    console.error(error);

    // Handle specific error cases
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Validation error. Check your request data.",
      });
    }

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const getReportsByDate = async (req, res) => {
  try {
    const { date, hotel_id, page = 1, limit = 10 } = req.query;

    // Build the query object based on the provided filters
    const query = { hotel_id };

    if (date) {
      const isValidDate = !isNaN(Date.parse(date));

      if (!isValidDate) {
        return res.status(400).json({
          success: false,
          message: "Invalid date format. Please provide a valid date.",
        });
      }

      const convertedDate = new Date(date);
      const isoStartDate = convertedDate.toISOString();
      const offset = convertedDate.getTimezoneOffset();
      convertedDate.setMinutes(convertedDate.getMinutes() - offset);
      convertedDate.setHours(23, 59, 59, 999);
      const isoEndDate = convertedDate.toISOString();

      query.createdAt = { $gte: isoStartDate, $lt: isoEndDate };
    }

    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
    };

    const reports = await ManagerReport.paginate(query, options);
    const allReports = await ManagerReport.find(query);
    // Calculate total payable, paid, and unpaid amounts
    const totalPayableAmount = allReports.reduce(
      (acc, report) => acc + report.payable_amount,
      0
    );
    const totalPaidAmount = allReports.reduce(
      (acc, report) => acc + report.paid_amount,
      0
    );
    const totalBalanceDeducted = allReports.reduce(
      (acc, report) => acc + report.balance_deducted,
      0
    );
    const totalBalanceRefunded = allReports.reduce(
      (acc, report) => acc + report.balance_refunded,
      0
    );
    const totalUnpaidAmount = allReports.reduce(
      (acc, report) => acc + report.unpaid_amount,
      0
    );

    // Update the response format
    const response = {
      success: true,
      data: {
        docs: reports.docs,
        totalDocs: reports.totalDocs,
        limit: reports.limit,
        totalPages: reports.totalPages,
        page: reports.page,
        pagingCounter: reports.pagingCounter,
        hasPrevPage: reports.hasPrevPage,
        hasNextPage: reports.hasNextPage,
        prevPage: reports.prevPage,
        nextPage: reports.nextPage,
        total_payable_amount: totalPayableAmount,
        total_paid_amount: totalPaidAmount,
        total_balance_deducted: totalBalanceDeducted,
        total_balance_refunded: totalBalanceRefunded,
        total_unpaid_amount: totalUnpaidAmount,
      },
      message: "Reports retrieved successfully",
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error("Error fetching reports:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
