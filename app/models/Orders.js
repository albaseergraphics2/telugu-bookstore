import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema({
  userId: String,
  name: String,
  phone: String,

  // ✅ STRUCTURED ADDRESS
  address: {
    full: String,
    pincode: String,
    area: String,
    district: String,
    state: String
  },

  // ✅ ITEMS WITH REFERENCE
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