"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import AddToCart from "../components/AddToCart";

export default function BooksPage() {
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [books, setBooks] = useState([]);
  const [catalog, setCatalog] = useState([]);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const res = await fetch("/api/books");
        const data = await res.json();

        if (data.success) {
          setBooks(data.books);

          const categories = [
            ...new Set(
              data.books
                .map((b) => b.category)
                .filter(Boolean)
            ),
          ];

          const formattedCatalog = categories.map((cat) => ({
            name: cat,
            slug: cat.toLowerCase(),
          }));

          setCatalog(formattedCatalog);
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
    book.isActive !== false && // ✅ ADD THIS LINE
    (
      book.title?.toLowerCase().includes(search.toLowerCase()) ||
      book.author?.toLowerCase().includes(search.toLowerCase()) ||
      book.teluguTitle?.toLowerCase().includes(search.toLowerCase()) ||
      book.teluguAuthor?.toLowerCase().includes(search.toLowerCase())
    )
);

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
      </div>

      {catalog.map((cat) => {
        const categoryBooks = filteredBooks.filter(
          (book) =>
            book.category &&
            book.category.toLowerCase() === cat.slug
        );

        if (categoryBooks.length === 0) return null;

        return (
          <div key={cat.slug}>
            <h2 className="bookheading">{cat.name}</h2>

            <div className="allbooks-grid">
              {categoryBooks.map((book) => (
                <div className="allbook-card" key={book.slug}>
                  <div className="allbook-img">
                    <img src={book.img || "/images/No_Image_Available.jpg"} alt={book.title} />
                  </div>

                  <h3>{book.title}</h3>
                  <p className="telugu-title">{book.teluguTitle}</p>
                  <p className="author">by {book.author}</p>
                  <p className="telugu-author">
                    రచయిత: {book.teluguAuthor}
                  </p>
                  <p className="price">₹ {book.price}</p>

                  <div className="book-actions">
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