import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/mongodb";
import Supplier from "../../../../../../models/Supplier";
import Purchase from "../../../../../../models/Purchase";
import Payment from "../../../../../../models/Payment";

export async function GET(request, { params }) {
    try {
        await connectDB();

        const { name, invoiceNumber } = await params;

        const supplierName = decodeURIComponent(name).replace(/-/g, " ");
        const decodedInvoiceNumber = decodeURIComponent(invoiceNumber);

        const supplier = await Supplier.findOne({
            name: supplierName,
        }).lean();

        if (!supplier) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Supplier not found.",
                },
                { status: 404 }
            );
        }

        const purchase = await Purchase.findOne({
            invoiceNumber: decodedInvoiceNumber,
            supplier: supplier._id,
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
        console.error("GET PURCHASE DETAILS ERROR:", error);

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

        const { name, invoiceNumber } = await params;

        const supplierName = decodeURIComponent(name).replace(/-/g, " ");
        const decodedInvoiceNumber = decodeURIComponent(invoiceNumber);

        const supplier = await Supplier.findOne({
            name: supplierName,
        });

        if (!supplier) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Supplier not found.",
                },
                { status: 404 }
            );
        }

        const purchase = await Purchase.findOne({
            invoiceNumber: decodedInvoiceNumber,
            supplier: supplier._id,
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

        await Payment.deleteMany({
            purchase: purchase._id,
            supplier: supplier._id,
        });

        await Purchase.findByIdAndDelete(purchase._id);

        return NextResponse.json({
            success: true,
            message:
                "Purchase and payment history deleted successfully.",
        });
    } catch (error) {
        console.error("DELETE PURCHASE ERROR:", error);

        return NextResponse.json(
            {
                success: false,
                message:
                    error.message ||
                    "Failed to delete purchase.",
            },
            { status: 500 }
        );
    }
}