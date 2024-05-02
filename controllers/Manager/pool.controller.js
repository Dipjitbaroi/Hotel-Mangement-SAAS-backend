import mongoose from "mongoose";
import PoolBills from "../../models/Manager/pool.model.js";
import Room from "../../models/Manager/room.model.js";
import User from "../../models/user.model.js";
import { BookingInfo } from "../../models/Manager/booking.model.js";

export const addPoolBill = async (req, res) => {
  try {
    const {
      name,
      room_id,
      members,
      pool_name,
      price,
      paid_amount = 0,
    } = req.body;

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
    const newPoolBill = new PoolBills({
      name,
      hotel_id: hotel_id,
      room_id: room_id,
      members,
      pool_name,
      price,
      paid_amount,
      unpaid_amount,
      status,
    });

    const savedPoolBill = await newPoolBill.save();

    res.status(201).json({
      success: true,
      data: savedPoolBill,
      message: "Pool bill added successfully",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
export const getPoolBillsByHotelId = async (req, res) => {
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
          message: "No Pool Bills found for the given roomNumber",
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

    const poolBills = await PoolBills.paginate(query, options);

    res.status(200).json({
      success: true,
      data: poolBills,
      message: "Pool Bills retrieved successfully",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
export const getPoolBillById = async (req, res) => {
  try {
    const poolBillId = req.params.bill_id;

    if (!mongoose.Types.ObjectId.isValid(poolBillId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid pool bill ID",
      });
    }

    const poolBill = await PoolBills.findById(poolBillId);

    if (!poolBill) {
      return res.status(404).json({
        success: false,
        message: "Pool bill not found",
      });
    }

    res.status(200).json({
      success: true,
      data: poolBill,
      message: "Pool bill retrieved successfully",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
export const updatePoolBill = async (req, res) => {
  try {
    const poolBillId = req.params.bill_id;
    const updateData = req.body;

    if (!mongoose.Types.ObjectId.isValid(poolBillId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid pool bill ID",
      });
    }

    const existingPoolBill = await PoolBills.findById(poolBillId);

    if (!existingPoolBill) {
      return res.status(404).json({
        success: false,
        message: "Pool bill not found",
      });
    }

    const updatedPoolBill = await PoolBills.findByIdAndUpdate(
      poolBillId,
      updateData,
      { new: true }
    );

    res.status(200).json({
      success: true,
      data: updatedPoolBill,
      message: "Pool bill updated successfully",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const getPoolBillsByRoomId = async (req, res) => {
  try {
    const { room_id } = req.params;

    // Find pool bills for the given room_id
    const poolBills = await PoolBills.find({
      room_id: room_id,
      // You may add other conditions if needed
    });

    if (!poolBills || poolBills.length === 0) {
      return res.status(404).json({
        success: false,
        error: "No pool bills found for the given room",
      });
    }

    res.status(200).json({
      success: true,
      data: poolBills,
      message: "Pool bills retrieved successfully",
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
