import { NextResponse } from "next/server";
import { connectDB } from "../../../lib/mongodb";
import User from "../../../models/User";

export async function POST(req) {
  try {
    await connectDB();

    const { email, otp } = await req.json();

    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json({
        success: false,
        message: "User not found",
      });
    }

    if (user.resetOtp !== otp) {
      return NextResponse.json({
        success: false,
        message: "Invalid OTP",
      });
    }

    if (new Date() > user.resetOtpExpire) {
      return NextResponse.json({
        success: false,
        message: "OTP expired",
      });
    }

    return NextResponse.json({
      success: true,
      message: "OTP verified",
    });

  } catch (err) {
    console.error(err);

    return NextResponse.json({
      success: false,
      message: "Something went wrong",
    });
  }
}