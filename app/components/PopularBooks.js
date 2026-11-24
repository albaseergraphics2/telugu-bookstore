
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLanguage } from "../context/LanguageContext";

export default function PopularBooks() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const { language } = useLanguage();

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const res = await fetch("/api/books");
        const data = await res.json();

        if (data.success) {
          const popular = data.books
            .filter(
              (book) =>
                book.tag === "Popular" ||
                book.tag === "Best Seller" ||
                book.tag === "popular"
            )
            .slice(0, 10);

          setBooks(popular);
        }
      } catch (err) {
        console.log(err);
      }

      setLoading(false);
    };

    fetchBooks();
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: "center", marginTop: "60px" }}>
        <div className="loader"></div>
        <p>{language === "te" ? "పుస్తకాలు లోడ్ అవుతున్నాయి..." : "Loading books..."}</p>
      </div>
    );
  }

  return (
    <section className="popular">
      <h1 className="popular-title">
        {language === "te" ? "ప్రసిద్ధ పుస్తకాలు" : "Popular Books"}
      </h1>

      <div className="book-grid">
        {books.map((book) => (
          <Link
            key={book._id}
            className="cardlink"
            href={`/books/${book.slug}`}
          >
            <div className="book-card">
              <div className="book-img">
                <img
                  src={book.img || "/images/No_Image_Available.jpg"}
                  alt={language === "te" ? book.teluguTitle || book.title : book.title}
                />
              </div>

              <div className="book-info">
                <h3>
                  {language === "te"
                    ? book.teluguTitle || book.title
                    : book.title}
                </h3>

                {/* <p className="telugu-title">
                  {language === "te"
                    ? book.teluguAuthor || book.author
                    : book.author}
                </p> */}

                <div className="book-actions">
                  <p className="price">₹{book.price}</p>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="allbooks12">
        <Link href="/books">
          <button className="buy-btn buy-btn12">
            {language === "te" ? "అన్ని పుస్తకాలు చూడండి" : "View All Books"}
          </button>
        </Link>
      </div>
    </section>
  );
}
