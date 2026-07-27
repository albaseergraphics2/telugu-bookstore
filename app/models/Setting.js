import mongoose from "mongoose";

const SettingSchema = new mongoose.Schema(
  {
    defaultShipping: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Setting ||
  mongoose.model("Setting", SettingSchema);