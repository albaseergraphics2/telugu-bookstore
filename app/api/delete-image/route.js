import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req) {
  const { url } = await req.json();

  try {
    // ✅ extract public_id correctly (with folder support)
    const parts = url.split("/");
    const fileWithVersion = parts.slice(-2).join("/"); 
    const public_id = fileWithVersion
      .replace("upload/", "")
      .replace(/\.[^/.]+$/, "");

    await cloudinary.uploader.destroy(public_id);

    return Response.json({ success: true });

  } catch (err) {
    return Response.json({ success: false, error: err.message });
  }
}