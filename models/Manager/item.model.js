import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
const itemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    hotel_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
    },
    room_ids: [{
      type: mongoose.Schema.Types.ObjectId,
      required: false,
    }],
    description: {
      type: String,
      required: false,
    },
    status: {
      type: String,
      required: false,
      enum: ["Available", "Unavailable"],
      default: "Available",
    },
  },
  { timestamps: true }
);

// Apply the mongoose-paginate-v2 plugin to your schema
itemSchema.plugin(mongoosePaginate);

const Item = mongoose.model("Item", itemSchema);

export default Item;
