import { NextResponse } from "next/server";
import { connectDB } from "../../../../../../lib/mongodb";
import Order from "../../../../../../models/Orders";
import User from "../../../../../../models/User";

export async function GET(req, { params }) {
    try {
        await connectDB();

        const { id } = await params;

        const customer = await User.findOne({
            phone: id,
        }).lean();

        if (!customer) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Customer not found",
                },
                {
                    status: 404,
                }
            );
        }

        const orders = await Order.find({
            orderSource: "offline",
            userId: customer._id,
        })
            .populate("items.bookId")
            .sort({
                createdAt: -1,
            })
            .lean();

        return NextResponse.json({
            success: true,
            customer,
            orders,
        });
    } catch (error) {
        console.error(
            "FETCH OFFLINE CUSTOMER ORDERS ERROR:",
            error
        );

        return NextResponse.json(
            {
                success: false,
                message:
                    error.message ||
                    "Failed to fetch customer orders",
            },
            {
                status: 500,
            }
        );
    }
}