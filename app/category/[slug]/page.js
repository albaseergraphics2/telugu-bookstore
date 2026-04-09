"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import AddToCart from "../../components/AddToCart";

export default function CategoryPage() {
  const params = useParams();
  const slug = params.slug;

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [allBooks, setAllBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const res = await fetch("/api/books");
        const data = await res.json();

        if (data.success) {
          setAllBooks(data.books);
        }
      } catch (err) {
        console.log(err);
      }
    };

    fetchBooks();
  }, []);

  useEffect(() => {
    if (!slug) return;

    setLoading(true);

    const timer = setTimeout(() => {
      const categoryBooks = allBooks.filter(
        (book) =>
          book.category &&
          book.category.toLowerCase() === slug.toLowerCase()
      );

      const result = categoryBooks.filter(
        (book) =>
          book.title?.toLowerCase().includes(search.toLowerCase()) ||
          book.author?.toLowerCase().includes(search.toLowerCase()) ||
          book.teluguTitle?.toLowerCase().includes(search.toLowerCase()) ||
          book.teluguAuthor?.toLowerCase().includes(search.toLowerCase())
      );

      setFilteredBooks(result);
      setLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [slug, search, allBooks]);

  if (!slug) return null;

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
      <Link href="/" className="back-home">← Back to Home</Link>

      <h2 style={{ marginBottom: "20px" }}>
        {slug.toUpperCase()} BOOKS
      </h2>

      <div className="search-box" style={{ marginBottom: "25px" }}>
        <input
          type="text"
          placeholder="Search book..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {filteredBooks.length > 0 ? (
        <div className="allbooks-grid">
          {filteredBooks.map((book) => (
            <div className="allbook-card" key={book.slug}>
              <div className="allbook-img">
                <img
                  src={
                    book.img
                      ? book.img.replace(
                          "/upload/",
                          "/upload/f_auto,q_auto,w_300/"
                        )
                      : "/images/No_Image_Available.jpg"
                  }
                  alt={book.title}
                />
              </div>

              <h3>{book.title}</h3>
              <p className="telugu-title">{book.teluguTitle}</p>
              <p className="author">by {book.author}</p>
              <p className="telugu-author">రచయిత: {book.teluguAuthor}</p>
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
      ) : (
        <div className="no-result">
          <h2>No books found</h2>
          <p>Try another search</p>
        </div>
      )}
    </section>
  );
}