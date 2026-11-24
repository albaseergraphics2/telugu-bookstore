
"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import AddToCart from "../../components/AddToCart";
import PopularBooks from "../../components/PopularBooks";
import { useLanguage } from "../../context/LanguageContext";

export default function BookDetails({ params }) {
  const { slug } = use(params);

  const { language } = useLanguage();
  const isTelugu = language === "te";

  const [loading, setLoading] = useState(true);
  const [book, setBook] = useState(null);
  const [mainImage, setMainImage] = useState(null);

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const res = await fetch(`/api/books/${slug}`);
        const data = await res.json();

        if (data.success) {
          setBook(data.book);

          let imagesArray = [];

          if (data.book.img) {
            imagesArray.push(data.book.img);
          }

          if (data.book.images && data.book.images.length > 0) {
            imagesArray = [...imagesArray, ...data.book.images];
          }

          imagesArray = imagesArray.filter(
            (img) => img && img.trim() !== ""
          );

          setMainImage(imagesArray[0]?.trim() || null);
        }
      } catch (err) {
        console.log(err);
      }

      setLoading(false);
    };

    fetchBook();
  }, [slug]);

  if (loading) {
    return (
      <div style={{ textAlign: "center", marginTop: "100px" }}>
        <div className="loader"></div>
        <p>
          {isTelugu
            ? "పుస్తకం వివరాలు లోడ్ అవుతున్నాయి..."
            : "Loading book details..."}
        </p>
      </div>
    );
  }

  if (!book) {
    return (
      <section className="book-details">
        <Link href="/books" className="back-home">
          {isTelugu ? "← పుస్తకాల వద్దకు తిరిగి వెళ్ళండి" : "← Back to Books"}
        </Link>

        <h2 style={{ textAlign: "center", marginTop: "20px" }}>
          {isTelugu ? "పుస్తకం కనుగొనబడలేదు" : "Book Not Found"}
        </h2>
      </section>
    );
  }

  let imagesList = [];

  if (book.img) {
    imagesList.push(book.img);
  }

  if (book.images && book.images.length > 0) {
    imagesList = [...imagesList, ...book.images];
  }

  imagesList = imagesList.filter(
    (img) => img && img.trim() !== ""
  );

  return (
    <>
      <section className="book-details">
        <Link href="/books" className="back-home">
          {isTelugu ? "← పుస్తకాల వద్దకు తిరిగి వెళ్ళండి" : "← Back to Books"}
        </Link>

        <div className="book-details-container">
          <div className="book-details-img">
            <div className="main-image">
              <img
                src={
                  mainImage?.trim()
                    ? mainImage.trim()
                    : "/images/No_Image_Available.jpg"
                }
                alt={
                  isTelugu
                    ? book.teluguTitle || book.title
                    : book.title
                }
              />
            </div>

            <div className="thumb-images">
              {imagesList.map((img, i) => (
                <img
                  key={i}
                  src={img?.trim() || "/images/No_Image_Available.jpg"}
                  alt="thumbnail"
                  onClick={() => setMainImage(img?.trim())}
                />
              ))}
            </div>
          </div>

          <div className="book-details-info">
            <h1>
              {isTelugu
                ? book.teluguTitle || book.title
                : book.title}
            </h1>

            <p className="author">
              {isTelugu
                ? `రచయిత: ${book.teluguAuthor || book.author || ""}`
                : `Author: ${book.author || ""}`}
            </p>

            <p className="desc">
              {isTelugu
                ? book.teluguDesc || book.desc
                : book.desc}
            </p>

            <p className="price">₹{book.price}</p>

            <p>
              <strong>{isTelugu ? "ప్రచురణకర్త:" : "Publisher:"}</strong>{" "}
              {book.publisher}
            </p>

            <p>
              <strong>{isTelugu ? "పేజీలు:" : "Pages:"}</strong>{" "}
              {book.pages}
            </p>

            <p>
              <strong>{isTelugu ? "బైండింగ్:" : "Binding:"}</strong>{" "}
              {book.binding}
            </p>

            <p>
              <strong>{isTelugu ? "పరిమాణం:" : "Size:"}</strong>{" "}
              {book.size}
            </p>

            <p>
              <strong>{isTelugu ? "భాష:" : "Language:"}</strong>{" "}
              {book.language}
            </p>

            <p>
              <strong>{isTelugu ? "వర్గం:" : "Category:"}</strong>{" "}
              {isTelugu
                ? book.teluguCategory || book.category
                : book.category}
            </p>

            <div style={{ textAlign: "center" }}>
              {book.inStock !== false ? (
                <AddToCart book={book} />
              ) : (
                <div className="book-out-of-stock">
                  <span className="book-stock-badge">
                    {isTelugu ? "స్టాక్ లేదు" : "Out of Stock"}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <PopularBooks />
    </>
  );
}
