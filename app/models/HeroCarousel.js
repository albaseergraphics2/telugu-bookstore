import mongoose from "mongoose";

const HeroCarouselSchema = new mongoose.Schema(
  {
    images: [String],
  },
  { timestamps: true }
);

export default mongoose.models.HeroCarousel ||
  mongoose.model("HeroCarousel", HeroCarouselSchema);