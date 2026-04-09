import { NextResponse } from "next/server";
import { connectDB } from "../../../lib/mongodb";
import Order from "../../../models/Orders";
import Book from "../../../models/Books";

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

    const { id, status } = await req.json();

    await Order.findByIdAndUpdate(id, { status });

    return NextResponse.json({ success: true });

  } catch {
    return NextResponse.json({ success: false });
  }
}