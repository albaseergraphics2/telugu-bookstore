import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },

    name: {
      type: String,
      required: true,
    },

    phone: {
      type: String,
      required: true,
    },

    address: {
      full: {
        type: String,
        default: "",
      },
      pincode: {
        type: String,
        default: "",
      },
      area: {
        type: String,
        default: "",
      },
      district: {
        type: String,
        default: "",
      },
      state: {
        type: String,
        default: "",
      },
    },

    items: [
      {
        bookId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Book",
          required: true,
        },

        qty: {
          type: Number,
          required: true,
          min: 1,
        },

        sellingPrice: {
          type: Number,
          default: 0,
        },

        discount: {
          type: Number,
          default: 0,
        },
      },
    ],

    // Books total without delivery charge
    totalAmount: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },

    deliveryType: {
      type: String,
      default: "",
    },

    // Delivery charge
    deliveryCharge: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },

    status: {
      type: String,
      default: "pending",
    },

    invoiceId: {
      type: Number,
      unique: true,
      required: true,
    },

    paymentMethod: {
      type: String,
      default: "",
    },

    paymentStatus: {
      type: String,
      enum: ["Paid", "Pending", "Partial", "Verification Pending"],
      default: "Pending",
    },

    utrNumber: {
      type: String,
      default: "",
    },

    // Amount already paid
    paidAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Remaining amount
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
  {
    timestamps: true,
  }
);

export default mongoose.models.Order ||
  mongoose.model("Order", OrderSchema);