import mongoose from "mongoose";
import GymBills from "../../models/Manager/gym.model.js";
import Room from "../../models/Manager/room.model.js";
import User from "../../models/user.model.js";
import { BookingInfo } from "../../models/Manager/booking.model.js";

export const addGymBill = async (req, res) => {
  try {
    const { name, room_id, members, price, paid_amount = 0 } = req.body;

    const userId = req.user.userId;
    const user = await User.findById(userId);
    const hotel_id =
      user.assignedHotel.length > 0 ? user.assignedHotel[0] : null;

    const unpaid_amount = Math.max(price - paid_amount, 0);
    let status = "Pending";
    if (paid_amount >= price) {
      status = "Paid";
    } else if (paid_amount > 0) {
      status = "Partial";
    }
    if (room_id) {
      const bookingInfo = await BookingInfo.findOne({ room_ids: room_id });
      bookingInfo.total_posted_bills += unpaid_amount;
      bookingInfo.total_payable_amount += unpaid_amount;
      bookingInfo.total_unpaid_amount += unpaid_amount;
      await bookingInfo.save();
    }
    const newGymBill = new GymBills({
      name,
      hotel_id: hotel_id,
      room_id: room_id,
      members,
      price,
      paid_amount,
      unpaid_amount,
      status,
    });

    const savedGymBill = await newGymBill.save();

    res.status(201).json({
      success: true,
      data: savedGymBill,
      message: "Gym bill added successfully",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const getGymBillsByHotelId = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, filter } = req.query;
    const userId = req.user.userId;
    const user = await User.findById(userId);
    const hotel_id =
      user.assignedHotel.length > 0 ? user.assignedHotel[0] : null;

    const query = { hotel_id };

    if (search) {
      const room = await Room.findOne({ hotel_id, roomNumber: search });
      if (room) {
        query.room_id = room._id;
      } else {
        return res.status(200).json({
          success: true,
          data: [],
          message: "No Gym Bills found for the given roomNumber",
        });
      }
    }

    if (["Pending", "Paid", "Partial"].includes(filter)) {
      query.status = filter;
    }

    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
    };

    const gymBills = await GymBills.paginate(query, options);

    res.status(200).json({
      success: true,
      data: gymBills,
      message: "Gym Bills retrieved successfully",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const getGymBillById = async (req, res) => {
  try {
    const gymBillId = req.params.bill_id;

    if (!mongoose.Types.ObjectId.isValid(gymBillId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid gym bill ID",
      });
    }

    const gymBill = await GymBills.findById(gymBillId);

    if (!gymBill) {
      return res.status(404).json({
        success: false,
        message: "Gym bill not found",
      });
    }

    res.status(200).json({
      success: true,
      data: gymBill,
      message: "Gym bill retrieved successfully",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const updateGymBill = async (req, res) => {
  try {
    const gymBillId = req.params.bill_id;
    const updateData = req.body;

    if (!mongoose.Types.ObjectId.isValid(gymBillId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid gym bill ID",
      });
    }

    const existingGymBill = await GymBills.findById(gymBillId);

    if (!existingGymBill) {
      return res.status(404).json({
        success: false,
        message: "Gym bill not found",
      });
    }

    const updatedGymBill = await GymBills.findByIdAndUpdate(
      gymBillId,
      updateData,
      { new: true }
    );

    res.status(200).json({
      success: true,
      data: updatedGymBill,
      message: "Gym bill updated successfully",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const getGymBillsByRoomId = async (req, res) => {
  try {
    const { room_id } = req.params;

    // Find gym bills for the given room_id
    const gymBills = await GymBills.find({
      room_id: room_id,
      // You may add other conditions if needed
    });

    if (!gymBills || gymBills.length === 0) {
      return res.status(404).json({
        success: false,
        error: "No gym bills found for the given room",
      });
    }

    res.status(200).json({
      success: true,
      data: gymBills,
      message: "Gym bills retrieved successfully",
    });
  } catch (error) {
    console.error(error);

    // Handle specific error cases
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        error: "Validation error. Check your request data.",
      });
    }

    res.status(500).json({
      success: false,
      error: "Internal Server Error",
    });
  }
};
