import { NextResponse } from "next/server";
import { connectDB } from "../../../lib/mongodb";
import Order from "../../../models/Orders";
import Book from "../../../models/Books";
import { notifyClients } from "../../../lib/events";

export async function GET() {
    try {
        await connectDB();
        const orders = await Order.find({ orderSource: "online", })
            .populate("items.bookId")
            .sort({ createdAt: -1 });
        return NextResponse.json({ success: true, orders, });
    } catch (error) {
        console.error("GET ORDERS ERROR:", error);
        return NextResponse.json({
            success: false,
            message: "Failed to fetch orders.",
            error: error.message,
        }, { status: 500 }
        );
    }
}

export async function PUT(req) {
    try {
        await connectDB();
        const { id, status, deliveryType, deliveryCharge } = await req.json();
        await Order.findByIdAndUpdate(id, {
            status,
            deliveryType,
            deliveryCharge,
        });
        notifyClients({});
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ success: false });
    }
}

export async function POST(req) {
    try {
        await connectDB();
        const {
            userId,
            name,
            phone,
            address,
            paymentMethod,
            utrNumber,
            items,
            totalAmount,
            deliveryCharge,
        } = await req.json();

        if (
            !userId ||
            !name ||
            !phone ||
            !address ||
            !items ||
            items.length === 0
        ) {
            return NextResponse.json({
                    success: false,
                    message: "Missing required order details.",
                },{ status: 400 }
            );
        }

        if (paymentMethod === "bank" && !utrNumber?.trim()) {
            return NextResponse.json({
                    success: false,
                    message: "UTR / Transaction ID is required.",
                },{ status: 400 }
            );
        }

        const orderItems = [];

        for (const item of items) {
            const book = await Book.findOne({
                $or: [
                    { _id: item.bookId },
                    { slug: item.bookId },
                ],
            });

            if (!book) {
                return NextResponse.json({
                        success: false,
                        message: `Book not found: ${item.bookId}`,
                    },{ status: 404 }
                );
            }

            orderItems.push({
                bookId: book._id,
                qty: Number(item.qty),
            });
        }

        const subtotal = Number(totalAmount || 0);
        const finalDeliveryCharge = Number(deliveryCharge || 0);
        const finalTotalAmount = subtotal + finalDeliveryCharge;

        const order = await Order.create({
            userId,
            name,
            phone,
            address,
            paymentMethod,
            paymentStatus:
                paymentMethod === "bank"
                    ? "Verification Pending"
                    : paymentMethod === "online"
                        ? "Paid"
                        : "Pending",
            utrNumber:
                paymentMethod === "bank"
                    ? utrNumber
                    : "",
            items: orderItems,
            totalAmount: finalTotalAmount,
            deliveryCharge: finalDeliveryCharge,
            orderSource: "online",
            status: "pending",
        });

        notifyClients({});

        return NextResponse.json({
                success: true,
                message: "Order placed successfully.",
                order,
            },{ status: 201 }
        );
    } catch (error) {
        console.error("CREATE ORDER ERROR:", error);
        return NextResponse.json({
                success: false,
                message: error.message ||"Failed to create order.",
            },{ status: 500 }
        );
    }
}