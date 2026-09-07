import { NextResponse } from "next/server";
import { connectDB } from "../../../../../../lib/mongodb";
import Order from "../../../../../../models/Orders";
import CustomerPayment from "../../../../../../models/CustomerPayment";

export async function POST(req, { params }) {
    try {
        await connectDB();
        const { id } = await params;
        const body = await req.json();
        const amount = Number(body.amount || 0);
        const paymentMethod = String(body.paymentMethod || "Cash").trim();
        const referenceNumber = String(body.referenceNumber || "").trim();
        const notes = String(body.notes || "").trim();

        if (!id) {
            return NextResponse.json({
                success: false,
                message: "Order ID is required.",
            }, { status: 400 }
            );
        }

        if (!Number.isFinite(amount) || amount <= 0) {
            return NextResponse.json({
                success: false,
                message: "Please enter a valid payment amount.",
            }, { status: 400 }
            );
        }

        const allowedPaymentMethods = [
            "Cash",
            "UPI",
            "Bank Transfer",
            "Card",
            "Cheque",
            "Other",
        ];

        if (!allowedPaymentMethods.includes(paymentMethod)) {
            return NextResponse.json({
                success: false,
                message: "Invalid payment method.",
            }, { status: 400 }
            );
        }

        if (
            (paymentMethod === "UPI" || paymentMethod === "Bank Transfer") && !referenceNumber
        ) {
            return NextResponse.json({
                success: false,
                message: "Reference number is required.",
            }, { status: 400 }
            );
        }

        const order = await Order.findById(id);

        if (!order) {
            return NextResponse.json({
                success: false,
                message: "Order not found.",
            }, { status: 404 }
            );
        }

        if (order.orderSource !== "offline") {
            return NextResponse.json({
                success: false,
                message: "Only offline orders can receive payments.",
            }, { status: 400 }
            );
        }

        const totalAmount = Number(order.totalAmount || 0);
        const currentPaidAmount = Number(order.paidAmount || 0);
        const currentDueAmount = Number(
            order.dueAmount ?? totalAmount - currentPaidAmount
        );

        if (currentDueAmount <= 0) {
            return NextResponse.json({
                success: false,
                message: "This order has no due amount.",
            }, { status: 400 }
            );
        }

        if (amount > currentDueAmount) {
            return NextResponse.json({
                success: false,
                message: `Payment cannot be greater than the due amount of ₹${currentDueAmount}.`,
            }, { status: 400 }
            );
        }

        const newPaidAmount = Number((currentPaidAmount + amount).toFixed(2));

        const newDueAmount = Number(
            Math.max(0, totalAmount - newPaidAmount).toFixed(2)
        );

        const newPaymentStatus = newDueAmount === 0 ? "Paid" : "Partial";

        const customerId = order.userId;

        if (!customerId) {
            return NextResponse.json({
                success: false,
                message: "Customer is not linked to this order.",
            }, { status: 400 }
            );
        }

        const customerPayment = await CustomerPayment.create({
            customer: customerId,
            order: order._id,
            paymentDate: new Date(),
            amount,
            paymentMethod,
            referenceNumber,
            notes,
        });

        order.paidAmount = newPaidAmount;
        order.dueAmount = newDueAmount;
        order.paymentStatus = newPaymentStatus;

        if (!Array.isArray(order.paymentHistory)) {
            order.paymentHistory = [];
        }

        order.paymentHistory.push({
            amount,
            paymentMethod,
            utrNumber:
                paymentMethod === "UPI" || paymentMethod === "Bank Transfer"
                    ? referenceNumber : "",
            paidAt: new Date(),
        });

        await order.save();

        const updatedOrder = await Order.findById(order._id)
            .populate("items.bookId")
            .lean();

        return NextResponse.json({
            success: true,
            message: "Payment received successfully.",
            payment: customerPayment,
            order: updatedOrder,
        }, { status: 201 }
        );
    } catch (error) {
        console.error("RECEIVE CUSTOMER PAYMENT ERROR:", error);
        return NextResponse.json({
            success: false,
            message: error.message || "Failed to receive customer payment.",
        }, { status: 500 }
        );
    }
}