import mongoose from "mongoose";
import BarOrder from "../../models/Manager/bar.model.js";
import Hotel from "../../models/hotel.model.js";
import Room from "../../models/Manager/room.model.js";
import User from "../../models/user.model.js";

export const addBarOrder = async (req, res) => {
  try {
    const {
      name,
      room_id,
      type_of_alcohol,
      surveyor_quantity,
      price,
      paid_amount = 0, // Set default value to 0 if not provided
    } = req.body;
    const userId = req.user.userId;
    const user = await User.findById(userId);
    const hotel_id =
      user.assignedHotel.length > 0 ? user.assignedHotel[0] : null;

    // Calculate unpaid amount
    const unpaid_amount = Math.max(price - paid_amount, 0); // Ensure unpaid_amount is not negative

    // Determine the status based on paid_amount
    let status = "Pending";
    if (paid_amount >= price) {
      status = "Paid";
    } else if (paid_amount > 0) {
      status = "Partial";
    }

    const newBarOrder = new BarOrder({
      name,
      hotel_id: hotel_id,
      room_id: room_id,
      type_of_alcohol,
      surveyor_quantity,
      price,
      paid_amount,
      unpaid_amount,
      status,
    });

    const savedBarOrder = await newBarOrder.save();

    res.status(201).json({
      success: true,
      data: savedBarOrder,
      message: "Bar order added successfully",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const getBarOrdersByHotelId = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const userId = req.user.userId;
    const user = await User.findById(userId);
    const hotel_id =
      user.assignedHotel.length > 0 ? user.assignedHotel[0] : null;

    // Validate if the hotel exists
    const existingHotel = await Hotel.findById(hotel_id);
    if (!existingHotel) {
      return res.status(404).json({
        success: false,
        message: "Hotel not found",
      });
    }

    const query = { hotel_id };

    // If search parameter is provided, search by roomNumber
    if (search) {
      // Find the room matching the search term
      const room = await Room.findOne({ hotel_id, roomNumber: search });
      if (room) {
        query.room_id = room._id;
      } else {
        // If room is not found, return an empty array as there won't be any BarOrders
        return res.status(200).json({
          success: true,
          data: [],
          message: "No BarOrders found for the given roomNumber",
        });
      }
    }

    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
    };

    const result = await BarOrder.find(query)
      .limit(options.limit)
      .skip((options.page - 1) * options.limit)
      .populate("room_id", "roomNumber floorNumber");

    const totalDocuments = await BarOrder.countDocuments(query);

    const barOrders = {
      docs: result,
      totalDocs: totalDocuments,
      page: options.page,
      limit: options.limit,
      totalPages: Math.ceil(totalDocuments / options.limit),
    };
    res.status(200).json({
      success: true,
      data: barOrders,
      message: "BarOrders retrieved successfully",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const getBarOrderById = async (req, res) => {
  try {
    const barOrderId = req.params.order_id; // Assuming you use "barOrderId" as the parameter name

    // Check if the provided ID is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(barOrderId)) {
      return res.status(400).json({
        success: false,
        error: "Invalid bar order ID",
      });
    }

    const barOrder = await BarOrder.findById(barOrderId);

    if (!barOrder) {
      return res.status(404).json({
        success: false,
        error: "Bar order not found",
      });
    }

    res.status(200).json({
      success: true,
      data: barOrder,
      message: "Bar order retrieved successfully",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const updateBarOrder = async (req, res) => {
  try {
    const barOrderId = req.params.order_id; // Assuming you use "barOrderId" as the parameter name
    const updateData = req.body;

    // Check if the provided ID is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(barOrderId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid bar order ID",
      });
    }

    const existingBarOrder = await BarOrder.findById(barOrderId);

    if (!existingBarOrder) {
      return res.status(404).json({
        success: false,
        message: "Bar order not found",
      });
    }

    // Update the bar order with the provided data
    const updatedBarOrder = await BarOrder.findByIdAndUpdate(
      barOrderId,
      updateData,
      { new: true }
    );

    res.status(200).json({
      success: true,
      data: updatedBarOrder,
      message: "Bar order updated successfully",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const deleteBarOrder = async (req, res) => {
  try {
    const barOrderId = req.params.order_id; // Assuming you use "order_id" as the parameter name

    // Find the bar order by ID
    const barOrder = await BarOrder.findByIdAndDelete(barOrderId);

    if (!barOrder) {
      return res.status(404).json({
        success: false,
        message: "Bar order not found",
      });
    }

    res.status(200).json({
      success: true,
      data: {},
      message: "Bar order deleted successfully",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const getBarOrdersByRoomId = async (req, res) => {
  try {
    const { room_id } = req.params;

    // Find bar orders for the given room_id
    const barOrders = await BarOrder.find({
      room_id: room_id,
      status: { $in: ["Partial", "Pending"] },
    });

    if (!barOrders || barOrders.length === 0) {
      return res.status(404).json({
        success: false,
        error: "No bar orders found for the given room",
      });
    }

    res.status(200).json({
      success: true,
      data: barOrders,
      message: "Bar orders retrieved successfully",
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
