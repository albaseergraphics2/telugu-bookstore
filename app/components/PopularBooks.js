"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function PopularBooks() {

  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const res = await fetch("/api/books");
        const data = await res.json();
        if (data.success) {
          const popular = data.books
            .filter(
              (book) =>
                book.tag === "Popular" || book.tag === "Best Seller" || book.tag === "popular"
            )
            .slice(0, 6);

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
        <p>Loading books...</p>
      </div>
    );
  }

  return (
    <section className="popular">

      <h1 className="popular-title">Popular Books</h1>

      <div className="book-grid">
        {books.map((book) => (
          <div className="book-card" key={book._id}>

            <div className="book-img">
              <img src={book.img || "/placeholder.png"} alt={book.title} />
            </div>

            <div className="book-info">
              <h3>{book.title}</h3>
              <p className="telugu-title">{book.teluguTitle}</p>
              <p className="author">Author: {book.author}</p>
              <p className="telugu-author">రచయిత: {book.teluguAuthor}</p>

              <div className="book-actions">
                <p className="price">₹ {book.price}</p>
                <Link href={`/books/${book.slug}`}>
                  <button className="buy-btn">View Details</button>
                </Link>
              </div>
            </div>

          </div>
        ))}
      </div>

      <div className="allbooks12">
        <Link href="/books">
          <button className="buy-btn buy-btn12">View All Books</button>
        </Link>
      </div>

    </section>
  );
}