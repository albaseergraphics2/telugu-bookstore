import { NextResponse } from "next/server";
import crypto from "crypto";
import nodemailer from "nodemailer";
import { connectDB } from "../../../lib/mongodb";
import User from "../../../models/User";

export async function POST(req) {
  try {
    await connectDB();

    const { email } = await req.json();

    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json({
        success: false,
        message: "User not found",
      });
    }

    // 🔐 create token
    const token = crypto.randomBytes(32).toString("hex");

    user.resetToken = token;
    user.resetTokenExpiry = Date.now() + 10 * 60 * 1000;

    await user.save();

    const resetLink = `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password/${token}`;

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // 📧 SEND EMAIL
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Reset Password",
      html: `
  <div style="font-family: Arial, sans-serif; background:#f5f5f5; padding:20px;">
    
    <div style="max-width:500px; margin:auto; background:#ffffff; padding:25px; border-radius:10px; box-shadow:0 4px 10px rgba(0,0,0,0.1);">
      
      <h2 style="text-align:center; color:#333;">🔐 Reset Your Password</h2>
      
      <p style="color:#555; font-size:15px;">
        We received a request to reset your password. Click the button below to continue.
      </p>

      <div style="text-align:center; margin:25px 0;">
        <a href="${resetLink}" 
          style="
            background:#0070f3;
            color:#fff;
            padding:12px 20px;
            text-decoration:none;
            border-radius:6px;
            font-weight:bold;
            display:inline-block;
          ">
          Reset Password
        </a>
      </div>

      <p style="font-size:14px; color:#777;">
        This link will expire in <b>10 minutes</b>.
      </p>

      <hr style="margin:20px 0; border:none; border-top:1px solid #eee;" />

      <p style="font-size:12px; color:#999;">
        If you did not request this, you can safely ignore this email.
      </p>

      <p style="font-size:12px; color:#aaa; text-align:center;">
        © 2026 Telugu Bookstore
      </p>

    </div>

  </div>
`
    });

    return NextResponse.json({
      success: true,
      message: "Reset link sent to email ✅",
    });

  } catch (err) {
    console.error("FORGOT PASSWORD ERROR:", err);

    return NextResponse.json({
      success: false,
      message: "Email failed ❌",
    });
  }
}