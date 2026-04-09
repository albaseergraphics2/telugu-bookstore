import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: String,
  username: { type: String, unique: true },
  email: { type: String, unique: true },
  phone: { type: String, unique: true },
  password: String,

  address: {
    full: String,
    pincode: String,
    area: String,
    district: String,
    state: String
  },

  resetToken: String,
  resetTokenExpiry: Date,

  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
}, { timestamps: true });

export default mongoose.models.User || mongoose.model("User", UserSchema);