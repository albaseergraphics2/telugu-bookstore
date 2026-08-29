import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/mongodb";
import Payment from "../../../../../models/Payment";

export async function GET(request, { params }) {
    try {
        await connectDB();

        const { id } = await params;

        const payments = await Payment.find({
            supplier: id,
        })
            .sort({ paymentDate: -1 })
            .lean();

        return NextResponse.json({
            success: true,
            payments,
        });

    } catch (error) {
        console.error("GET SUPPLIER PAYMENTS ERROR:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Failed to fetch supplier payments.",
            },
            { status: 500 }
        );
    }
}