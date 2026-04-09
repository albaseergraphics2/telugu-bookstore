import { NextResponse } from "next/server";
import { connectDB } from "../../../lib/mongodb";
import User from "../../../models/User";

export async function PUT(req) {
  try {
    await connectDB();

    const body = await req.json();

    const { id, phone, address } = body;

    if (!id) {
      return NextResponse.json({ success: false, message: "No ID" });
    }

    const user = await User.findById(id);

    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" });
    }

    user.phone = phone;
    user.address = address;

    await user.save();

    return NextResponse.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        username: user.username,
        role: user.role,
        phone: user.phone || "",
        address: user.address || "",
      }
    });
  } catch (err) {
    console.log("ERROR:", err);
    return NextResponse.json({ success: false });
  }
}