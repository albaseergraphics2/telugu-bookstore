import { NextResponse } from "next/server";
import { connectDB } from "../../../../../../lib/mongodb";
import Order from "../../../../../../models/Orders";
import User from "../../../../../../models/User";
import Book from "../../../../../../models/Books";

export async function GET(req, { params }) {
    try {
        await connectDB();
        const { name } = await params;
        const customerName = decodeURIComponent(name)
            .replace(/-/g, " ")
            .trim();
        const customer = await User.findOne({
            name: {
                $regex: `^${customerName}$`,
                $options: "i",
            },
        }).lean();

        if (!customer) {
            return NextResponse.json({
                    success: false,
                    message: "Customer not found",
                },{status: 404,}
            );
        }

        void Book;
        const orders = await Order.find({
            orderSource: "offline",
            userId: customer._id,
        }).populate("items.bookId")
            .sort({createdAt: -1,})
            .lean();

        return NextResponse.json({
            success: true,
            customer,
            orders,
        });
    } catch (error) {
        console.error("FETCH OFFLINE CUSTOMER ORDERS ERROR:",error);
        return NextResponse.json({
                success: false,
                message:error.message ||"Failed to fetch customer orders",},
            {status: 500,}
        );
    }
}