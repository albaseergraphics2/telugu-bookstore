"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function AuthorPage() {
  const [books, setBooks] = useState([]);
  const [selectedAuthor, setSelectedAuthor] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchBooks = async () => {
      const res = await fetch("/api/books");
      const data = await res.json();

      if (data.success) {
        setBooks(data.books || []);
      }
    };

    fetchBooks();
  }, []);

  const authors = [...new Set(books.map((book) => book.author))];

  const filteredAuthors = authors.filter((author) =>
    author.toLowerCase().includes(search.toLowerCase())
  );

  const filteredBooks = selectedAuthor
    ? books.filter((book) => book.author === selectedAuthor)
    : [];

  return (
    <section className="allbooks">
      <Link href="/" className="back-home">← Back to Home</Link>

      <h2 style={{ marginBottom: "20px" }}>Browse by Author</h2>

      <div className="search-box" style={{ marginBottom: "25px" }}>
        <input
          type="text"
          placeholder="Search author..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {filteredAuthors.length === 0 ? (
        <div className="no-result">
          <h2>No author found</h2>
          <p>Try another name</p>
        </div>
      ) : (
        <>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "12px",
              marginBottom: "30px",
            }}
          >
            {filteredAuthors.map((author, i) => (
              <button
                key={i}
                className="buy-btn"
                onClick={() => setSelectedAuthor(author)}
              >
                {author}
              </button>
            ))}
          </div>

          {selectedAuthor && (
            <>
              <h3 style={{ marginBottom: "20px" }}>{selectedAuthor}</h3>

              {filteredBooks.length === 0 ? (
                <div className="no-result">
                  <h2>No books available</h2>
                </div>
              ) : (
                <div className="allbooks-grid">
                  {filteredBooks.map((book) => (
                    <div className="allbook-card" key={book._id}>
                      <div className="allbook-img">
                        <img src={book.img} alt={book.title} />
                      </div>

                      <h3>{book.title}</h3>
                      <p>{book.price}</p>

                      <Link href={`/books/${book.slug}`}>
                        <button className="buy-btn">
                          View Details
                        </button>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </>
      )}
    </section>
  );
}