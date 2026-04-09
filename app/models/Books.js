import mongoose from "mongoose";

const BookSchema = new mongoose.Schema({
  slug: String,
  title: String,
  teluguTitle: String,
  author: String,
  teluguAuthor: String,
  price: String,
  pages: Number,
  binding: String,
  size: String,
  language: String,
  paper: String,
  publisher: String,
  weight: String,
  category: String,
  tag: String,
  img: String,
  images: [String],
  desc: String,
  teluguDesc: String,
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

export default mongoose.models.Book || mongoose.model("Book", BookSchema);