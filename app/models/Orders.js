import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema(
  {
    userId: String,

    name: String,

    phone: String,

    address: {
      full: String,
      pincode: String,
      area: String,
      district: String,
      state: String,
    },

    items: [
      {
        bookId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Book",
        },
        qty: Number,
        sellingPrice: Number,
        discount: Number,
      },
    ],
    totalAmount: Number,

    deliveryType: {
      type: String,
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

    paymentMethod: {
      type: String,
      default: "",
    },

    paymentStatus: {
      type: String,
      default: "Pending",
    },

    utrNumber: {
      type: String,
      default: "",
    },

    // ONLINE / OFFLINE
    orderSource: {
      type: String,
      enum: ["online", "offline"],
      default: "online",
    },

    // Who created the order
    orderCreatedBy: {
      type: String,
      enum: ["customer", "admin"],
      default: "customer",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Order ||
  mongoose.model("Order", OrderSchema);