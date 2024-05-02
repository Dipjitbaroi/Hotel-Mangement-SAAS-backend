import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import User from "../models/user.model.js";
import Hotel from "../models/hotel.model.js";
import TransactionLog from "../models/transactionlog.model.js";
import StatusLog from "../models/statuslog.model.js";
import Report from "../models/report.model.js";
import { Dashboard, DashboardTable } from "../models/dashboard.model.js";
import { StaticSubDashData } from "../models/subdashboard.model.js";

// Create a function to handle user creation
export const addUser = async (req, res) => {
  try {
    const { userId } = req.user;
    // Extract user data from the request body
    const {
      username,
      name,
      password,
      role,
      designation,
      shift,
      status,
      address,
      email,
      phone_no,
      emergency_contact,
      salary,
      joining_date,
      assignedHotel,
      images,
    } = req.body;

    const parent = await User.findById(userId);

    if (!parent) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if a user with the same username already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "Username already exists" });
    }
    // Check if the user making the request has permission to update fields based on hierarchy
    const hierarchy = {
      admin: ["subadmin", "owner", "manager", "employee"],
      subadmin: ["owner", "manager", "employee"],
      owner: ["manager", "employee"],
      manager: ["employee"],
    };

    if (!hierarchy[parent.role]) {
      return res
        .status(403)
        .json({ message: "You have no permission to create ", role });
    }

    // Create a new user instance
    const newUser = new User({
      parent_id: userId,
      username,
      name,
      password,
      role,
      designation,
      shift,
      status,
      address,
      email,
      phone_no,
      emergency_contact,
      salary,
      joining_date,
      assignedHotel,
      images,
    });

    // Save the user to the database
    const savedNewUser = await newUser.save();
    if (role !== "employee") {
      const newDashboard = new Dashboard({
        user_id: savedNewUser._id,
        user_role: role,
      });
      await newDashboard.save();
      // Create a new dashboard table entry
      const newDashboardTable = new DashboardTable({
        user_id: savedNewUser._id,
        user_role: role,
      });
      // Save the new dashboard table to the database
      await newDashboardTable.save();
    }

    // Respond with a success message or the created user object
    res
      .status(201)
      .json({ message: "User created successfully", user: newUser });
  } catch (error) {
    // Handle any errors that occur during user creation
    console.error(error);
    res
      .status(500)
      .json({ message: "User creation failed", error: error.message });
  }
};

