import StatusLog from "../models/statuslog.model.js";
import User from "../models/user.model.js";

export const getStatusLogs = async (req, res) => {
  try {
    const {
      user_id,
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
      $or: [{ changed_from: user.username }, { changed_for: user.username }],
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
        { chnaged_from: { $regex: search, $options: "i" } },
        { changed_for: { $regex: search, $options: "i" } },
      ];
    }

    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      sort: { createdAt: -1 },
    };

    const result = await StatusLog.paginate(query, options);

    return res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching transaction logs:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
