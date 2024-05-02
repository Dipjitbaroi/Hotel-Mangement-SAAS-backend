import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
const statuslogSchema = new mongoose.Schema(
  {
    changed_from: {
      type: String,
      required: false,
    },
    changed_for: {
      type: String,
      required: false,
    },
    extended_time: {
      type: Object,
      required: false,
      default: null,
    },
    pre_status: {
      type: String,
      required: false,
      enum: ["Active", "Deactive", "Suspended", "Expired", "Deleted"],
    },
    updated_status: {
      type: String,
      required: false,
      enum: ["Active", "Deactive", "Suspended", "Expired", "Deleted"],
    },
    remark: {
      type: String,
      required: false,
    },
  },
  { timestamps: true }
);

statuslogSchema.plugin(mongoosePaginate);

const StatusLog = mongoose.model("StatusLog", statuslogSchema);

export default StatusLog;
