import User from "../models/user.model.js";
import Report from "../models/report.model.js";

export const getReport = async (req, res) => {
  try {
    const {
      user_id,
      page = 1,
      limit = 10,
      filter,
      search,
      fromDate,
      toDate,
    } = req.query;

    const user = await User.findById(user_id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Construct a query to filter transaction logs based on the username
    const query = {
      deposit_to: user.username,
    };

    if (fromDate && toDate) {
      // If both fromDate and toDate are provided, use $gte and $lte for the date range filter
      query.createdAt = { $gte: fromDate, $lte: toDate };
    } else if (fromDate) {
      // If only fromDate is provided, use $gte for the minimum date filter
      query.createdAt = { $gte: fromDate, $lte: toDate };
    } else if (toDate) {
      // If only toDate is provided, use $lte for the maximum date filter
      query.createdAt = { $gte: fromDate, $lte: toDate };
    }
    if (["Sold", "Renew", "Expired"].includes(filter)) {
      query.status = filter;
    }
    if (search) {
      query.deposit_by = { $regex: search, $options: "i" };
    }

    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      sort: { createdAt: -1 },
    };
    const result = await Report.paginate(query, options);
    const allReports = await Report.find(query);
    const totalPaidAmount = allReports.reduce(
      (acc, report) => acc + report.paid_amount,
      0
    );
    result.total_paid_amount = totalPaidAmount;

    return res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching transaction logs:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getAllReport = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      filter,
      search,
      fromDate,
      toDate,
    } = req.query;

    // Construct a query to filter transaction logs based on the username
    const query = {};

    if (fromDate && toDate) {
      // If both fromDate and toDate are provided, use $gte and $lte for the date range filter
      query.$and = [
        { createdAt: { $gte: new Date(fromDate), $lte: new Date(toDate) } },
        { updatedAt: { $gte: new Date(fromDate), $lte: new Date(toDate) } },
      ];
    } else if (fromDate) {
      // If only fromDate is provided, use $gte for the minimum date filter
      query.$and = [
        { createdAt: { $gte: new Date(fromDate) } },
        { updatedAt: { $gte: new Date(fromDate) } },
      ];
    } else if (toDate) {
      // If only toDate is provided, use $lte for the maximum date filter
      query.createdAt = [
        { createdAt: { $lte: new Date(toDate) } },
        { updatedAt: { $lte: new Date(toDate) } },
      ];
    }
    if (["Sold", "Renew", "Expired"].includes(filter)) {
      query.status = filter;
    }
    if (search) {
      // Add search criteria if a search keyword is provided
      query.$or = [
        { deposit_by: { $regex: search, $options: "i" } },
        { deposit_to: { $regex: search, $options: "i" } },
      ];
    }

    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      sort: { createdAt: -1 }, // Sort by createdAt field in descending order
    };

    const result = await Report.paginate(query, options);
    const allReports = await Report.find(query);
    const totalPaidAmount = allReports.reduce(
      (acc, report) => acc + report.paid_amount,
      0
    );
    result.total_paid_amount = totalPaidAmount;
    return res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching transaction logs:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
