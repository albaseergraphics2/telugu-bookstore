import { NextResponse } from "next/server";
import { connectDB } from "../../../lib/mongodb";
import User from "../../../models/User";
import Order from "../../../models/Orders";

export async function GET() {
  try {
    await connectDB();

    const users = await User.find({ role: "user" }).lean();

    const usersWithOrders = await Promise.all(
      users.map(async (user) => {

        const userOrders = await Order.find({ userId: user._id });

        const ordersCount = userOrders.length;

        const totalAmount = userOrders.reduce((total, order) => {
          return total + (order.totalAmount || 0);
        }, 0);

        return {
          _id: user._id,
          name: user.name,
          username: user.username,
          phone: user.phone || "",
          address: user.address || "",
          ordersCount,
          totalAmount,
        };
      })
    );

    return NextResponse.json({
      success: true,
      users: usersWithOrders,
    });

  } catch (err) {
    console.log(err);
    return NextResponse.json({ success: false });
  }
}