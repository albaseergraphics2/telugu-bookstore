"use client";

import { useEffect, useState } from "react";
import { uploadToCloudinary } from "../../lib/cloudinary";

export default function AdminBooks() {

  const [books, setBooks] = useState([]);
  const [showAddPopup, setShowAddPopup] = useState(false);
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [editId, setEditId] = useState(null);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [deleteType, setDeleteType] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  const [form, setForm] = useState({
    slug: "",
    title: "",
    teluguTitle: "",
    author: "",
    teluguAuthor: "",
    price: "",
    pages: "",
    binding: "",
    size: "",
    language: "",
    paper: "",
    publisher: "",
    weight: "",
    category: "",
    tag: "",
    img: "",
    images: [],
    desc: "",
    teluguDesc: "",
  });

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    const res = await fetch("/api/admin/books");
    const data = await res.json();
    if (data.success) setBooks(data.books);
  };

  const makeSlug = (text) => {
    return text.toLowerCase().trim().replace(/[\s\W-]+/g, "-");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "title") {
      setForm({
        ...form,
        title: value,
        slug: makeSlug(value),
      });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const compressImage = (file) => {
    return new Promise((resolve) => {
      const img = new Image();
      const reader = new FileReader();

      reader.onload = (e) => (img.src = e.target.result);

      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        canvas.toBlob((blob) => resolve(blob), "image/jpeg", 0.7);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const compressed = await compressImage(file);
    const url = await uploadToCloudinary(compressed);

    setForm(prev => ({ ...prev, img: url }));
  };

  const handleMultipleImages = async (e) => {
    const files = Array.from(e.target.files);
    let urls = [];

    for (let file of files) {
      const compressed = await compressImage(file);
      const url = await uploadToCloudinary(compressed);
      urls.push(url);
    }

    setForm(prev => ({
      ...prev,
      images: [...(prev.images || []), ...urls],
    }));
  };

  const deleteImage = async (imgUrl) => {
  try {
    await fetch("/api/delete-image", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url: imgUrl }),
    });

    setForm(prev => ({
      ...prev,
      img: prev.img === imgUrl ? "" : prev.img,
      images: prev.images.filter(img => img !== imgUrl),
    }));

  } catch (err) {
    console.log(err);
    alert("Failed to delete image");
  }
};

  const addBook = async (e) => {
    e.preventDefault();

    const res = await fetch("/api/admin/books", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        pages: Number(form.pages),
      }),
    });

    const data = await res.json();

    if (data.success) {
      setShowAddPopup(false);
      resetForm();
      fetchBooks();
    }
  };

  const updateBook = async (e) => {
    e.preventDefault();

    const res = await fetch("/api/admin/books", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        pages: Number(form.pages),
        id: editId,
      }),
    });

    const data = await res.json();

    if (data.success) {
      setShowEditPopup(false);
      setEditId(null);
      resetForm();
      fetchBooks();
    }
  };

  const toggleActive = async (id, currentStatus) => {
    await fetch("/api/admin/books", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id,
        toggleActive: !currentStatus
      }),
    });
    fetchBooks();
  };

  const resetForm = () => {
    setForm({
      slug: "",
      title: "",
      teluguTitle: "",
      author: "",
      teluguAuthor: "",
      price: "",
      pages: "",
      binding: "",
      size: "",
      language: "",
      paper: "",
      publisher: "",
      weight: "",
      category: "",
      tag: "",
      img: "",
      images: [],
      desc: "",
      teluguDesc: "",
    });
  };

  const handleEdit = (book) => {
    setForm(book);
    setEditId(book._id);
    setShowEditPopup(true);
  };

  const deleteBook = async (id) => {
    await fetch("/api/admin/books", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    fetchBooks();
  };

  const categories = [
    ...new Set(
      books
        .map((b) => (b.category || "").trim().toLowerCase())
        .filter(Boolean)
    ),
  ];

  return (
    <div className="admin-books">
      <div className="books-header">
        <h2>Books Management</h2>
        <button onClick={() => {
          resetForm();
          setShowAddPopup(true);
        }}>
          Add Book
        </button>
      </div>

      {categories.map((cat) => {
        const categoryBooks = books.filter(
          (book) =>
            (book.category || "").trim().toLowerCase() === cat.trim().toLowerCase()
        );

        if (categoryBooks.length === 0) return null;

        return (
          <div key={cat}>
            <h2 className="admin-category-heading">{cat}</h2>
            <div className="books-grid">
              {categoryBooks.map((book) => (
                <div key={book._id} className="adminbook-card">

                  <img
                    src={
                      book.img
                        ? book.img.trim().replace("/upload/", "/upload/w_300,q_auto,f_auto/")
                        : "/images/placeholder.png"
                    }
                    alt={book.title}
                  />

                  <h3>{book.title}</h3>
                  <p>{book.author}</p>
                  <p>₹ {book.price}</p>

                  <div className="adminbook-actions">
                    <button onClick={() => handleEdit(book)}>Edit</button>
                    <button onClick={() => toggleActive(book._id, book.isActive)}>
                      {book.isActive !== false ? "Hide" : "Unhide"}
                    </button>
                    <button onClick={() => {
                      setSelectedId(book._id);
                      setDeleteType("book");
                      setShowDeletePopup(true);
                    }}>
                      Delete
                    </button>
                  </div>

                </div>
              ))}
            </div>
          </div>
        );
      })}

      {books.filter(book => !book.category || book.category.trim() === "").length > 0 && (
        <div>
          <h2 className="admin-category-heading">Other Books</h2>
          <div className="books-grid">
            {books
              .filter(book => !book.category || book.category.trim() === "")
              .map((book) => (
                <div key={book._id} className="adminbook-card">

                  <img
                    src={
                      book.img
                        ? book.img.trim().replace("/upload/", "/upload/w_300,q_auto,f_auto/")
                        : "/images/placeholder.png"
                    }
                    alt={book.title}
                  />

                  <h3>{book.title}</h3>
                  <p>{book.author}</p>
                  <p>₹ {book.price}</p>

                  <div className="adminbook-actions">
                    <button onClick={() => handleEdit(book)}>Edit</button>
                    <button onClick={() => {
                      setSelectedId(book._id);
                      setDeleteType("book");
                      setShowDeletePopup(true);
                    }}>
                      Delete
                    </button>
                  </div>

                </div>
              ))}
          </div>
        </div>
      )}

      {showAddPopup && (
        <div className="popup-overlay" onClick={() => setShowAddPopup(false)}>
          <div className="popup" onClick={(e) => e.stopPropagation()}>
            <h3>Add Book</h3>

            <form onSubmit={addBook} className="book-form">
              <input name="slug" value={form.slug} readOnly />
              <input name="title" placeholder="Title" value={form.title} onChange={handleChange} required />
              <input name="teluguTitle" placeholder="Telugu Title" value={form.teluguTitle} onChange={handleChange} />
              <input name="author" placeholder="Author" value={form.author} onChange={handleChange} required />
              <input name="teluguAuthor" placeholder="Telugu Author" value={form.teluguAuthor} onChange={handleChange} />
              <input name="price" placeholder="Price" value={form.price} onChange={handleChange} required />
              <input name="pages" placeholder="Pages" value={form.pages} onChange={handleChange} />
              <input name="binding" placeholder="Binding" value={form.binding} onChange={handleChange} />
              <input name="size" placeholder="Size" value={form.size} onChange={handleChange} />
              <input name="language" placeholder="Language" value={form.language} onChange={handleChange} />
              <input name="paper" placeholder="Paper" value={form.paper} onChange={handleChange} />
              <input name="publisher" placeholder="Publisher" value={form.publisher} onChange={handleChange} />
              <input name="weight" placeholder="Weight" value={form.weight} onChange={handleChange} />
              <input name="category" placeholder="Category" value={form.category} onChange={handleChange} />
              <input name="tag" placeholder="Tag" value={form.tag} onChange={handleChange} />
              <input type="file" onChange={handleImageUpload} />
              {form.img && <img src={form.img} style={{ width: "80px" }} />}
              <input type="file" multiple onChange={handleMultipleImages} />
              <textarea name="desc" placeholder="Description" value={form.desc} onChange={handleChange} />
              <textarea name="teluguDesc" placeholder="Telugu Description" value={form.teluguDesc} onChange={handleChange} />
              <button type="submit">Add Book</button>
            </form>

          </div>
        </div>
      )}

      {showEditPopup && (
        <div className="popup-overlay" onClick={() => setShowEditPopup(false)}>
          <div className="popup" onClick={(e) => e.stopPropagation()}>
            <h3>Edit Book</h3>

            <form onSubmit={updateBook} className="book-form">
              <input name="slug" value={form.slug} readOnly />
              <input name="title" placeholder="Title" value={form.title} onChange={handleChange} required />
              <input name="teluguTitle" placeholder="Telugu Title" value={form.teluguTitle} onChange={handleChange} />
              <input name="author" placeholder="Author" value={form.author} onChange={handleChange} required />
              <input name="teluguAuthor" placeholder="Telugu Author" value={form.teluguAuthor} onChange={handleChange} />
              <input name="price" placeholder="Price" value={form.price} onChange={handleChange} required />
              <input name="pages" placeholder="Pages" value={form.pages} onChange={handleChange} />
              <input name="binding" placeholder="Binding" value={form.binding} onChange={handleChange} />
              <input name="size" placeholder="Size" value={form.size} onChange={handleChange} />
              <input name="language" placeholder="Language" value={form.language} onChange={handleChange} />
              <input name="paper" placeholder="Paper" value={form.paper} onChange={handleChange} />
              <input name="publisher" placeholder="Publisher" value={form.publisher} onChange={handleChange} />
              <input name="weight" placeholder="Weight" value={form.weight} onChange={handleChange} />
              <input name="category" placeholder="Category" value={form.category} onChange={handleChange} />
              <input name="tag" placeholder="Tag" value={form.tag} onChange={handleChange} />

              {form.img && (
                <div style={{ position: "relative", width: "60px" }}>
                  <img
                    src={form.img}
                    width="55"
                    style={{ borderRadius: "6px" }}
                  />

                  <button
                    className="crossmark"
                    type="button"
                    onClick={() => {
                      setSelectedImage(form.img);
                      setDeleteType("image");
                      setShowDeletePopup(true);
                    }}
                    onMouseEnter={(e) => (e.target.style.transform = "scale(1.1)")}
                    onMouseLeave={(e) => (e.target.style.transform = "scale(1)")}
                  >
                    ×
                  </button>
                </div>
              )}

              <input type="file" onChange={handleImageUpload} />

              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                {form.images?.map((img, i) => (
                  <div
                    key={i}
                    style={{
                      position: "relative",
                      width: "60px",
                      height: "80px",
                    }}
                  >
                    <img
                      src={img}
                      style={{
                        width: "55px",
                        height: "100%",
                        borderRadius: "6px",
                      }}
                    />

                    <button
                    className="crossmark"
                      type="button"
                      onClick={() => {
                        setSelectedImage(img);
                        setDeleteType("image");
                        setShowDeletePopup(true);
                      }}
                      onMouseEnter={(e) => (e.target.style.transform = "scale(1.1)")}
                      onMouseLeave={(e) => (e.target.style.transform = "scale(1)")}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>

              <input type="file" multiple onChange={handleMultipleImages} />
              <textarea name="desc" placeholder="Description" value={form.desc} onChange={handleChange} />
              <textarea name="teluguDesc" placeholder="Telugu Description" value={form.teluguDesc} onChange={handleChange} />
              <button type="submit">Update Book</button>
            </form>
          </div>
        </div>
      )}

      {showDeletePopup && (
        <div className="popup-overlay" onClick={() => setShowDeletePopup(false)}>
          <div className="order-popup-box" onClick={(e) => e.stopPropagation()}>
            <h3>Confirm Delete</h3>
            <p>Are you sure you want to delete?</p>
            <div className="order-popup-actions">
              <button
                onClick={() => {
                  if (deleteType === "book") {
                    deleteBook(selectedId);
                  } else {
                    deleteImage(selectedImage);
                  }
                  setShowDeletePopup(false);
                }} className="order-popup-delete"
              >
                Yes Delete
              </button>
              <button onClick={() => setShowDeletePopup(false)} className="order-popup-cancel">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}