import Table from "../../models/Manager/table.model.js";
import User from "../../models/user.model.js";

export const addTable = async (req, res) => {
  try {
    const { table_number, capacity, description, status } = req.body;
    const userId = req.user.userId;
    const user = await User.findById(userId);
    const hotel_id =
      user.assignedHotel.length > 0 ? user.assignedHotel[0] : null;

    const newTable = new Table({
      hotel_id,
      table_number,
      capacity,
      description,
      status,
    });

    const savedTable = await newTable.save();

    res.status(201).json({
      success: true,
      data: savedTable,
      message: "Table added successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const getTablesByHotelId = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId);
    const hotel_id =
      user.assignedHotel.length > 0 ? user.assignedHotel[0] : null;

    const tables = await Table.find({ hotel_id });

    res.status(200).json({
      success: true,
      data: tables,
      message: "Tables retrieved successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const getTableById = async (req, res) => {
  try {
    const { table_id } = req.params;

    const table = await Table.findById(table_id);

    if (!table) {
      return res.status(404).json({
        success: false,
        message: "Table not found",
      });
    }

    res.status(200).json({
      success: true,
      data: table,
      message: "Table retrieved successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
export const updateTable = async (req, res) => {
  try {
    const { table_id } = req.params;
    const updateData = req.body;

    const updatedTable = await Table.findByIdAndUpdate(table_id, updateData, {
      new: true,
    });

    if (!updatedTable) {
      return res.status(404).json({
        success: false,
        message: "Table not found",
      });
    }

    res.status(200).json({
      success: true,
      data: updatedTable,
      message: "Table updated successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
export const deleteTable = async (req, res) => {
  try {
    const { table_id } = req.params;

    const deletedTable = await Table.findByIdAndDelete(table_id);

    if (!deletedTable) {
      return res.status(404).json({
        success: false,
        message: "Table not found",
      });
    }

    res.status(200).json({
      success: true,
      data: {},
      message: "Table deleted successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