export const addLicense = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      username,
      name,
      password,
      address,
      email,
      phone_no,
      emergency_contact,
      bill_info,
      bill_from,
      bill_to,
      maxHotels,
      payment_method,
      tran_id,
      amount,
      remark,
      images,
    } = req.body;

    const { userId } = req.user;
    const parent = await User.findById(userId);

    if (!parent || (parent.role !== "admin" && parent.role !== "subadmin")) {
      return res
        .status(403)
        .json({ message: "You have no permission to create a license" });
    }

    // Check if a user with the same username already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "Username already exists" });
    }
    const currentDate = new Date();
    const month_name = currentDate.toLocaleString("en-US", { month: "long" }); // Full month name
    const year = currentDate.getFullYear().toString();

    const existingDashboard = await Dashboard.findOne({
      user_id: userId,
    });
    if (parent.role === "admin") {
      existingDashboard.total_sell_lic += 1;
      existingDashboard.total_amount += amount;
      existingDashboard.total_customer += 1;
      existingDashboard.total_active_lic += 1;

      await existingDashboard.save();
      const existingDashboardTable = await DashboardTable.findOne({
        user_id: userId,
        month_name: month_name,
        year: year,
      });
      if (existingDashboardTable) {
        existingDashboardTable.total_sale += 1;
        await existingDashboardTable.save();
      } else {
        // Create a new dashboard table entry
        const newDashboardTable = new DashboardTable({
          user_id: userId,
          user_role: parent.role,
          total_sale: 1,
        });
        // Save the new dashboard table to the database
        await newDashboardTable.save();
      }
    } else {
      existingDashboard.total_sell_lic += 1;
      existingDashboard.total_amount += amount;
      existingDashboard.total_customer += 1;
      existingDashboard.total_active_lic += 1;

      await existingDashboard.save();

      const existingParentDashboard = await Dashboard.findOne({
        user_id: parent.parent_id,
      });
      existingParentDashboard.total_sell_lic += 1;
      existingParentDashboard.total_amount += amount;
      existingParentDashboard.total_customer += 1;
      existingParentDashboard.total_active_lic += 1;

      await existingParentDashboard.save();

      const existingDashboardTable = await DashboardTable.findOne({
        user_id: userId,
        month_name: month_name,
        year: year,
      });
      if (existingDashboardTable) {
        existingDashboardTable.total_sale += 1;
        await existingDashboardTable.save();
      } else {
        // Create a new dashboard table entry
        const newDashboardTable = new DashboardTable({
          user_id: userId,
          user_role: parent.role,
          total_sale: 1,
        });
        // Save the new dashboard table to the database
        await newDashboardTable.save();
      }
      const existingParentDashboardTable = await DashboardTable.findOne({
        user_id: parent.parent_id,
        month_name: month_name,
        year: year,
      });
      if (existingParentDashboardTable) {
        existingParentDashboardTable.total_sale += 1;
        await existingParentDashboardTable.save();
      } else {
        const newDashboardTable = new DashboardTable({
          user_id: parent.parent_id,
          user_role: "admin",
          total_sale: 1,
        });
        // Save the new dashboard table to the database
        await newDashboardTable.save();
      }
    }
    function generateLicenseKey() {
      const randomBytes = crypto.randomBytes(15); // Adjust the number of bytes for your desired length (20 characters -> 15 bytes)
      const licenseKey = randomBytes
        .toString("base64")
        .replace(/[^a-zA-Z0-9]/g, "")
        .slice(0, 20); // Adjust the slice length to 20
      return licenseKey;
    }

    const license_key = generateLicenseKey();
    // Create a new owner user
    const newOwner = new User({
      parent_id: userId,
      name,
      username,
      password,
      role: "owner",
      status: "Active",
      address,
      email,
      phone_no,
      emergency_contact,
      bill_info,
      bill_from,
      bill_to,
      license_key,
      maxHotels,
      images,
    });

    // Save the new owner user to the database
    const savedOwner = await newOwner.save({ session });

    // Create a new transaction log entry
    const newTransactionLog = new TransactionLog({
      dedicated_to: "license",
      tran_id,
      payment_method,
      bill_from,
      bill_to,
      from: savedOwner.username,
      to: parent.username,
      amount,
      payment_for: "Purchase",
      remark,
    });

    // Save the transaction log entry to the database
    await newTransactionLog.save({ session });

    // Create a new report object with the data provided in the request body
    const newReport = new Report({
      username,
      phone_no,
      status: "Sold",
      bill_from,
      bill_to,
      deposit_to: parent.username,
      deposit_by: username,
      hotel_limit: maxHotels,
      paid_amount: amount,
      payment_type: payment_method,
    });
    await newReport.save({ session });

    await session.commitTransaction();

    const newDeshboard = new Dashboard({
      user_id: savedOwner._id,
      user_role: "owner",
    });
    await newDeshboard.save();

    res.status(201).json({ message: "Successfully added license" });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error(error);
    res.status(500).json({ message: "Failed to add a license" });
  }
};

