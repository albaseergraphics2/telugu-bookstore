import {connectDB} from "../../lib/mongodb";
import HeroCarousel from "../../models/HeroCarousel";

export async function GET() {
  await connectDB();

  let data = await HeroCarousel.findOne();

  if (!data) {
    data = await HeroCarousel.create({ images: [] });
  }

  return Response.json({
    success: true,
    images: data.images,
  });
}

export async function POST(req) {
  await connectDB();

  const { images } = await req.json();

  let data = await HeroCarousel.findOne();

  if (!data) {
    data = await HeroCarousel.create({ images });
  } else {
    data.images = images;
    await data.save();
  }

  return Response.json({ success: true });
}