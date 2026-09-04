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