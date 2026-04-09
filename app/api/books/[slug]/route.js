import { NextResponse } from "next/server";
import { connectDB } from "../../../lib/mongodb";
import Book from "../../../models/Books";

export async function GET(req, { params }) {
  try {
    await connectDB();

    const { slug } = await params;

    const book = await Book.findOne({ slug }).lean();

    if (!book) {
      return NextResponse.json({ success: false, message: "Book not found" });
    }

    return NextResponse.json(
      {
        success: true,
        book,
      },
      {
        headers: {
          "Cache-Control": "public, max-age=3600",
        },
      }
    );

  } catch (err) {
    console.log(err);
    return NextResponse.json({ success: false });
  }
}