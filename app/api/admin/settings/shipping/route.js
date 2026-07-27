import { NextResponse } from "next/server";
import { connectDB } from "../../../../lib/mongodb";
import Setting from "../../../../models/Setting";

// GET Settings
export async function GET() {
  try {
    await connectDB();

    let setting = await Setting.findOne();

    if (!setting) {
      setting = await Setting.create({
        defaultShipping: 100,
        accountHolder: "",
        bankName: "",
        accountNumber: "",
        ifscCode: "",
        branch: "",
        qrCode: "",
        mobileNumbers: [""],
        upiAccounts: [
          {
            upiId: "",
            mobile: "",
          },
        ],
        codEnabled: true,
        bankTransferEnabled: true,
        onlinePaymentEnabled: false,
      });
    }

    return NextResponse.json({
      success: true,
      setting,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      { status: 500 }
    );
  }
}

// Save / Update Settings
export async function POST(req) {
  try {
    await connectDB();

    const body = await req.json();

    const setting = await Setting.findOneAndUpdate(
      {},
      {
        $set: body,
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      }
    );

    return NextResponse.json({
      success: true,
      message: "Settings updated successfully",
      setting,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      { status: 500 }
    );
  }
}