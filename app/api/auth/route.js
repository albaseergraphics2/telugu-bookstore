import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { connectDB } from "../../lib/mongodb";
import User from "../../models/User";

const JWT_SECRET = process.env.JWT_SECRET;

export async function POST(req) {
  try {
    await connectDB();

    const body = await req.json();
    const { type, name, username, phone, email, password, loginId } = body;

    if (type === "register") {
      const existingUser = await User.findOne({
        $or: [
          { username },
          { phone },
          { email }
        ]
      });

      if (existingUser) {
        return NextResponse.json({
          success: false,
          message: "Username, phone or email already exists",
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await User.create({
        name,
        username,
        phone,
        email,
        password: hashedPassword,
        role: "user",
        address: "",
      });

      const token = jwt.sign(
        { id: user._id, role: user.role },
        JWT_SECRET,
        { expiresIn: "2h" }
      );

      const res = NextResponse.json({
        success: true,
        user: {
          _id: user._id,
          name: user.name,
          username: user.username,
          email: user.email,
          phone: user.phone,
          role: user.role,
          address: user.address || "",
        },
      });

      res.cookies.set("token", token, {
        httpOnly: true,
        secure: false,
        path: "/",
      });

      return res;
    }

    if (type === "login") {

      const user = await User.findOne({
        $or: [
          { username: loginId },
          { phone: loginId },
          { email: loginId }
        ]
      });

      if (!user) {
        return NextResponse.json({
          success: false,
          message: "User not found",
        });
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return NextResponse.json({
          success: false,
          message: "Wrong password",
        });
      }

      const token = jwt.sign(
        { id: user._id, role: user.role },
        JWT_SECRET,
        { expiresIn: "2h" }
      );

      const res = NextResponse.json({
        success: true,
        user: {
          _id: user._id,
          name: user.name,
          username: user.username,
          email: user.email,
          phone: user.phone,
          role: user.role,
          address: user.address || "",
        },
      });

      res.cookies.set("token", token, {
        httpOnly: true,
        secure: false,
        path: "/",
      });
      return res;
    }
    return NextResponse.json({ success: false });
  } catch (err) {
    return NextResponse.json({
      success: false,
      message: err.message,
    });
  }
}