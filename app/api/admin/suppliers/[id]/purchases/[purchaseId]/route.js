import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/mongodb";
import Supplier from "../../../../../../models/Supplier";
import Purchase from "../../../../../../models/Purchase";
import Payment from "../../../../../../models/Payment";

export async function GET(request, { params }) {
    try {
        await connectDB();

        const { id, purchaseId } = await params;

        const purchase = await Purchase.findOne({
            _id: purchaseId,
            supplier: id,
        }).lean();

        if (!purchase) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Purchase not found.",
                },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            purchase,
        });

    } catch (error) {
        console.error(
            "GET PURCHASE DETAILS ERROR:",
            error
        );

        return NextResponse.json(
            {
                success: false,
                message:
                    error.message ||
                    "Failed to fetch purchase.",
            },
            { status: 500 }
        );
    }
}

export async function DELETE(request, { params }) {
    try {
        await connectDB();

        const { id, purchaseId } = await params;

        const purchase = await Purchase.findOne({
            _id: purchaseId,
            supplier: id,
        });

        if (!purchase) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Purchase not found.",
                },
                { status: 404 }
            );
        }

        const supplier = await Supplier.findById(id);

        if (supplier) {
            supplier.totalPurchases =
                (Number(supplier.totalPurchases) || 0) -
                (Number(purchase.totalAmount) || 0);

            supplier.totalPaid =
                (Number(supplier.totalPaid) || 0) -
                (Number(purchase.paidAmount) || 0);

            supplier.totalDue =
                (Number(supplier.totalDue) || 0) -
                (Number(purchase.balanceAmount) || 0);

            await supplier.save();
        }

        // Delete payments belonging to this purchase
        await Payment.deleteMany({
            purchase: purchaseId,
            supplier: id,
        });

        // Delete purchase
        await Purchase.findByIdAndDelete(purchaseId);

        return NextResponse.json({
            success: true,
            message: "Purchase and payment history deleted successfully.",
        });

    } catch (error) {
        console.error("DELETE PURCHASE ERROR:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Failed to delete purchase.",
            },
            { status: 500 }
        );
    }
}