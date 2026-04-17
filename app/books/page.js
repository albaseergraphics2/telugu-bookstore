"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import AddToCart from "../components/AddToCart";

export default function BooksPage() {
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [books, setBooks] = useState([]);
  const [catalog, setCatalog] = useState([]);
  const [sortOrder, setSortOrder] = useState("low"); // ✅ default

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const res = await fetch("/api/books");
        const data = await res.json();
        if (data.success) {
          setBooks(data.books);
          const categories = [
            ...new Set(
              data.books.map((b) => b.category?.trim() || "Other")
            ),
          ];
          categories.sort((a, b) => {
            if (a === "Other") return 1;
            if (b === "Other") return -1;
            return a.localeCompare(b);
          });
          setCatalog(
            categories.map((cat) => ({
              name: cat === "Other" ? "Other Books" : cat,
              slug: cat.toLowerCase(),
            }))
          );
        }
      } catch (err) {
        console.log(err);
      }
      setLoading(false);
    };

    fetchBooks();
  }, []);

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

  // ✅ sorting
  const sortedBooks = [...filteredBooks].sort((a, b) => {
    return sortOrder === "low"
      ? a.price - b.price
      : b.price - a.price;
  });

  // ✅ toggle function
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

        {/* ✅ SWITCH BUTTON */}
        <button onClick={toggleSort} className="sort-btn">
          {sortOrder === "low"
            ? "Price (Low → High)"
            : "Price (High → Low)"}
        </button>
      </div>

      {catalog.map((cat) => {
        const categoryBooks = sortedBooks.filter(
          (book) =>
            (book.category?.trim() || "Other").toLowerCase() === cat.slug
        );

        if (categoryBooks.length === 0) return null;

        return (
          <div key={cat.slug}>
            <h2 className="bookheading">{cat.name}</h2>

            <div className="allbooks-grid">
              {categoryBooks.map((book) => (
                <div className="allbook-card" key={book.slug}>
                  <div className="allbook-img">
                    <img
                      src={book.img || "/images/No_Image_Available.jpg"}
                      alt={book.title}
                    />
                  </div>

                  <h3>{book.title}</h3>
                  <p className="telugu-title">{book.teluguTitle}</p>
                  <p className="author">by {book.author}</p>
                  <p className="telugu-author">
                    రచయిత: {book.teluguAuthor}
                  </p>

                  <div className="book-actions">
                    <p className="price">₹ {book.price}</p>
                    <Link href={`/books/${book.slug}`}>
                      <button className="buy-btn">View Details</button>
                    </Link>
                    <AddToCart book={book} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {filteredBooks.length === 0 && (
        <div className="no-result">
          <h2>No books found</h2>
          <p>Try searching another book or author</p>
        </div>
      )}
    </section>
  );
}