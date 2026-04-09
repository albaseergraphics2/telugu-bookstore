import { NextResponse } from "next/server";
import { connectDB } from "../../lib/mongodb";
import Order from "../../models/Orders";
import Book from "../../models/Books"; // ✅ IMPORTANT (for populate)

// ✅ CREATE ORDER
export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();

    // ✅ SAFETY: ensure address always object
    const address =
      typeof body.address === "object"
        ? body.address
        : { full: body.address || "" };

    // 🔥 Generate invoice ID
    const lastOrder = await Order.findOne().sort({ invoiceId: -1 });

    let nextInvoiceId = 1001;

    if (lastOrder && lastOrder.invoiceId) {
      nextInvoiceId = lastOrder.invoiceId + 1;
    }

    const order = await Order.create({
      ...body,
      address, // ✅ fixed
      invoiceId: nextInvoiceId,
      status: "pending",
    });

    return NextResponse.json({ success: true, order });

  } catch (error) {
    return NextResponse.json({ success: false, error: error.message });
  }
}

// ✅ GET USER ORDERS
export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    const orders = await Order.find({ userId })
      .populate("items.bookId") // ✅ works now
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, orders });

  } catch (error) {
    return NextResponse.json({ success: false, error: error.message });
  }
}