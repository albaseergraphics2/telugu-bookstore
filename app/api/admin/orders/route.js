import { NextResponse } from "next/server";
import { connectDB } from "../../../lib/mongodb";
import Order from "../../../models/Orders";
import Book from "../../../models/Books";
import { notifyClients } from "../../../lib/events";

export async function GET() {
  try {
    await connectDB();

    const orders = await Order.find()
      .populate("items.bookId")
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, orders });

  } catch {
    return NextResponse.json({ success: false });
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