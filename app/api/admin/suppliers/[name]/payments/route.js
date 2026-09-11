import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/mongodb";
import Supplier from "../../../../../models/Supplier";
import Payment from "../../../../../models/Payment";

export async function GET(request, { params }) {
    try {
        await connectDB();
        const { name } = await params;
        const supplier = await Supplier.findOne({
            name: decodeURIComponent(name),
        }).lean();

        if (!supplier) {
            return NextResponse.json({
                    success: false,
                    message: "Supplier not found.",
                },{ status: 404 }
            );
        }

        const payments = await Payment.find({
            supplierId: supplier._id,
        })
            .sort({ paymentDate: -1 })
            .lean();

        return NextResponse.json({
            success: true,
            payments,
        });
    } catch (error) {
        console.error("GET SUPPLIER PAYMENTS ERROR:", error);
        return NextResponse.json({
                success: false,
                message: "Failed to fetch supplier payments.",
            },{ status: 500 }
        );
    }
}