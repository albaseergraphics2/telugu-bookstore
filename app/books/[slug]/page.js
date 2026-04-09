"use client";

import { useState, useEffect ,use} from "react";
import Link from "next/link";
import AddToCart from "../../components/AddToCart";
import PopularBooks from "../../components/PopularBooks";

export default function BookDetails({ params }) {
  const { slug } = use(params);

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
          const imagesArray =
            data.book.images && data.book.images.length > 0
              ? data.book.images
              : data.book.img
              ? [data.book.img]
              : [];

          setMainImage(imagesArray[0] || null);
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
        <p>Loading book details...</p>
      </div>
    );
  }

  if (!book) {
    return (
      <section className="book-details">
        <Link href="/books" className="back-home">
          ← Back to Books
        </Link>
        <h2 style={{ textAlign: "center", marginTop: "20px" }}>
          Book Not Found
        </h2>
      </section>
    );
  }

  const imagesList =
    book.images && book.images.length > 0
      ? book.images
      : book.img
      ? [book.img]
      : [];

  return (
    <section className="book-details">
      <Link href="/books" className="back-home">
        ← Back to Books
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
              alt={book.title}
            />
          </div>
          <div className="thumb-images">
            {imagesList.map((img, i) => (
              <img
                key={i}
                src={img.trim()}
                alt="thumbnail"
                onClick={() => setMainImage(img)}
              />
            ))}
          </div>
        </div>

        <div className="book-details-info">
          <h1>{book.title}</h1>
          <h2 className="telugu-title">{book.teluguTitle}</h2>
          <p className="author">Author: {book.author}</p>
          <p className="telugu-author">రచయిత: {book.teluguAuthor}</p>
          <p className="desc">{book.desc}</p>
          <p className="telugu-desc">{book.teluguDesc}</p>
          <p className="price">₹ {book.price}</p>

          <p><strong>Pages:</strong> {book.pages}</p>
          <p><strong>Binding:</strong> {book.binding}</p>
          <p><strong>Size:</strong> {book.size}</p>
          <p><strong>Language:</strong> {book.language}</p>
          <p><strong>Category:</strong> {book.category}</p>

          <div style={{ textAlign: "center" }}>
            <AddToCart book={book} />
          </div>
        </div>
      </div>
      <PopularBooks />
    </section>
  );
}