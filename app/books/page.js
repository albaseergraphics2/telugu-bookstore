
"use client";

import { useState } from "react";
import Link from "next/link";
import AddToCart from "../components/Addtocartnonav";
import toast from "react-hot-toast";
import useRealtime from "@/app/hooks/useRealtime";
import { useLanguage } from "../context/LanguageContext";

export default function BooksPage() {
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [books, setBooks] = useState([]);
  const [sortOrder, setSortOrder] = useState("high");

  const { language } = useLanguage();
  const isTelugu = language === "te";

  const fetchBooks = async () => {
    try {
      const res = await fetch("/api/books");
      const data = await res.json();

      if (data.success) {
        setBooks(data.books);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load books");
    }

    setLoading(false);
  };

  useRealtime(fetchBooks);

  const filteredBooks = books.filter(
    (book) =>
      book.isActive !== false &&
      (
        book.title?.toLowerCase().includes(search.toLowerCase()) ||
        book.author?.toLowerCase().includes(search.toLowerCase()) ||
        book.teluguTitle?.toLowerCase().includes(search.toLowerCase()) ||
        book.teluguAuthor?.toLowerCase().includes(search.toLowerCase())
      )
  );

  const sortedBooks = [...filteredBooks].sort((a, b) => {
    if ((b.sold || 0) !== (a.sold || 0)) {
      return (b.sold || 0) - (a.sold || 0);
    }

    if ((b.views || 0) !== (a.views || 0)) {
      return (b.views || 0) - (a.views || 0);
    }

    return sortOrder === "low"
      ? a.price - b.price
      : b.price - a.price;
  });

  const toggleSort = () => {
    setSortOrder((prev) => (prev === "low" ? "high" : "low"));
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", marginTop: "100px" }}>
        <div className="loader"></div>
        <p>{isTelugu ? "పుస్తకాలు లోడ్ అవుతున్నాయి..." : "Loading books..."}</p>
      </div>
    );
  }

  return (
    <section className="allbooks">
      <Link href="/" className="back-home">
        {isTelugu ? "← హోమ్‌కు తిరిగి వెళ్ళండి" : "← Back to Home"}
      </Link>

      <div className="allbooks-header">
        <div className="search-box">
          <input
            type="text"
            placeholder={
              isTelugu
                ? "పుస్తకం లేదా రచయిత పేరు ద్వారా వెతకండి..."
                : "Search by book or author..."
            }
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <button onClick={toggleSort} className="sort-btn">
          {sortOrder === "low"
            ? isTelugu
              ? "ధర (తక్కువ → ఎక్కువ)"
              : "Price (Low → High)"
            : isTelugu
              ? "ధర (ఎక్కువ → తక్కువ)"
              : "Price (High → Low)"}
        </button>
      </div>

      <h2 className="bookheading">
        {isTelugu ? "అన్ని పుస్తకాలు" : "All Books"}
        <span style={{ fontSize: "24px", color: "#5b5656" }}>
          {" "}({sortedBooks.length})
        </span>
      </h2>

      <div className="allbooks-grid">
        {sortedBooks.map((book) => (
          <Link
            key={book._id}
            href={`/books/${book.slug}`}
            className="cardlink"
          >
            <div
              className={`allbook-card ${
                book.inStock === false ? "out-of-stock-card" : ""
              }`}
            >
              <div className="allbook-img">
                <img
                  src={book.img || "/images/No_Image_Available.jpg"}
                  alt={
                    isTelugu
                      ? book.teluguTitle || book.title
                      : book.title
                  }
                />

                {book.inStock === false && (
                  <span className="stock-badge">
                    {isTelugu ? "స్టాక్ లేదు" : "Out of Stock"}
                  </span>
                )}
              </div>

              {book.sold > 50 && (
                <p style={{ color: "green", fontSize: "12px" }}>
                  ⭐ {isTelugu ? "అత్యధికంగా అమ్ముడైన పుస్తకం" : "Best Seller"}
                </p>
              )}

              {book.views > 100 && (
                <p style={{ color: "orange", fontSize: "12px" }}>
                  🔥 {isTelugu ? "ప్రసిద్ధమైనది" : "Popular"}
                </p>
              )}

              <div className="book-actions">
                <h3>
                  {isTelugu
                    ? book.teluguTitle || book.title
                    : book.title}
                </h3>

                {/* <p className="telugu-title">
                  {isTelugu
                    ? book.teluguAuthor || book.author
                    : book.author}
                </p> */}

                <p className="price">₹{book.price}</p>

                {book.inStock !== false && (
                  <div
                    className="cart12"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                  >
                    <AddToCart book={book} />
                  </div>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {filteredBooks.length === 0 && (
        <div className="no-result">
          <h2>{isTelugu ? "పుస్తకాలు కనుగొనబడలేదు" : "No books found"}</h2>
          <p>
            {isTelugu
              ? "మరొక పుస్తకం లేదా రచయిత పేరుతో వెతకండి"
              : "Try searching another book or author"}
          </p>
        </div>
      )}
    </section>
  );
}
