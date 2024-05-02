import mongoose from "mongoose";
import Hotel from "../models/hotel.model.js";
import User from "../models/user.model.js";
import {
  CheckInfo,
  Dashboard,
  DashboardTable,
} from "../models/dashboard.model.js";
import {
  DailySubDashData,
  StaticSubDashData,
} from "../models/subdashboard.model.js";

export const addHotel = async (req, res) => {
  try {
    const {
      owner_id,
      name,
      branch_name,
      address,
      email,
      username,
      password,
      phone_no,
    } = req.body;

    // Check if the owner exists and has available slots for a new hotel
    const owner = await User.findOne({ _id: owner_id, role: "owner" });

    if (!owner) {
      return res.status(404).json({ message: "Owner not found" });
    }
    // Check if a user with the same username already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "Username already exists" });
    }

    // Create a new hotel instance with the provided data
    const newHotel = new Hotel({
      owner_id,
      name,
      branch_name,
      address,
      email,
      phone_no,
    });

    // Save the new hotel to the database
    const savedHotel = await newHotel.save();

    // Create a new user instance
    const newUser = new User({
      parent_id: owner_id,
      username,
      name: name + " " + branch_name,
      password,
      role: "manager",
      assignedHotel: [savedHotel._id],
    });

    // Save the user to the database
    const savedNewUser = await newUser.save();
    savedHotel.manager_acc = savedNewUser._id;
    await savedHotel.save();

    owner.manager_accounts.push(savedNewUser._id);
    await owner.save();

    const newDashboard = new Dashboard({
      user_id: savedNewUser._id,
      user_role: "manager",
    });
    await newDashboard.save();
    // Create a new dashboard table entry
    const newDashboardTable = new DashboardTable({
      user_id: savedNewUser._id,
      user_role: "manager",
    });
    // Save the new dashboard table to the database
    await newDashboardTable.save();
    const newStaticSubDashData = new StaticSubDashData({
      user_id: savedNewUser._id,
      user_role: "manager",
    });
    await newStaticSubDashData.save();

    // Update the owner's assignedHotel array
    owner.assignedHotel.push(savedHotel._id);
    await owner.save();

    res.status(201).json({ message: "Successfully added hotel" }); // Respond with the created hotel data
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to add a new hotel" });
  }
};
export const getHotels = async (req, res) => {
  try {
    const {
      parent_id,
      user_id,
      page = 1,
      limit = 10,
      search,
      filter,
    } = req.query;

    const owner = await User.findById(user_id);
    if (!owner) {
      return res.status(404).json({ message: "Owner not found" });
    }
    if (parent_id) {
      const parent = await User.findById(parent_id);
      if (!parent) {
        return res.status(404).json({ message: "Parent not found" });
      }
      if (!["admin", "subadmin"].includes(parent.role)) {
        return res
          .status(403)
          .json({ message: "You have no permission to get info" });
      }
    }

    const query = { owner_id: user_id };

    if (filter) {
      query.status = filter;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { branch_name: { $regex: search, $options: "i" } },
      ];
    }

    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
    };

    // const hotels = await Hotel.paginate(query, options);
    // Execute the query without paginate and then use populate
    const result = await Hotel.find(query)
      .limit(options.limit)
      .skip((options.page - 1) * options.limit)
      .populate("manager_acc", "username");

    const totalDocuments = await Hotel.countDocuments(query);

    const hotels = {
      docs: result,
      totalDocs: totalDocuments,
      page: options.page,
      limit: options.limit,
      totalPages: Math.ceil(totalDocuments / options.limit),
    };
    res.status(200).json(hotels);
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve hotels" });
  }
};

