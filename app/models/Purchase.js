import mongoose from "mongoose";

const PurchaseBookSchema = new mongoose.Schema(
  {
    bookName: {
      type: String,
      required: true,
      trim: true,
    },

    isbn: {
      type: String,
      default: "",
      trim: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    mrp: {
      type: Number,
      default: 0,
    },

    supplierRate: {
      type: Number,
      default: 0,
    },

    discount: {
      type: Number,
      default: 0,
    },

    purchaseRate: {
      type: Number,
      required: true,
      default: 0,
    },

    sellingPrice: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  {
    _id: true,
  }
);


const PurchaseSchema = new mongoose.Schema(
  {
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
      required: true,
    },

    purchaseDate: {
      type: Date,
      required: true,
    },

    invoiceNumber: {
      type: String,
      default: "",
      trim: true,
    },

    books: {
      type: [PurchaseBookSchema],
      required: true,
    },

    totalBooks: {
      type: Number,
      default: 0,
    },

    totalAmount: {
      type: Number,
      default: 0,
    },

    totalSellingValue: {
      type: Number,
      default: 0,
    },

    expectedProfit: {
      type: Number,
      default: 0,
    },

    paidAmount: {
      type: Number,
      default: 0,
    },

    balanceAmount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);


export default mongoose.models.Purchase ||
  mongoose.model("Purchase", PurchaseSchema);