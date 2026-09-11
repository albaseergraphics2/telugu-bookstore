import { NextResponse } from "next/server";
import { connectDB } from "../../lib/mongodb";
import { sendEmail } from "@/app/lib/sendEmail";
import Order from "../../models/Orders";
import Book from "../../models/Books"

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const address =
      typeof body.address === "object" && body.address !== null
        ? body.address
        : {
          full: body.address || "",
        };

    const totalAmount = Number(body.totalAmount || 0);
    const deliveryCharge = Number(body.deliveryCharge || 0);
    const finalTotal = totalAmount + deliveryCharge;
    const lastOrder = await Order.findOne().sort({
      invoiceId: -1,
    });

    let nextInvoiceId = 1001;

    if (lastOrder && lastOrder.invoiceId) {
      nextInvoiceId = Number(lastOrder.invoiceId) + 1;
    }

    const paymentMethod = body.paymentMethod || "";

    let paidAmount = 0;
    let dueAmount = finalTotal;
    let paymentStatus = "Pending";

    if (paymentMethod === "cod") {
      paidAmount = 0;
      dueAmount = finalTotal;
      paymentStatus = "Pending";
    } else if (paymentMethod === "online") {
      paidAmount = finalTotal;
      dueAmount = 0;
      paymentStatus = "Paid";
    } else if (paymentMethod === "bank") {
      paidAmount = finalTotal;
      dueAmount = 0;
      paymentStatus = "Verification Pending";
    }

    const order = await Order.create({
      userId: body.userId,
      name: body.name,
      phone: body.phone,
      address,
      items: body.items || [],
      totalAmount,
      deliveryCharge,
      deliveryType: body.deliveryType || "",
      invoiceId: nextInvoiceId,
      status: "pending",
      paymentMethod,
      utrNumber: body.utrNumber || "",
      paidAmount,
      dueAmount,
      paymentStatus,
      orderSource: "online",
      orderCreatedBy: "customer",
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

        <tr>
          <td><strong>Payment Method</strong></td>
          <td>${body.paymentMethod || ""}</td>
        </tr>

        <tr>
          <td><strong>Payment Status</strong></td>
          <td>${order.paymentStatus}</td>
        </tr>

        ${body.paymentMethod === "bank"
          ? `
        <tr>
          <td><strong>UTR Number</strong></td>
          <td>${body.utrNumber || ""}</td>
        </tr>
        `
          : ""
        }
      </table>

      <hr style="margin:25px 0;">

      <h2 style="color:#0f766e;margin-bottom:15px;">
        👤 Customer Details
      </h2>

      <table width="100%" cellpadding="8">
        <tr>
          <td width="140"><strong>Name</strong></td>
          <td>${body.name || ""}</td>
        </tr>

        <tr>
          <td><strong>Phone</strong></td>
          <td>${body.phone || ""}</td>
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
        ${address.full || ""}<br>
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
          <td><strong>Books Total</strong></td>
          <td align="right">
            ₹${totalAmount}
          </td>
        </tr>

        <tr>
          <td><strong>Delivery Charge</strong></td>
          <td align="right">
            ${deliveryCharge === 0
          ? "Free"
          : `₹${deliveryCharge}`
        }
          </td>
        </tr>

        <tr style="border-top:1px solid #ddd;">
          <td style="padding-top:12px;">
            <strong>Grand Total</strong>
          </td>

          <td align="right" style="padding-top:12px;">
            <span style="
              color:#0f766e;
              font-size:22px;
              font-weight:bold;
            ">
              ₹${finalTotal}
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
      message: "Order placed successfully",
      order,
    }, { status: 201, }
    );
  } catch (error) {
    console.error("CREATE ORDER ERROR:", error);
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500, }
    );
  }
}

export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({
        success: false,
        error: "User ID is required",
      }, { status: 400, }
      );
    }

    const orders = await Order.find({
      userId,
    })
      .populate("items.bookId")
      .sort({ createdAt: -1, });

    return NextResponse.json({
        success: true,
        orders,
      },{status: 200,}
    );
  } catch (error) {
    console.error("GET ORDERS ERROR:", error);

    return NextResponse.json({
        success: false,
        error: error.message,
      },{status: 500,}
    );
  }
}