export const getUsersByParentId = async (req, res) => {
  try {
    const { parent_id } = req.params;
    const { page = 1, limit = 10, role, search, filter } = req.query;

    const parent = await User.findById(parent_id);
    if (!parent) {
      return res.status(404).json({ message: "Parent not found" });
    }

    const query = {};
    if (role) {
      query.role = role;
    }
    if (
      ["Active", "Deactive", "Suspended", "Expired", "Deleted"].includes(filter)
    ) {
      query.status = filter;
    }

    if (search) {
      query.$or = [
        { username: { $regex: search, $options: "i" } },
        { name: { $regex: search, $options: "i" } },
      ];
    }

    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
    };

    const users = await User.paginate(query, options);
    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to retrieve users" });
  }
};
export const getUsersByAssignedHotel = async (req, res) => {
  try {
    const hotelId = req.params.hotel_id;
    const { page = 1, limit = 10, role, search, filter } = req.query;

    // Check if the provided hotel ID is valid
    if (!mongoose.Types.ObjectId.isValid(hotelId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid hotel ID",
      });
    }

    // Find users with the provided hotel ID in their assignedHotel array
    const query = { assignedHotel: hotelId };

    if (role) {
      query.role = role;
    }

    if (
      ["Active", "Deactive", "Suspended", "Expired", "Deleted"].includes(filter)
    ) {
      query.status = filter;
    }

    if (search) {
      query.$or = [
        { username: { $regex: search, $options: "i" } },
        { name: { $regex: search, $options: "i" } },
      ];
    }

    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
    };

    const users = await User.paginate(query, options);

    res.status(200).json(users);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to retrieve users",
    });
  }
};

export const createSuperUser = async (req, res) => {
  try {
    const username = "dakadmin";
    const password = "Admin1324";

    // Check if a superuser with the same username already exists
    const existingSuperUser = await User.findOne({ username });
    if (existingSuperUser) {
      res.status(400).json("already existed");
      return;
    }

    // Create a new superuser
    const superuser = new User({
      username,
      password,
      role: "admin",
    });

    await superuser.save();
    res.status(200).json({ message: "Superuser created", data: superuser });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Faild to add superuser", error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find the user by username
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    if (user.role === "employee") {
      return res
        .status(403)
        .json({ message: "You have no permission to login" });
    }
    if (user.role === "owner") {
      const currentDate = new Date();
      if (currentDate < user.bill_from) {
        return res.status(403).json({
          message: "Login failed, please try to login within your license date",
        });
      }

      // Check if the latest object in the extended_time array has an end date less than or equal to the current date
      if (
        user.extended_time.length > 0 &&
        new Date(user.extended_time[user.extended_time.length - 1].from) >
          currentDate
      ) {
        return res
          .status(403)
          .json({ message: "You have no permission to login" });
      }
    }
    if (user.role === "manager") {
      const currentDate = new Date();
      const parent = await User.findById(user.parent_id);
      if (["Expired", "Deactive", "Deleted"].includes(parent.status)) {
        return res
          .status(403)
          .json({ message: "You have no permission to login" });
      }
      if (
        parent.extended_time.length > 0 &&
        new Date(parent.extended_time[parent.extended_time.length - 1].from) >
          currentDate
      ) {
        return res
          .status(403)
          .json({ message: "You have no permission to login" });
      }
    }
    if (["Expired", "Deactive", "Deleted"].includes(user.status)) {
      return res
        .status(403)
        .json({ message: "You have no permission to login" });
    }

    // Compare the provided password with the hashed password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid password" });
    }

    // Generate a JSON Web Token (JWT)
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "10y",
    });

    res.json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Login failed" });
  }
};

