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

    totalAmount: {
      type: Number,
      default: 0,
    },

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
      enum: ["Paid", "Pending", "Partial"],
      default: "Pending",
    },

    utrNumber: {
      type: String,
      default: "",
    },

    paidAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    dueAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    paymentHistory: [
      {
        amount: {
          type: Number,
          required: true,
          min: 0,
        },

        paymentMethod: {
          type: String,
          required: true,
        },

        utrNumber: {
          type: String,
          default: "",
        },

        paidAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    orderSource: {
      type: String,
      enum: ["online", "offline"],
      default: "online",
    },

    orderCreatedBy: {
      type: String,
      enum: ["customer", "admin"],
      default: "customer",
    },
  },
  { timestamps: true, }
);

export default mongoose.models.Order ||
  mongoose.model("Order", OrderSchema);