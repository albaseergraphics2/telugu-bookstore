import mongoose from "mongoose";

const CustomerPaymentSchema = new mongoose.Schema(
    {
        customer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        order: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Order",
            required: true,
        },

        paymentDate: {
            type: Date,
            required: true,
            default: Date.now,
        },

        amount: {
            type: Number,
            required: true,
            min: 0,
        },

        paymentMethod: {
            type: String,
            enum: [
                "Cash",
                "UPI",
                "Bank Transfer",
                "Card",
                "Cheque",
                "Other",
            ],
            default: "Cash",
        },

        referenceNumber: {
            type: String,
            default: "",
            trim: true,
        },

        notes: {
            type: String,
            default: "",
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.models.CustomerPayment ||
    mongoose.model("CustomerPayment", CustomerPaymentSchema);