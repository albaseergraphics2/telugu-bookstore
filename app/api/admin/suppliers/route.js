import { NextResponse } from "next/server";
import { connectDB } from "../../../lib/mongodb";
import Supplier from "../../../models/Supplier";

export async function GET() {
  try {
    await connectDB();

    const suppliers = await Supplier.find({})
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      suppliers,
    });
  } catch (error) {
    console.error("Fetch suppliers error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch suppliers",
      },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();

    if (!body.name?.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Supplier name is required",
        },
        { status: 400 }
      );
    }

    const supplier = await Supplier.create({
      name: body.name.trim(),
      phone: body.phone || "",
      email: body.email || "",

      address: {
        full: body.address?.full || "",
        area: body.address?.area || "",
        district: body.address?.district || "",
        state: body.address?.state || "",
        pincode: body.address?.pincode || "",
      },

      totalPurchases: 0,
      totalPaid: 0,
      totalDue: 0,
    });

    return NextResponse.json({
      success: true,
      supplier,
    });
  } catch (error) {
    console.error("Create supplier error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create supplier",
      },
      { status: 500 }
    );
  }
}