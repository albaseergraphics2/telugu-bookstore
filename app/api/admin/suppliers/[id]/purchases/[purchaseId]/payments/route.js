import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/mongodb";

import Supplier from "@/app/models/Supplier";
import Purchase from "@/app/models/Purchase";
import Payment from "@/app/models/Payment";

export async function GET(request, { params }) {
    try {
        await connectDB();

        const { id, purchaseId } = await params;

        const payments = await Payment.find({
            supplier: id,
            purchase: purchaseId,
        })
            .sort({ paymentDate: -1 })
            .lean();

        return NextResponse.json({
            success: true,
            payments,
        });

    } catch (error) {
        console.error("GET PAYMENTS ERROR:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Failed to fetch payments.",
            },
            { status: 500 }
        );
    }
}


export async function POST(request, { params }) {
    try {
        await connectDB();

        const { id, purchaseId } = await params;

        const body = await request.json();

        const {
            paymentDate,
            amount,
            paymentMethod,
            referenceNumber,
            notes,
        } = body;

        const supplier = await Supplier.findById(id);

        if (!supplier) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Supplier not found.",
                },
                { status: 404 }
            );
        }

        const purchase = await Purchase.findOne({
            _id: purchaseId,
            supplier: id,
        });

        if (!purchase) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Purchase not found.",
                },
                { status: 404 }
            );
        }

        if (!paymentDate) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Payment date is required.",
                },
                { status: 400 }
            );
        }

        const paymentAmount = Number(amount);

        if (!paymentAmount || paymentAmount <= 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Enter a valid payment amount.",
                },
                { status: 400 }
            );
        }

        const currentBalance =
            Number(purchase.balanceAmount) || 0;

        if (paymentAmount > currentBalance) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        `Payment cannot be greater than balance amount ₹${currentBalance}.`,
                },
                { status: 400 }
            );
        }

        const payment = await Payment.create({
            supplier: id,
            purchase: purchaseId,
            paymentDate,
            amount: paymentAmount,
            paymentMethod:
                paymentMethod || "Cash",
            referenceNumber:
                referenceNumber || "",
            notes:
                notes || "",
        });

        purchase.paidAmount =
            (Number(purchase.paidAmount) || 0) +
            paymentAmount;

        purchase.balanceAmount =
            Math.max(
                0,
                currentBalance - paymentAmount
            );

        await purchase.save();

        supplier.totalPaid =
            (Number(supplier.totalPaid) || 0) +
            paymentAmount;

        supplier.totalDue =
            Math.max(
                0,
                (Number(supplier.totalDue) || 0) -
                paymentAmount
            );

        await supplier.save();

        return NextResponse.json(
            {
                success: true,
                message: "Payment added successfully.",
                payment,
                purchase,
            },
            { status: 201 }
        );

    } catch (error) {
        console.error("CREATE PAYMENT ERROR:", error);

        return NextResponse.json(
            {
                success: false,
                message:
                    error.message ||
                    "Failed to create payment.",
            },
            { status: 500 }
        );
    }
}