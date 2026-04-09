import { NextResponse } from "next/server";
import { connectDB } from "../../../lib/mongodb";
import Order from "../../../models/Orders";
import Book from "../../../models/Books";

export async function GET(req, { params }) {
  await connectDB();

  const { id } = await params;

  const order = await Order.findById(id)
    .populate("items.bookId");

  if (!order) {
    return NextResponse.json({
      success: false,
      message: "Order not found",
    });
  }

  return NextResponse.json({
    success: true,
    order,
  });
}