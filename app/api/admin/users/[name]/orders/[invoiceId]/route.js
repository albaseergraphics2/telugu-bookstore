import { NextResponse } from "next/server";
import { connectDB } from "../../../../../../lib/mongodb";
import Order from "../../../../../../models/Orders";
import User from "../../../../../../models/User";
import Book from "../../../../../../models/Books";

export async function GET(req, { params }) {
    try {
        await connectDB();

        const { name, invoiceId } = await params;

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
            return NextResponse.json(
                {
                    success: false,
                    message: "Customer not found",
                },
                { status: 404 }
            );
        }

        const invoiceNumber = Number(invoiceId);

        if (!Number.isFinite(invoiceNumber)) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid invoice number",
                },
                { status: 400 }
            );
        }

        void Book;

        const order = await Order.findOne({
            invoiceId: invoiceNumber,
            orderSource: "online",
            userId: customer._id.toString(),
        })
            .populate("items.bookId")
            .lean();

        if (!order) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invoice not found",
                },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            order,
        });
    } catch (error) {
        console.error(
            "FETCH ONLINE INVOICE ERROR:",
            error
        );

        return NextResponse.json(
            {
                success: false,
                message:
                    error.message ||
                    "Failed to fetch invoice",
            },
            { status: 500 }
        );
    }
}