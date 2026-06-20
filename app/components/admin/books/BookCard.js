export default function BookCard({
  book,
  onEdit,
  onDelete,
  onToggle,
  onStockToggle,
}) {
  return (
    <div className="adminbook-card">
      <img
        src={
          book.img
            ? book.img.replace(
              "/upload/",
              "/upload/w_300,q_auto,f_auto/"
            )
            : "/images/No_Image_Available.jpg"
        }
        alt={book.title}
      />

      <h3>{book.title}</h3>
      <p>{book.author}</p>
      <p>₹ {book.price}</p>

      <div className="adminbook-actions">
        <button onClick={() => onEdit(book)}>
          Edit
        </button>

        <button
          className={book.isActive ? "hide-btn" : "unhide-btn"}
          onClick={() =>
            onToggle(book._id, book.isActive)
          }
        >
          {book.isActive !== false ? "Hide" : "Unhide"}
        </button>

        <button
          className={book.inStock ? "instock-btn" : "outstock-btn"}
          onClick={() =>
            onStockToggle(book._id, book.inStock)
          }
        >
          {book.inStock !== false
            ? "In Stock"
            : "Out of Stock"}
        </button>

        <button
          onClick={() => onDelete(book._id)}
        >
          Delete
        </button>
      </div>
    </div>
  );
}