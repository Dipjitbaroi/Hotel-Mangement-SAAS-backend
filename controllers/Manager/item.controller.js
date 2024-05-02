import Item from "../../models/Manager/item.model.js";
import Room from "../../models/Manager/room.model.js";
import mongoose from "mongoose";
import User from "../../models/user.model.js";

// Controller to add a new item
export const addItem = async (req, res) => {
  try {
    const { name, description } = req.body;
    const userId = req.user.userId;
    const user = await User.findById(userId);
    const hotel_id =
      user.assignedHotel.length > 0 ? user.assignedHotel[0] : null;

    const newItem = new Item({ hotel_id, name, description });
    const savedItem = await newItem.save();
    res.status(201).json(savedItem);
  } catch (error) {
    res.status(500).json({ message: "Failed to add item" });
  }
};

// Controller to partially update an existing item by its ID using PATCH
export const updateItem = async (req, res) => {
  try {
    const itemId = req.params.item_id; // Assuming you pass the item ID in the URL
    const updateFields = req.body; // Fields to be updated

    // Ensure at least one field is being updated
    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({ message: "No fields to update provided" });
    }

    const updatedItem = await Item.findByIdAndUpdate(
      itemId,
      { $set: updateFields }, // Use $set to update only the provided fields
      { new: true }
    );

    if (!updatedItem) {
      return res.status(404).json({ message: "Item not found" });
    }

    res.status(200).json({ message: "Successfully updated Item" });
  } catch (error) {
    res.status(500).json({ message: "Failed to update item" });
  }
};

// Controller to delete an item by its ID
export const deleteItem = async (req, res) => {
  try {
    const itemId = req.params.item_id; // Assuming you pass the item ID in the URL
    const deletedItem = await Item.findByIdAndRemove(itemId);
    if (!deletedItem) {
      return res.status(404).json({ message: "Item not found" });
    }
    res.status(204).json({ message: "Item deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete item" });
  }
};

// Controller to get all items with filter options and pagination
export const getItemsByHotelId = async (req, res) => {
  try {
    const { page = 1, limit = 10, filter, search } = req.query;
    const userId = req.user.userId;
    const user = await User.findById(userId);
    const hotel_id =
      user.assignedHotel.length > 0 ? user.assignedHotel[0] : null;

    const query = { hotel_id: hotel_id };

    if (["Available", "Unavailable"].includes(filter)) {
      query.status = filter;
    }
    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
    };
    const items = await Item.paginate(query, options);
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve items" });
  }
};
export const getItemById = async (req, res) => {
  try {
    const itemId = req.params.item_id; // Assuming you're passing the item ID as a parameter

    // Check if the provided item ID is valid
    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid item ID",
      });
    }

    // Find the item by ID
    const item = await Item.findById(itemId);

    // Check if the item exists
    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found",
      });
    }

    res.status(200).json({
      success: true,
      data: item,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
export const assignItemsToRoom = async (req, res) => {
  try {
    const { room_id, item_ids } = req.body;

    const existingRoom = await Room.findById(room_id);
    if (!existingRoom) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    const existingItems = await Item.find({ _id: { $in: item_ids } });
    if (existingItems.length !== item_ids.length) {
      return res.status(400).json({
        success: false,
        message: "One or more items are invalid",
      });
    }

    const updateResult = await Item.updateMany(
      { _id: { $in: item_ids } },
      { $push: { room_ids: room_id } }
    );

    if (updateResult.modifiedCount !== item_ids.length) {
      return res.status(500).json({
        success: false,
        message: "Error updating items with room_id",
      });
    }

    res.status(200).json({
      success: true,
      message: "Items assigned to room successfully",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
