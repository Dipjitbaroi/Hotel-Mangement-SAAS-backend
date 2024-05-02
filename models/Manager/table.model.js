import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
const tableSchema = new mongoose.Schema(
  {
    hotel_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    table_number: {
      type: String,
      required: true,
    },
    capacity: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: false,
      enum: ["Available", "Booked"],
      default: "Available",
    },
  },
  { timestamps: true }
);
// Apply the mongoose-paginate-v2 plugin to your schema
tableSchema.plugin(mongoosePaginate);
const Table = mongoose.model("Table", tableSchema);

export default Table;
