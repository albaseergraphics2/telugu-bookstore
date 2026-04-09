export const uploadToCloudinary = async (file) => {
  const fd = new FormData();

  fd.append("file", file);
  fd.append(
    "upload_preset",
    process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
  );

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
    {
      method: "POST",
      body: fd,
    }
  );

  const data = await res.json();

  if (!res.ok) {
    console.error(data);
    throw new Error(data.error?.message || "Upload failed");
  }

  // ✅ Optimized URL (auto format + quality)
  return data.secure_url.replace(
    "/upload/",
    "/upload/f_auto,q_auto/"
  );
};