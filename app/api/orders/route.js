import { NextResponse } from "next/server";
import { connectDB } from "../../lib/mongodb";
import Order from "../../models/Orders";
import Book from "../../models/Books";
import { sendEmail } from "@/app/lib/sendEmail";

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();

    const address =
      typeof body.address === "object"
        ? body.address
        : { full: body.address || "" };


    const lastOrder = await Order.findOne().sort({ invoiceId: -1 });

    let nextInvoiceId = 1001;

    if (lastOrder && lastOrder.invoiceId) {
      nextInvoiceId = lastOrder.invoiceId + 1;
    }

    const order = await Order.create({
      ...body,
      address,
      invoiceId: nextInvoiceId,
      status: "pending",
    });

    await sendEmail({
      to: process.env.ADMIN_EMAIL,
      subject: `New Book Order #${order.invoiceId}`,
      html: `
<div style="max-width:700px;margin:auto;font-family:Arial,sans-serif;background:#f5f5f5;padding:25px;">

  <div style="background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #ddd;">

    <div style="background:#0f766e;color:#fff;padding:20px;text-align:center;">
      <h1 style="margin:0;">📚 Telugu Bookstore</h1>
      <p style="margin:8px 0 0;">New Order Received</p>
    </div>

    <div style="padding:25px;">

      <table width="100%" cellpadding="8" style="border-collapse:collapse;">
        <tr>
          <td><strong>Invoice ID</strong></td>
          <td>#${order.invoiceId}</td>
        </tr>

        <tr>
          <td><strong>Order Date</strong></td>
          <td>${new Date().toLocaleString()}</td>
        </tr>

        <tr>
          <td><strong>Status</strong></td>
          <td>
            <span style="
              background:#fff3cd;
              color:#856404;
              padding:6px 12px;
              border-radius:20px;
              font-size:13px;
            ">
              Pending
            </span>
          </td>
        </tr>
      </table>

      <hr style="margin:25px 0;">

      <h2 style="color:#0f766e;margin-bottom:15px;">
        👤 Customer Details
      </h2>

      <table width="100%" cellpadding="8">

        <tr>
          <td width="140"><strong>Name</strong></td>
          <td>${body.name}</td>
        </tr>

        <tr>
          <td><strong>Phone</strong></td>
          <td>${body.phone}</td>
        </tr>

      </table>

      <hr style="margin:25px 0;">

      <h2 style="color:#0f766e;margin-bottom:15px;">
        📍 Delivery Address
      </h2>

      <div style="
        background:#fafafa;
        border-left:4px solid #0f766e;
        padding:18px;
        border-radius:8px;
        line-height:1.8;
      ">

        ${address.full}<br>
        ${address.area || ""}<br>
        ${address.district || ""}<br>
        ${address.state || ""}<br>
        ${address.pincode || ""}

      </div>

      <hr style="margin:25px 0;">

      <table width="100%" cellpadding="10" style="
        background:#f8fafc;
        border-radius:8px;
      ">

        <tr>
          <td><strong>Total Amount</strong></td>
          <td align="right">
            <span style="
              color:#0f766e;
              font-size:22px;
              font-weight:bold;
            ">
              ₹${body.totalAmount}
            </span>
          </td>
        </tr>

      </table>

    </div>

    <div style="
      background:#f1f5f9;
      text-align:center;
      padding:15px;
      color:#666;
      font-size:13px;
    ">
      © ${new Date().getFullYear()} Telugu Bookstore
    </div>

  </div>

</div>
`,
    });

    return NextResponse.json({
      success: true,
      order,
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message });
  }
}

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