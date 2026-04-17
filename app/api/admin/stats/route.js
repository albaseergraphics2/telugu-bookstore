import { NextResponse } from "next/server";
import { connectDB } from "../../../lib/mongodb";
import User from "../../../models/User";
import Order from "../../../models/Orders";

export async function GET() {
  try {
    await connectDB();

    const users = await User.countDocuments({ role: "user" });
    const orders = await Order.countDocuments();

    const allOrders = await Order.find();

    const revenue = allOrders.reduce((total, order) => {
      return total + (order.totalAmount || 0);
    }, 0);

    const pending = await Order.countDocuments({ status: "Pending" });
    const completed = await Order.countDocuments({ status: "Completed" });

    // today filter
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayOrdersList = await Order.find({
      createdAt: { $gte: today }
    });

    const todayOrders = todayOrdersList.length;

    const todayRevenue = todayOrdersList.reduce((total, order) => {
      return total + (order.totalAmount || 0);
    }, 0);

    const avgOrderValue = orders > 0 ? Math.round(revenue / orders) : 0;

    return NextResponse.json({
      success: true,
      stats: {
        users,
        orders,
        revenue,
        pending,
        completed,
        todayOrders,
        todayRevenue,
        avgOrderValue
      }
    });

  } catch {
    return NextResponse.json({ success: false });
  }
}