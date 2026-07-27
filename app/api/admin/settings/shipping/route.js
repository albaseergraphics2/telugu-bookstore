import { NextResponse } from "next/server";
import { connectDB } from "../../../../lib/mongodb";
import Setting from "../../../../models/Setting";

export async function GET() {
  try {
    await connectDB();

    let setting = await Setting.findOne();

    if (!setting) {
      setting = await Setting.create({
        defaultShipping: 100,
      });
    }

    return NextResponse.json({
      success: true,
      defaultShipping: setting.defaultShipping,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: error.message,
    });
  }
}

export async function POST(req) {
  try {
    await connectDB();

    const { defaultShipping } = await req.json();

    let setting = await Setting.findOne();

    if (!setting) {
      setting = new Setting();
    }

    setting.defaultShipping = defaultShipping;

    await setting.save();

    return NextResponse.json({
      success: true,
      message: "Shipping charge updated",
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: error.message,
    });
  }
}