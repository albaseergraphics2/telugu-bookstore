import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(req) {
  try {
    const data = await req.formData();
    const file = data.get("file");

    if (!file) {
      return NextResponse.json({ success: false });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const fileName = Date.now() + "-" + file.name;
    const filePath = path.join(process.cwd(), "public/images", fileName);
    fs.writeFileSync(filePath, buffer);
    const url = `/images/${fileName}`;
    return NextResponse.json({ success: true, url });
  } catch (err) {
    console.log(err);
    return NextResponse.json({ success: false });
  }
}