import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema({
  userId: String,
  name: String,
  phone: String,

  address: {
    full: String,
    pincode: String,
    area: String,
    district: String,
    state: String
  },

  items: [
    {
      bookId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Book"
      },
      qty: Number
    }
  ],

  totalAmount: Number,

  // ✅ NEW DELIVERY FIELDS
  deliveryType: {
    type: String,
    default: "Not Selected",
  },

  deliveryCharge: {
    type: Number,
    default: 0,
  },

  status: {
    type: String,
    default: "pending",
  },

  invoiceId: {
    type: Number,
    unique: true,
  },

}, { timestamps: true });

export default mongoose.models.Order || mongoose.model("Order", OrderSchema);