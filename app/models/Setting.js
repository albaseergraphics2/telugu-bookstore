import mongoose from "mongoose";

const SettingSchema = new mongoose.Schema(
  {
    // Shipping
    defaultShipping: {
      type: Number,
      default: 100,
    },

    // Bank Details
    accountHolder: {
      type: String,
      default: "",
    },
    bankName: {
      type: String,
      default: "",
    },
    accountNumber: {
      type: String,
      default: "",
    },
    ifscCode: {
      type: String,
      default: "",
    },
    branch: {
      type: String,
      default: "",
    },

    // UPI Accounts
    upiAccounts: [
      {
        upiId: {
          type: String,
          default: "",
        },
        mobile: {
          type: String,
          default: "",
        },
      },
    ],

    // QR Code (Cloudinary URL)
    qrCode: {
      type: String,
      default: "",
    },

    // Contact Numbers
    mobileNumbers: {
      type: [String],
      default: [],
    },

    // Payment Methods
    codEnabled: {
      type: Boolean,
      default: true,
    },
    bankTransferEnabled: {
      type: Boolean,
      default: true,
    },
    onlinePaymentEnabled: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Setting ||
  mongoose.model("Setting", SettingSchema);