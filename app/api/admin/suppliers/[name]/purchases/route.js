import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/mongodb";
import Supplier from "../../../../../models/Supplier";
import Purchase from "../../../../../models/Purchase";

export async function POST(request, { params }) {
  try {
    await connectDB();

    const { name } = await params;
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
      paymentMethod,
    } = body;

    const supplierName = decodeURIComponent(name).replace(/-/g, " ");

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

    let finalInvoiceNumber = String(invoiceNumber || "").trim();

    if (!finalInvoiceNumber) {
      const latestPurchase = await Purchase.findOne({
        invoiceNumber: { $regex: /^INV-\d+$/ },
      })
        .sort({ createdAt: -1 })
        .lean();

      let nextNumber = 1;

      if (latestPurchase?.invoiceNumber) {
        const match = latestPurchase.invoiceNumber.match(/^INV-(\d+)$/);

        if (match) {
          nextNumber = Number(match[1]) + 1;
        }
      }

      finalInvoiceNumber = `INV-${String(nextNumber).padStart(3, "0")}`;
    }

    const formattedBooks = books.map((book) => {
      const supplierRate = Number(book.supplierRate) || 0;
      const sellingPrice = Number(book.sellingPrice) || 0;

      const profitPerBook = Number(
        (sellingPrice - supplierRate).toFixed(2)
      );

      return {
        bookName: String(book.bookName || "").trim(),
        isbn: String(book.isbn || "").trim(),
        quantity: Number(book.quantity) || 0,
        mrp: Number(book.mrp) || 0,
        supplierRate,
        discount: Number(book.discount) || 0,
        purchaseRate: Number(book.purchaseRate) || 0,
        sellingPrice,
        profitPerBook,
      };
    });

    const purchase = await Purchase.create({
      supplier: supplier._id,
      purchaseDate,
      invoiceNumber: finalInvoiceNumber,
      books: formattedBooks,
      totalBooks: Number(totalBooks) || 0,
      totalAmount: Number(totalAmount) || 0,
      totalSellingValue: Number(totalSellingValue) || 0,
      expectedProfit: Number(expectedProfit) || 0,
      paidAmount: Number(paidAmount) || 0,
      paidPaymentMethod: paymentMethod || "Cash",
      balanceAmount: Number(balanceAmount) || 0,
    });

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

    return NextResponse.json(
      {
        success: true,
        message: "Purchase created successfully.",
        purchase,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("CREATE PURCHASE ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to create purchase.",
      },
      { status: 500 }
    );
  }
}

export async function GET(request, { params }) {
  try {
    await connectDB();

    const { name } = await params;

    const supplierName = decodeURIComponent(name).replace(/-/g, " ");

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

    const purchases = await Purchase.find({
      supplier: supplier._id,
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