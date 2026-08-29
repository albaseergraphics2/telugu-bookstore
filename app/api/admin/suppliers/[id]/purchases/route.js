import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/mongodb";
import Supplier from "../../../../../models/Supplier";
import Purchase from "../../../../../models/Purchase";


/* =========================================
   CREATE PURCHASE
========================================= */

export async function POST(request, { params }) {
  try {
    await connectDB();

    const { id } = await params;

    const body = await request.json();

    const {
      purchaseDate,
      invoiceNumber,
      books,
      totalBooks,
      totalAmount,
      totalSellingValue,
      expectedProfit,
      paidAmount,
      balanceAmount,
    } = body;


    /* =========================
       CHECK SUPPLIER
    ========================= */

    const supplier = await Supplier.findById(id);

    if (!supplier) {
      return NextResponse.json(
        {
          success: false,
          message: "Supplier not found.",
        },
        { status: 404 }
      );
    }


    /* =========================
       VALIDATION
    ========================= */

    if (!purchaseDate) {
      return NextResponse.json(
        {
          success: false,
          message: "Purchase date is required.",
        },
        { status: 400 }
      );
    }

    if (!books || books.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "At least one book is required.",
        },
        { status: 400 }
      );
    }


    /* =========================
       CREATE PURCHASE
    ========================= */

    const purchase = await Purchase.create({
      supplier: id,

      purchaseDate,

      invoiceNumber:
        invoiceNumber || "",

      books,

      totalBooks:
        Number(totalBooks) || 0,

      totalAmount:
        Number(totalAmount) || 0,

      totalSellingValue:
        Number(totalSellingValue) || 0,

      expectedProfit:
        Number(expectedProfit) || 0,

      paidAmount:
        Number(paidAmount) || 0,

      balanceAmount:
        Number(balanceAmount) || 0,
    });


    /* =========================
       UPDATE SUPPLIER TOTALS
    ========================= */

    supplier.totalPurchases =
      (Number(supplier.totalPurchases) || 0) +
      (Number(totalAmount) || 0);

    supplier.totalPaid =
      (Number(supplier.totalPaid) || 0) +
      (Number(paidAmount) || 0);

    supplier.totalDue =
      (Number(supplier.totalDue) || 0) +
      (Number(balanceAmount) || 0);

    await supplier.save();


    /* =========================
       RESPONSE
    ========================= */

    return NextResponse.json(
      {
        success: true,
        message: "Purchase created successfully.",
        purchase,
      },
      { status: 201 }
    );

  } catch (error) {

    console.error(
      "CREATE PURCHASE ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error.message ||
          "Failed to create purchase.",
      },
      { status: 500 }
    );
  }
}

export async function GET(request, { params }) {
  try {
    await connectDB();

    const { id } = await params;

    const purchases = await Purchase.find({
      supplier: id,
    })
      .sort({ purchaseDate: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      purchases,
    });

  } catch (error) {
    console.error("GET PURCHASES ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch purchases.",
      },
      { status: 500 }
    );
  }
}