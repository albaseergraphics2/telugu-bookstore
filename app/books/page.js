"use client";

import { useState } from "react";
import Link from "next/link";
import AddToCart from "../components/AddToCart";
import toast from "react-hot-toast";
import useRealtime from "@/app/hooks/useRealtime";

export default function BooksPage() {
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [books, setBooks] = useState([]);
  const [sortOrder, setSortOrder] = useState("high");

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
        <p>Loading books...</p>
      </div>
    );
  }

  return (
    <section className="allbooks">
      <Link href="/" className="back-home">
        ← Back to Home
      </Link>

      <div className="allbooks-header">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search by book or author..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <button onClick={toggleSort} className="sort-btn">
          {sortOrder === "low"
            ? "Price (Low → High)"
            : "Price (High → Low)"}
        </button>
      </div>

      <h2 className="bookheading">
        All Books
        <span style={{ fontSize: "24px", color: "#5b5656" }}>
          {" "}({sortedBooks.length})
        </span>
      </h2>

      <div className="allbooks-grid">
        {sortedBooks.map((book) => (
          <Link
            key={book.slug}
            href={`/books/${book.slug}`}
            className="cardlink"
          >
            <div
              className={`allbook-card ${book.inStock === false ? "out-of-stock-card" : ""
                }`}
            >
              <div className="allbook-img">
                <img
                  src={book.img || "/images/No_Image_Available.jpg"}
                  alt={book.title}
                />

                {book.inStock === false && (
                  <span className="stock-badge">
                    Out of Stock
                  </span>
                )}
              </div>



              {(book.sold > 50) && (
                <p style={{ color: "green", fontSize: "12px" }}>
                  ⭐ Best Seller
                </p>
              )}

              {(book.views > 100) && (
                <p style={{ color: "orange", fontSize: "12px" }}>
                  🔥 Popular
                </p>
              )}



              {/* <p className="author">by {book.author}</p>
        <p className="telugu-author">
          రచయిత: {book.teluguAuthor}
        </p> */}
              <div className="book-actions">
                <h3>{book.title}</h3>
                <p className="telugu-title">{book.teluguTitle}</p>
                <p className="price">Rs. {book.price}.00</p>

                {/* {book.inStock !== false && (
            <AddToCart book={book} />
          )} */}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {filteredBooks.length === 0 && (
        <div className="no-result">
          <h2>No books found</h2>
          <p>Try searching another book or author</p>
        </div>
      )}
    </section>
  );
}