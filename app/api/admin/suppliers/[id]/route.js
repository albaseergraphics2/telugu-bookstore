import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/mongodb";
import Supplier from "../../../../models/Supplier";

export async function GET(request, { params }) {
  try {
    await connectDB();

    const { id } = await params;

    const supplier = await Supplier.findById(id);

    if (!supplier) {
      return NextResponse.json({
        success: false,
        message: "Supplier not found",
      }, { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      supplier,
    });
  } catch (error) {
    console.error("GET SUPPLIER ERROR:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to fetch supplier",
      error: error.message,
    }, { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await request.json();

    const {
      name,
      companyName,
      supplierType,
      phone,
      alternatePhone,
      email,
      gstNumber,
      address,
    } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({
        success: false,
        message: "Supplier name is required",
      }, { status: 400 }
      );
    }

    const supplier = await Supplier.findById(id);

    if (!supplier) {
      return NextResponse.json({
        success: false,
        message: "Supplier not found",
      }, { status: 404 }
      );
    }

    supplier.name = name.trim();
    supplier.companyName = companyName?.trim() || "";
    supplier.supplierType = supplierType?.trim() || "";
    supplier.phone = phone?.trim() || "";
    supplier.alternatePhone = alternatePhone?.trim() || "";
    supplier.email = email?.trim() || "";
    supplier.gstNumber = gstNumber?.trim() || "";
    supplier.address = {
      full: address?.full?.trim() || "",
      area: address?.area?.trim() || "",
      district: address?.district?.trim() || "",
      state: address?.state?.trim() || "",
      pincode: address?.pincode?.trim() || "",
    };

    const updatedSupplier = await supplier.save();

    return NextResponse.json({
      success: true,
      message: "Supplier updated successfully",
      supplier: updatedSupplier,
    });
  } catch (error) {
    console.error("UPDATE SUPPLIER ERROR:", error);

    return NextResponse.json({
      success: false,
      message: "Failed to update supplier",
      error: error.message,
    }, { status: 500 }
    );
  }
}