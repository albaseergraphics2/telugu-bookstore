import { NextResponse } from "next/server";
// import crypto from "crypto";
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

    // // 🔐 create token
    // const token = crypto.randomBytes(32).toString("hex");

    // user.resetToken = token;
    // user.resetTokenExpiry = Date.now() + 10 * 60 * 1000;

    // await user.save();

    // const resetLink = `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password/${token}`;

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.resetOtp = otp;
    user.resetOtpExpire = new Date(Date.now() + 5 * 60 * 1000);

    await user.save();

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
<div style="margin:0;padding:15px;background:#f5f7f9;font-family:Arial,sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center">

        <table width="100%" cellpadding="0" cellspacing="0"
          style="max-width:500px;background:#ffffff;border-radius:10px;overflow:hidden;border:1px solid #e5e5e5;">

          <!-- Header -->
          <tr>
            <td
              style="background:#0a5c36;padding:22px;text-align:center;color:#fff;">
              <h2 style="margin:0;font-size:26px;">
                Telugu Bookstore
              </h2>

              <p style="margin:8px 0 0;font-size:14px;color:#d8efe4;">
                Password Reset Verification
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:30px;">

              <p style="font-size:15px;color:#555;line-height:24px;">
                Use the OTP below to reset your password.
              </p>

              <!-- OTP -->
              <div
                style="
                margin:30px 0;
                text-align:center;
              ">

                <span
                  style="
                  display:inline-block;
                  background:#f3f8f5;
                  color:#0a5c36;
                  border:2px dashed #0a5c36;
                  border-radius:8px;
                  padding:16px 32px;
                  font-size:34px;
                  font-weight:bold;
                  letter-spacing:8px;
                ">
                  ${otp}
                </span>

              </div>

              <p
                style="
                text-align:center;
                color:#777;
                font-size:14px;
              ">
                OTP valid for <b>5 minutes</b>.
              </p>

              <hr
                style="
                margin:25px 0;
                border:none;
                border-top:1px solid #eee;
              ">

              <p
                style="
                color:#666;
                font-size:14px;
                line-height:22px;
              ">
                If you didn't request a password reset, simply ignore this email.
                Your account remains secure.
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td
              style="
              background:#fafafa;
              padding:18px;
              text-align:center;
              color:#999;
              font-size:12px;
            ">
              © 2026 Telugu Bookstore. All rights reserved.
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

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