import TransactionLog from "../models/transactionlog.model.js";
import User from "../models/user.model.js";

export const getTransactionLogs = async (req, res) => {
  try {
    const {
      user_id,
      dedicated_to = "license",
      page = 1,
      limit = 10,
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

    if (search) {
      // Add search criteria if a search keyword is provided
      query.$or = [
        { tran_id: { $regex: search, $options: "i" } },
        { from: { $regex: search, $options: "i" } },
        { to: { $regex: search, $options: "i" } },
        { payment_for: { $regex: search, $options: "i" } },
        { remark: { $regex: search, $options: "i" } },
      ];
    }

    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      sort: { createdAt: -1 },
    };

    const result = await TransactionLog.paginate(query, options);

    return res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching transaction logs:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
