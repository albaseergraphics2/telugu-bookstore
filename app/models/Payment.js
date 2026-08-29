import mongoose from "mongoose";

const PaymentSchema = new mongoose.Schema(
    {
        supplier: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Supplier",
            required: true,
        },

        purchase: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Purchase",
            required: true,
        },

        paymentDate: {
            type: Date,
            required: true,
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

export default mongoose.models.Payment ||
    mongoose.model("Payment", PaymentSchema);