// get login user
export const getLoginUser = async (req, res) => {
  try {
    // If you want to exclude sensitive information like password
    const { userId } = req.user;
    const user = await User.findById(userId).select("-password");

    res.status(200).json({
      success: true,
      data: user,
      message: "Logged in user retrieved successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const renewLicense = async (req, res) => {
  try {
    const loginUserId = req.user.userId; // Assuming userId is part of the URL
    const {
      user_id,
      tran_id,
      payment_method,
      amount,
      bill_from,
      bill_to,
      remark,
    } = req.body;

    const parent = await User.findById(loginUserId);
    const currentDate = new Date();
    const month_name = currentDate.toLocaleString("en-US", { month: "long" }); // Full month name
    const year = currentDate.getFullYear().toString();

    if (!parent || (parent.role !== "admin" && parent.role !== "subadmin")) {
      return res
        .status(403)
        .json({ message: "You have no permission to renew a license" });
    }
    const user = await User.findById(user_id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (!user.role === "owner") {
      return res.status(403).json({ message: "This user isn't a owner" });
    }

    if (!["Expired", "Suspended"].includes(user.status)) {
      return res
        .status(400)
        .json({ message: "This license is not Expired or Suspended" });
    }
    if (parent.role === "admin") {
      const adminDashboard = await Dashboard.findOne({ user_id: loginUserId });

      adminDashboard.total_renew_lic += 1;
      adminDashboard.total_amount += amount;
      if (user.status === "Expired") {
        adminDashboard.total_expired_lic -= 1;
      }
      if (user.status === "Suspended") {
        adminDashboard.total_suspended_lic -= 1;
      }

      await adminDashboard.save();
      const adminDashboardTable = await DashboardTable.findOne({
        user_id: loginUserId,
        month_name: month_name,
        year: year,
      });

      if (adminDashboardTable) {
        adminDashboardTable.total_renew += 1;
        await adminDashboardTable.save();
      } else {
        // Create a new dashboard table entry
        const newDashboardTable = new DashboardTable({
          user_id: loginUserId,
          user_role: parent.role,
          total_renew: 1,
        });
        // Save the new dashboard table to the database
        await newDashboardTable.save();
      }
    }
    if (parent.role === "subadmin") {
      const adminDashboard = await Dashboard.findOne({
        user_id: parent.parent_id,
      });
      const subadminDashboard = await Dashboard.findOne({
        user_id: loginUserId,
      });

      adminDashboard.total_renew_lic += 1;
      adminDashboard.total_amount += amount;
      if (user.status === "Expired") {
        adminDashboard.total_expired_lic -= 1;
      }
      if (user.status === "Suspended") {
        adminDashboard.total_suspended_lic -= 1;
      }

      await adminDashboard.save();

      subadminDashboard.total_renew_lic += 1;
      subadminDashboard.total_amount += amount;
      if (user.status === "Expired") {
        subadminDashboard.total_expired_lic -= 1;
      }
      if (user.status === "Suspended") {
        subadminDashboard.total_suspended_lic -= 1;
      }

      await subadminDashboard.save();

      const subadminDashboardTable = await DashboardTable.findOne({
        user_id: loginUserId,
        month_name: month_name,
        year: year,
      });

      if (subadminDashboardTable) {
        subadminDashboardTable.total_renew += 1;
        await subadminDashboardTable.save();
      } else {
        // Create a new dashboard table entry
        const newDashboardTable = new DashboardTable({
          user_id: loginUserId,
          user_role: parent.role,
          total_renew: 1,
        });
        // Save the new dashboard table to the database
        await newDashboardTable.save();
      }
      const adminDashboardTable = await DashboardTable.findOne({
        user_id: parent.parent_id,
        month_name: month_name,
        year: year,
      });

      if (adminDashboardTable) {
        adminDashboardTable.total_renew += 1;
        await adminDashboardTable.save();
      } else {
        const newDashboardTable = new DashboardTable({
          user_id: parent.parent_id,
          user_role: "admin",
          total_renew: 1,
        });
        // Save the new dashboard table to the database
        await newDashboardTable.save();
      }
    }

    // Create a new StatusLog instance
    const newStatusLog = new StatusLog({
      changed_from: parent.username,
      changed_for: user.username,
      pre_status: user.status,
      updated_status: "Active",
      remark: remark,
    });

    // Create a new TransactionLog instance
    const newTransactionLog = new TransactionLog({
      tran_id,
      dedicated_to: "license",
      payment_method,
      bill_from,
      bill_to,
      from: user.username,
      to: parent.username,
      amount,
      payment_for: "Renew",
      remark,
    });

    // Create a new report object with the data provided in the request body
    const newReport = new Report({
      username: user.username,
      phone_no: user.phone_no,
      status: "Renew",
      bill_from,
      bill_to,
      deposit_to: parent.username,
      deposit_by: user.username,
      hotel_limit: user.maxHotels,
      paid_amount: amount,
      payment_type: payment_method,
    });

    // Use a transaction to ensure data consistency
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      await newStatusLog.save({ session });
      await newTransactionLog.save({ session });
      await newReport.save({ session });

      // Update the user's status
      user.status = "Active";
      user.bill_from = bill_from;
      user.bill_to = bill_to;
      user.last_renew = new Date().toISOString();
      user.extended_time = [];

      await user.save({ session });

      await session.commitTransaction();
      session.endSession();

      res.status(200).json({ message: "License renew successfully" });
    } catch (error) {
      await session.abortTransaction();
      session.endSession();

      console.error(error);
      res.status(500).json({ message: "Failed to update user status" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update user status" });
  }
};

export const updateStatus = async (req, res) => {
  try {
    const loginUserId = req.user.userId; // Assuming userId is part of the URL
    const { user_id, status, extended_time, new_extended_time, remark } =
      req.body;

    // Find the user by their ID
    const user = await User.findById(user_id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const hierarchy = {
      admin: ["subadmin", "owner", "manager", "employee"],
      subadmin: ["owner", "manager", "employee"],
      owner: ["manager", "employee"],
      manager: ["employee"],
    };

    // Check if the login user's role allows them to update the target user's status
    const parent = await User.findById(loginUserId);
    const allowedRoles = hierarchy[parent.role];
    if (!allowedRoles.includes(user.role)) {
      return res.status(403).json({
        message: "You have no permission to update the status of this user",
      });
    }

    // Check if the provided status is valid
    if (!["Active", "Deactive", "Suspended", "Deleted"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    if (extended_time) {
      // Create a new StatusLog instance
      const newStatusLog = new StatusLog({
        changed_from: parent.username,
        changed_for: user.username,
        extended_time: new_extended_time,
        pre_status: user.status,
        updated_status: status,
        remark: remark || "",
      });
      await newStatusLog.save();
    } else {
      // Create a new StatusLog instance
      const newStatusLog = new StatusLog({
        changed_from: parent.username,
        changed_for: user.username,
        pre_status: user.status,
        updated_status: status,
        remark: remark || "",
      });
      await newStatusLog.save();
    }

    if (status === "Suspended") {
      if (!extended_time && !new_extended_time) {
        return res.status(400).json({
          message: "'extended_time' or 'new_extended_time' is not provided",
        });
      }
      if (user.status !== "Expired") {
        return res.status(400).json({ message: "Invalid status value" });
      }
      if (parent.role === "subadmin") {
        if (user.role === "owner") {
          const userDashboard = await Dashboard.findOne({
            user_id: loginUserId,
          });
          const parentDashboard = await Dashboard.findOne({
            user_id: parent.parent_id,
          });
          userDashboard.total_expired_lic -= 1;
          userDashboard.total_suspended_lic += 1;

          await userDashboard.save();

          parentDashboard.total_expired_lic -= 1;
          parentDashboard.total_suspended_lic += 1;

          await parentDashboard.save();
        }
      }
      if (parent.role === "admin") {
        if (user.role === "owner") {
          const userDashboard = await Dashboard.findOne({
            user_id: loginUserId,
          });
          userDashboard.total_expired_lic -= 1;
          userDashboard.total_suspended_lic += 1;

          await userDashboard.save();
        }
      }

      user.extended_time = extended_time;
    } else if (status === "Active") {
      if (user.status !== "Deactive" && user.status !== "Deleted") {
        return res.status(400).json({ message: "Invalid status value" });
      }
      if (parent.role === "subadmin") {
        if (user.role === "owner") {
          const userDashboard = await Dashboard.findOne({
            user_id: loginUserId,
          });
          const parentDashboard = await Dashboard.findOne({
            user_id: parent.parent_id,
          });

          parentDashboard.total_active_lic += 1;
          userDashboard.total_active_lic += 1;
          await parentDashboard.save();
          await userDashboard.save();
        }
      }
      if (parent.role === "admin") {
        if (user.role === "owner") {
          const userDashboard = await Dashboard.findOne({
            user_id: loginUserId,
          });
          userDashboard.total_active_lic += 1;
          await userDashboard.save();
        }
      }
    } else {
      if (user.role === "owner") {
        if (parent.role === "subadmin") {
          const userDashboard = await Dashboard.findOne({
            user_id: loginUserId,
          });
          const parentDashboard = await Dashboard.findOne({
            user_id: parent.parent_id,
          });

          parentDashboard.total_active_lic -= 1;
          userDashboard.total_active_lic -= 1;
          await parentDashboard.save();
          await userDashboard.save();
        }
        if (parent.role === "admin") {
          const userDashboard = await Dashboard.findOne({
            user_id: loginUserId,
          });
          userDashboard.total_active_lic -= 1;
          await userDashboard.save();
        }
      }
    }
    // Update the user's status
    user.status = status;

    // Save the updated user document
    await user.save();

    res.status(200).json({ message: "User status updated successfully", user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update user status" });
  }
};

export const getOwnersByAdmin = async (req, res) => {
  try {
    const { userId } = req.user;
    const { page = 1, limit = 10, search, filter } = req.query;

    const parent = await User.findById(userId);
    if (!parent) {
      return res.status(404).json({ message: "User not found" });
    }
    if (!parent.role === "admin") {
      return res
        .status(403)
        .json({ message: "You have no permission to get info" });
    }

    const query = { role: "owner" };

    if (
      ["Active", "Deactive", "Suspended", "Expired", "Deleted"].includes(filter)
    ) {
      query.status = filter;
    }

    if (search) {
      query.$or = [
        { username: { $regex: search, $options: "i" } },
        { name: { $regex: search, $options: "i" } },
      ];
    }

    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
    };

    const users = await User.paginate(query, options);
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve items" });
  }
};

export const updateUserField = async (req, res) => {
  try {
    const { userId } = req.user;
    const { user_id, field, value } = req.body;

    const parent = await User.findById(userId);

    if (!parent) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the user making the request has permission to update fields based on hierarchy
    const hierarchy = {
      admin: ["subadmin", "owner", "manager", "employee"],
      subadmin: ["owner", "manager", "employee"],
      owner: ["manager", "employee"],
      manager: ["employee"],
    };

    if (!hierarchy[parent.role]) {
      return res
        .status(403)
        .json({ message: "You have no permission to update fields" });
    }

    const user = await User.findById(user_id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the user's role allows them to update the specified field
    if (!hierarchy[parent.role].includes(user.role)) {
      return res.status(403).json({
        message: "You have no permission to update this field for the user",
      });
    }

    // Update the user's field with the new value
    user[field] = value;

    // Save the updated user document
    await user.save();

    res.status(200).json({ message: "User field updated successfully", user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update user field" });
  }
};

export const getUsers = async (req, res) => {
  try {
    const { user_id, role, page = 1, limit = 10, search, filter } = req.query;

    const parent = await User.findById(user_id);

    if (!parent) {
      return res.status(404).json({ message: "Parent not found" });
    }

    // Check if the user making the request has permission to get user information
    const hierarchy = {
      admin: ["subadmin", "owner", "manager", "employee"],
      subadmin: ["owner", "manager", "employee"],
      owner: ["manager", "employee"],
      manager: ["employee"],
    };

    if (!hierarchy[parent.role]) {
      return res
        .status(403)
        .json({ message: "You have no permission to get user information" });
    }

    const query = {
      parent_id: user_id,
      role: role,
      status: { $ne: "Deleted" },
    };

    if (
      filter &&
      ["Active", "Deactive", "Suspended", "Expired"].includes(filter)
    ) {
      query.status = filter;
    }

    if (search) {
      query.$or = [
        { username: { $regex: search, $options: "i" } },
        { name: { $regex: search, $options: "i" } },
      ];
    }

    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
    };

    // Use Mongoose pagination to retrieve users
    const users = await User.paginate(query, options);

    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to retrieve users" });
  }
};

export const getUsersByAdmin = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role, page = 1, limit = 10, search, filter } = req.query;

    const parent = await User.find({ _id: userId, role: "admin" });

    if (!parent) {
      return res.status(404).json({ message: "Admin not found" });
    }

    const query = { role: role };

    if (
      filter &&
      ["Active", "Deactive", "Suspended", "Expired", "Deleted"].includes(filter)
    ) {
      query.status = filter;
    }

    if (search) {
      query.$or = [
        { username: { $regex: search, $options: "i" } },
        { name: { $regex: search, $options: "i" } },
      ];
    }

    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
    };

    // Use Mongoose pagination to retrieve users
    const users = await User.paginate(query, options);

    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to retrieve users" });
  }
};

export const getUserById = async (req, res) => {
  try {
    const { userId } = req.user;
    const { user_id } = req.params;

    const parent = await User.findById(userId);

    if (!parent) {
      return res.status(404).json({ message: "Parent not found" });
    }

    // Check if the user making the request has permission to get user information
    const hierarchy = {
      admin: ["subadmin", "owner", "manager", "employee"],
      subadmin: ["owner", "manager", "employee"],
      owner: ["manager", "employee"],
      manager: ["employee"],
    };

    if (!hierarchy[parent.role]) {
      return res
        .status(403)
        .json({ message: "You have no permission to get user information" });
    }

    const user = await User.findById(user_id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Use the populate() method to populate the 'assignedHotel' field
    await User.populate(user, { path: "assignedHotel" });

    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to retrieve user information" });
  }
};

export const updateUser = async (req, res) => {
  try {
    const user_id = req.params.user_id; // Assuming you get the user ID from the request parameters
    const updates = req.body; // Assuming you receive the updates in the request body

    // If the updates include a new password, hash it before updating
    if (updates.password) {
      const hashedPassword = await bcrypt.hash(updates.password, 10);
      updates.password = hashedPassword;
    }

    // Find the user by ID and update the fields provided in the request body
    const user = await User.findByIdAndUpdate(user_id, updates, { new: true });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ message: "Update user successful" });
  } catch (error) {
    console.error("Error updating user:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getLicenseDate = async (req, res) => {
  try {
    const user_id = req.user.userId; // Assuming you get the user ID from the request parameters

    // Find the user by ID and update the fields provided in the request body
    const user = await User.findById(user_id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const parent = await User.findById(user.parent_id);
    if (!parent) {
      return res.status(404).json({ message: "Parent not found" });
    }
    return res.status(200).json({
      success: true,
      message: "License date retrivie successful",
      startedAt: parent.bill_from,
      endsIn: parent.bill_to,
      extended_time: parent.extended_time,
    });
  } catch (error) {
    console.error("Error updating user:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const deleteUsersByRole = async (req, res) => {
  try {
    const { role } = req.params;

    // Validate the role
    const validRoles = ["owner", "manager", "admin", "subadmin", "employee"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: "Invalid role specified" });
    }

    // Delete users with the specified role
    const result = await User.deleteMany({ role });

    return res.json({
      message: `${result.deletedCount} users with role ${role} deleted successfully`,
    });
  } catch (error) {
    console.error("Error deleting users by role:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
