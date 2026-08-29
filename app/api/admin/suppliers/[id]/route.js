import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/mongodb";
import Supplier from "../../../../models/Supplier";

export async function GET(request, { params }) {
  try {
    await connectDB();

    const { id } = await params;

    const supplier = await Supplier.findById(id);

    if (!supplier) {
      return NextResponse.json(
        {
          success: false,
          message: "Supplier not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      supplier,
    });
  } catch (error) {
    console.error("GET SUPPLIER ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch supplier",
      },
      { status: 500 }
    );
  }
}