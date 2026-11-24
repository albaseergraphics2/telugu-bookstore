
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import AddToCart from "../../components/AddToCart";
import { useLanguage } from "@/app/context/LanguageContext";

export default function CategoryPage() {
  const params = useParams();
  const slug = params.slug;

  const { language } = useLanguage();
  const isTelugu = language === "te";

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
          book.isActive !== false &&
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
        <p>{isTelugu ? "పుస్తకాలు లోడ్ అవుతున్నాయి..." : "Loading books..."}</p>
      </div>
    );
  }

  const currentCategory = allBooks.find(
    (book) => book.category?.toLowerCase() === slug.toLowerCase()
  );

  return (
    <section className="allbooks">

      <Link href="/" className="back-home">
        ← {isTelugu ? "హోమ్‌కు తిరిగి వెళ్లండి" : "Back to Home"}
      </Link>

      <h2 style={{ marginBottom: "20px" }}>
        {isTelugu
          ? currentCategory?.teluguCategory || slug.toUpperCase()
          : slug.toUpperCase()}{" "}
        {isTelugu ? "పుస్తకాలు" : "BOOKS"}
      </h2>

      <div
        className="search-box"
        style={{ marginBottom: "25px" }}
      >
        <input
          type="text"
          placeholder={isTelugu ? "పుస్తకం కోసం వెతకండి..." : "Search book..."}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {filteredBooks.length > 0 ? (
        <div className="allbooks-grid">
          {filteredBooks.map((book) => (

            <Link
              key={book._id}
              href={`/books/${book.slug}`}
              className="cardlink"
            >

              <div
                className={`allbook-card ${book.inStock === false
                    ? "out-of-stock-card"
                    : ""
                  }`}
              >

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

                  {book.inStock === false && (
                    <span className="stock-badge">
                      {isTelugu ? "స్టాక్‌లో లేదు" : "Out of Stock"}
                    </span>
                  )}

                </div>

                <div className="book-actions">

                  <h3>
                    {isTelugu
                      ? book.teluguTitle || book.title
                      : book.title}
                  </h3>

                  <p className="author">
                    {isTelugu ? "రచయిత:" : "by"}{" "}
                    {isTelugu
                      ? book.teluguAuthor || book.author
                      : book.author}
                  </p>

                  <p className="price">
                    ₹{book.price}
                  </p>

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
      ) : (
        <div className="no-result">
          <h2>{isTelugu ? "పుస్తకాలు కనుగొనబడలేదు" : "No books found"}</h2>
          <p>{isTelugu ? "మరొక పదంతో వెతకండి" : "Try another search"}</p>
        </div>
      )}

    </section>
  );
}
