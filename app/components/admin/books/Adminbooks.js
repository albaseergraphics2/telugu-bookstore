"use client";

import { useEffect, useState } from "react";
import BookCard from "./BookCard";
import AddBookPopup from "./AddBookPopup";
import EditBookPopup from "./EditBookPopup";
import DeletePopup from "./DeletePopup";

export default function AdminBooks() {
  const [books, setBooks] = useState([]);
  const [form, setForm] = useState({
    title: "",
    author: "",
    price: "",
    img: "",
    category: "",
  });

  const [editId, setEditId] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    const res = await fetch("/api/admin/books");
    const data = await res.json();
    if (data.success) setBooks(data.books);
  };

  const addBook = async (e) => {
    e.preventDefault();

    const res = await fetch("/api/admin/books", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    if (data.success) {
      setShowAdd(false);
      resetForm();
      fetchBooks();
    }
  };

  const updateBook = async (e) => {
    e.preventDefault();

    const res = await fetch("/api/admin/books", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, id: editId }),
    });

    const data = await res.json();
    if (data.success) {
      setShowEdit(false);
      setEditId(null);
      resetForm();
      fetchBooks();
    }
  };

  const deleteBook = async () => {
    await fetch("/api/admin/books", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: deleteId }),
    });

    setDeleteId(null);
    fetchBooks();
  };

  const toggleActive = async (id, currentStatus) => {
    await fetch("/api/admin/books", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id,
        toggleActive: !currentStatus,
      }),
    });

    fetchBooks();
  };

  const resetForm = () => {
    setForm({
      title: "",
      author: "",
      price: "",
      img: "",
      category: "",
    });
  };

  const handleEdit = (book) => {
    setForm(book);
    setEditId(book._id);
    setShowEdit(true);
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

        <button
          onClick={() => {
            resetForm();
            setShowAdd(true);
          }}
        >
          Add Book
        </button>
      </div>

      {categories.map((cat) => {
        const categoryBooks = books.filter(
          (book) =>
            (book.category || "").trim().toLowerCase() === cat
        );

        if (categoryBooks.length === 0) return null;

        return (
          <div key={cat}>
            <h2 className="admin-category-heading">{cat}</h2>

            <div className="books-grid">
              {categoryBooks.map((book) => (
                <BookCard
                  key={book._id}
                  book={book}
                  onEdit={handleEdit}
                  onDelete={(id) => setDeleteId(id)}
                  onToggle={toggleActive}
                />
              ))}
            </div>
          </div>
        );
      })}

      {books.filter(b => !b.category || b.category.trim() === "").length > 0 && (
        <div>
          <h2 className="admin-category-heading">Other Books</h2>

          <div className="books-grid">
            {books
              .filter(b => !b.category || b.category.trim() === "")
              .map((book) => (
                <BookCard
                  key={book._id}
                  book={book}
                  onEdit={handleEdit}
                  onDelete={(id) => setDeleteId(id)}
                  onToggle={toggleActive}
                />
              ))}
          </div>
        </div>
      )}

      {/* ➕ Add */}
      {showAdd && (
        <AddBookPopup
          form={form}
          setForm={setForm}
          onSubmit={addBook}
          onClose={() => setShowAdd(false)}
        />
      )}

      {showEdit && (
        <EditBookPopup
          form={form}
          setForm={setForm}
          onSubmit={updateBook}
          onClose={() => setShowEdit(false)}
        />
      )}

      {deleteId && (
        <DeletePopup
          onConfirm={deleteBook}
          onCancel={() => setDeleteId(null)}
        />
      )}
    </div>
  );
}