export const getHotelById = async (req, res) => {
  try {
    const { hotel_id } = req.params;

    const hotel = await Hotel.findById(hotel_id).populate(
      "manager_acc",
      "username"
    );

    if (!hotel) {
      return res.status(404).json({ message: "Hotel not found" });
    }

    res.status(200).json(hotel);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to retrieve hotel information" });
  }
};
export const getHotelsByManagerId = async (req, res) => {
  try {
    const { manager_id } = req.params; // Assuming managerId is in the URL parameters

    // Use Mongoose to find hotels that have a manager with the specified ID
    const hotels = await Hotel.find({ manager_acc: manager_id });

    if (!hotels || hotels.length === 0) {
      return res
        .status(404)
        .json({ message: "No hotels found for this manager ID" });
    }

    res.status(200).json(hotels);
  } catch (error) {
    console.error("Error fetching hotels by manager ID:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
// Controller to update a hotel by ID
export const updateHotel = async (req, res) => {
  try {
    const owner_id = req.query.owner_id;
    const hotel_id = req.params.hotel_id; // Assuming you pass the hotel ID in the URL
    const updateFields = req.body; // Fields to be updated

    // Ensure at least one field is being updated
    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({ message: "No fields to update provided" });
    }
    if (updateFields.status === "Active") {
      const owner = await User.findById(owner_id);
      if (!owner) {
        return res.status(404).json({ message: "Owner not found" });
      }
      const totalDocuments = await Hotel.countDocuments({
        owner_id: owner_id,
        status: "Active",
      });
      if (owner.maxHotels <= totalDocuments) {
        return res.status(403).json({
          message: "Please upgrade owner package to 'Active' this hotel",
        });
      }
    }
    if (updateFields.status === "Deleted") {
      const hotel = await Hotel.findById(hotel_id);
      if (!hotel) {
        return res.status(404).json({ message: "Hotel not found" });
      }
      const manager = await User.findByIdAndUpdate(hotel.manager_acc, {
        $set: { status: "Deleted" },
      });
      if (!manager) {
        return res.status(404).json({ message: "Manager not found" });
      }
    }

    // Use the `findByIdAndUpdate` method to update the hotel by ID
    const updatedHotel = await Hotel.findByIdAndUpdate(
      hotel_id,
      { $set: updateFields }, // Use $set to update only the provided fields
      { new: true }
    );
    if (!updatedHotel) {
      return res.status(404).json({ message: "Hotel not found" });
    }

    res.status(200).json({ message: "Successfully updated hotel" });
  } catch (error) {
    res.status(500).json({ message: "Failed to update hotel" });
  }
};

// Controller to delete a hotel by ID
export const deleteHotel = async (req, res) => {
  try {
    const hotelId = req.params.id; // Assuming you pass the hotel ID in the URL

    // Use the `findByIdAndDelete` method to delete the hotel by ID
    const deletedHotel = await Hotel.findByIdAndDelete(hotelId);

    if (!deletedHotel) {
      return res.status(404).json({ message: "Hotel not found" });
    }

    res.status(200).json({ message: "Hotel deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete hotel" });
  }
};

// Controller to get all employees with filter options and pagination
export const getAllHotels = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const query = {};

    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      sort: { name: -1, branch_name: -1 },
    };
    const items = await Hotel.paginate(query, options);
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve items" });
  }
};

export const getDailyDatas = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      filter,
      fromDate,
      toDate,
      manager_id,
    } = req.query;

    // Construct the filters
    const query = {};

    if (fromDate && toDate) {
      // If both fromDate and toDate are provided, use $gte and $lte for the date range filter
      query.date = { $gte: fromDate, $lte: toDate };
    } else if (fromDate) {
      // If only fromDate is provided, use $gte for the minimum date filter
      query.date = { $gte: fromDate };
    } else if (toDate) {
      // If only toDate is provided, use $lte for the maximum date filter
      query.date = { $lte: toDate };
    }

    if (filter === "hotel") {
      query.today_hotel_income = { $gte: 1 };
    }
    if (filter === "restaurant") {
      query.today_restaurant_income = { $gte: 1 };
    }

    // Filter by user_id
    if (manager_id) {
      query.user_id = manager_id;
    }
    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      sort: { date: -1 },
    };
    // Use the paginate method with the constructed filters
    const result = await DailySubDashData.paginate(query, options);

    res.status(200).json({
      success: true,
      message: "Daily datas fetched successfully",
      data: result,
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

export const getHotelDailyData = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      filter,
      fromDate,
      toDate,
      manager_id,
    } = req.query;

    // Construct the filters
    const query = {};

    if (fromDate && toDate) {
      // If both fromDate and toDate are provided, use $gte and $lte for the date range filter
      query.date = { $gte: fromDate, $lte: toDate };
    } else if (fromDate) {
      // If only fromDate is provided, use $gte for the minimum date filter
      query.date = { $gte: fromDate };
    } else if (toDate) {
      // If only toDate is provided, use $lte for the maximum date filter
      query.date = { $lte: toDate };
    }

    if (filter === "booking") {
      query.today_remaining_booking = { $gte: 1 };
    }
    if (filter === "checkin") {
      query.today_remaining_checkin = { $gte: 1 };
    }

    // Filter by user_id
    if (manager_id) {
      query.user_id = manager_id;
    }
    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      sort: { date: -1 },
    };
    // Use the paginate method with the constructed filters
    const result = await CheckInfo.paginate(query, options);

    res.status(200).json({
      success: true,
      message: "Hotel daily datas fetched successfully",
      data: result,
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
