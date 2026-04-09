import { NextResponse } from "next/server";
import { connectDB } from "../../lib/mongodb";
import Book from "../../models/Books";

export async function GET() {
  try {
    await connectDB();

    const books = await Book.find()
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, books });
  } catch (err) {
    console.log(err);
    return NextResponse.json({ success: false });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const book = await Book.create(body);
    return NextResponse.json({ success: true, book });
  } catch (err) {
    console.log(err);
    return NextResponse.json({ success: false });
  }
}

export async function DELETE(req) {
  try {
    await connectDB();
    const { id } = await req.json();
    await Book.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.log(err);
    return NextResponse.json({ success: false });
  }
}

export async function PUT(req) {
  try {
    await connectDB();
    const { id, ...data } = await req.json();
    await Book.findByIdAndUpdate(id, data);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false });
  }
}