"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function CreatePurchase() {
  const params = useParams();
  const router = useRouter();
  const [supplier, setSupplier] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [purchaseDate, setPurchaseDate] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [paidAmount, setPaidAmount] = useState("");
  const [books, setBooks] = useState([
    {
      bookName: "",
      isbn: "",
      quantity: 1,
      mrp: "",
      supplierRate: "",
      discount: "",
      purchaseRate: "",
      sellingPrice: "",
    },
  ]);

  useEffect(() => {
    if (params?.id) {
      fetchSupplier();
    }
  }, [params?.id]);

  const fetchSupplier = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/suppliers/${params.id}`);
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.message || "Failed to load supplier.");
        return;
      }
      setSupplier(data.supplier);
      const today = new Date().toISOString().split("T")[0];
      setPurchaseDate(today);
    } catch (error) {
      console.error(error);
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const addBook = () => {
    setBooks([
      ...books,
      {
        bookName: "",
        isbn: "",
        quantity: 1,
        mrp: "",
        supplierRate: "",
        discount: "",
        purchaseRate: "",
        sellingPrice: "",
      },
    ]);
  };

  const removeBook = (index) => {
    if (books.length === 1) {
      return;
    }
    setBooks(
      books.filter((_, bookIndex) => bookIndex !== index)
    );
  };

  const updateBook = (index, field, value) => {
    setBooks((currentBooks) =>
      currentBooks.map((book, bookIndex) => {
        if (bookIndex !== index) {
          return book;
        }
        const updatedBook = {
          ...book,
          [field]: value,
        };
        if (
          field === "supplierRate" || field === "discount"
        ) {
          const supplierRate = Number(
            field === "supplierRate" ? value : book.supplierRate
          ) || 0;

          const discount = Number(
            field === "discount" ? value : book.discount
          ) || 0;

          updatedBook.purchaseRate = (
            supplierRate - (supplierRate * discount) / 100
          ).toFixed(2);
        }
        return updatedBook;
      })
    );
  };

  const getBookTotal = (book) => {
    const quantity = Number(book.quantity) || 0;
    const purchaseRate = Number(book.purchaseRate) || 0;
    return quantity * purchaseRate;
  };

  const getBookProfit = (book) => {
    const sellingPrice = Number(book.sellingPrice) || 0;
    const purchaseRate = Number(book.purchaseRate) || 0;
    return sellingPrice - purchaseRate;
  };

  const totalBooks = books.reduce(
    (total, book) =>
      total + (Number(book.quantity) || 0), 0
  );

  const totalPurchaseAmount = books.reduce(
    (total, book) =>
      total + getBookTotal(book), 0
  );

  const totalSellingValue = books.reduce(
    (total, book) =>
      total +
      (Number(book.quantity) || 0) *
      (Number(book.sellingPrice) || 0),
    0
  );

  const expectedProfit = totalSellingValue - totalPurchaseAmount;
  const paid = Number(paidAmount) || 0;
  const balance = totalPurchaseAmount - paid;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!purchaseDate) {
      setError("Purchase date is required.");
      return;
    }
    if (books.length === 0) {
      setError("Add at least one book.");
      return;
    }

    for (const book of books) {
      if (!book.bookName.trim()) {
        setError("Book name is required.");
        return;
      }

      if (!book.quantity || Number(book.quantity) <= 0) {
        setError("Book quantity must be greater than 0.");
        return;
      }

      if (book.purchaseRate === "" || Number(book.purchaseRate) < 0) {
        setError("Purchase rate is required.");
        return;
      }

      if (book.sellingPrice === "" || Number(book.sellingPrice) < 0) {
        setError("Selling price is required.");
        return;
      }
    }

    if (paid < 0) {
      setError("Paid amount cannot be negative.");
      return;
    }

    if (paid > totalPurchaseAmount) {
      setError("Paid amount cannot be greater than purchase amount.");
      return;
    }

    try {
      setSaving(true);
      const res = await fetch(`/api/admin/suppliers/${params.id}/purchases`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          supplierId: params.id,
          purchaseDate,
          invoiceNumber,
          books: books.map((book) => ({
            bookName: book.bookName.trim(),
            isbn: book.isbn.trim(),
            quantity: Number(book.quantity),
            mrp: Number(book.mrp) || 0,
            supplierRate: Number(book.supplierRate) || 0,
            discount: Number(book.discount) || 0,
            purchaseRate: Number(book.purchaseRate) || 0,
            sellingPrice: Number(book.sellingPrice) || 0,
          })),
          totalBooks,
          totalAmount: totalPurchaseAmount,
          totalSellingValue,
          expectedProfit,
          paidAmount: paid,
          balanceAmount: balance,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.message || "Failed to create purchase.");
        return;
      }
      router.push(`/admin/suppliers/${params.id}`);
    } catch (error) {
      console.error(error);
      setError("Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-create-purchase">Loading supplier...</div>
    );
  }

  if (!supplier) {
    return (
      <div className="admin-create-purchase">
        <div className="create-supplier-error">
          {error || "Supplier not found."}
        </div>

        <button
          type="button"
          onClick={() =>
            router.push("/admin/suppliers")
          }
          className="create-supplier-back-btn"
        >
          ← Back to Suppliers
        </button>
      </div>
    );
  }

  return (
    <div className="admin-create-purchase">
      <div className="create-purchase-header">
        <div>
          <h2>Add Purchase</h2>
          <p>
            Supplier:{" "}
            <strong>{supplier.name}</strong>
          </p>
          {supplier.companyName && (
            <p>{supplier.companyName}</p>
          )}
        </div>

        <div>
          <button
            type="button"
            onClick={() =>
              router.push(`/admin/suppliers/${params.id}`)
            }
            className="create-supplier-back-btn"
          >
            ← Back
          </button>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="create-purchase-form"
      >
        <div className="create-purchase-section">
          <h3>Purchase Information</h3>
          <div className="create-purchase-grid">
            <div className="create-purchase-field">
              <label>Purchase Date</label>
              <input
                type="date"
                value={purchaseDate}
                onChange={(e) =>
                  setPurchaseDate(e.target.value)
                }
              />
            </div>

            <div className="create-purchase-field">
              <label>Invoice / Bill Number</label>
              <input
                type="text"
                value={invoiceNumber}
                onChange={(e) =>
                  setInvoiceNumber(e.target.value)
                }
                placeholder="Example: INV-001"
              />
            </div>
          </div>
        </div>

        <div className="create-purchase-section">
          <div className="create-purchase-books-header">
            <h3>Books</h3>
            <button
              type="button"
              onClick={addBook}
              className="supplier-add-purchase-btn"
            >
              + Add Book
            </button>
          </div>

          {books.map((book, index) => (
            <div
              key={index}
              className="purchase-book-card"
            >
              <div className="purchase-book-title">
                <h4>Book {index + 1}</h4>
                {books.length > 1 && (
                  <button
                    type="button"
                    onClick={() =>
                      removeBook(index)
                    }
                    className="purchase-remove-book-btn"
                  >
                    Remove
                  </button>
                )}
              </div>
              <div className="create-purchase-grid">
                <div className="create-purchase-field">
                  <label>Book Name</label>
                  <input
                    type="text"
                    value={book.bookName}
                    onChange={(e) =>
                      updateBook(
                        index,
                        "bookName",
                        e.target.value
                      )}
                    placeholder="Book name"
                  />
                </div>

                <div className="create-purchase-field">
                  <label>ISBN</label>
                  <input
                    type="text"
                    value={book.isbn}
                    onChange={(e) =>
                      updateBook(
                        index,
                        "isbn",
                        e.target.value
                      )}
                    placeholder="ISBN"
                  />
                </div>

                <div className="create-purchase-field">
                  <label>Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={book.quantity}
                    onChange={(e) =>
                      updateBook(
                        index,
                        "quantity",
                        e.target.value
                      )}
                  />
                </div>

                <div className="create-purchase-field">
                  <label>MRP</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={book.mrp}
                    onChange={(e) =>
                      updateBook(
                        index,
                        "mrp",
                        e.target.value
                      )}
                    placeholder="₹"
                  />
                </div>

                <div className="create-purchase-field">
                  <label>Supplier Rate</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={book.supplierRate}
                    onChange={(e) =>
                      updateBook(
                        index,
                        "supplierRate",
                        e.target.value
                      )}
                    placeholder="₹"
                  />
                </div>

                <div className="create-purchase-field">
                  <label>Discount %</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={book.discount}
                    onChange={(e) =>
                      updateBook(
                        index,
                        "discount",
                        e.target.value
                      )}
                    placeholder="%"
                  />
                </div>

                <div className="create-purchase-field">
                  <label>Purchase Rate</label>
                  <input
                    type="number"
                    value={book.purchaseRate}
                    onChange={(e) =>
                      updateBook(
                        index,
                        "purchaseRate",
                        e.target.value
                      )}
                    placeholder="₹"
                  />
                </div>

                <div className="create-purchase-field">
                  <label>Selling Price</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={book.sellingPrice}
                    onChange={(e) =>
                      updateBook(
                        index,
                        "sellingPrice",
                        e.target.value
                      )}
                    placeholder="₹"
                  />
                </div>
              </div>

              <div className="purchase-book-calculation">
                <div>
                  <span>Total Cost</span>
                  <strong>Rs. {getBookTotal(book).toFixed(2)}</strong>
                </div>

                <div>
                  <span>Profit / Book</span>
                  <strong>Rs. {getBookProfit(book).toFixed(2)}</strong>
                </div>

                <div>
                  <span>Total Profit</span>
                  <strong>Rs. {(
                    getBookProfit(book) *
                    (Number(book.quantity) || 0)
                  ).toFixed(2)}
                  </strong>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="create-purchase-section">
          <h3>Purchase Total</h3>
          <div className="purchase-total-grid">
            <div>
              <span>Total Books</span>
              <strong>{totalBooks}</strong>
            </div>

            <div>
              <span>Total Purchase Cost</span>
              <strong>Rs. {totalPurchaseAmount.toFixed(2)}
              </strong>
            </div>

            <div>
              <span>Total Selling Value</span>
              <strong>Rs. {totalSellingValue.toFixed(2)}</strong>
            </div>

            <div>
              <span>Expected Profit</span>
              <strong>Rs. {expectedProfit.toFixed(2)}</strong>
            </div>
          </div>
        </div>

        <div className="create-purchase-section">
          <h3>Payment</h3>
          <div className="create-purchase-grid">
            <div className="create-purchase-field">
              <label>Paid Amount</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={paidAmount}
                onChange={(e) =>
                  setPaidAmount(e.target.value)
                }
                placeholder="₹"
              />
            </div>

            <div className="purchase-balance">
              <span>Balance Due</span>
              <strong>Rs {balance.toFixed(2)}</strong>
            </div>
          </div>
        </div>

        {error && (
          <div className="create-supplier-error">{error}</div>
        )}

        <div className="create-purchase-actions">
          <button
            type="button"
            onClick={() =>
              router.push(`/admin/suppliers/${params.id}`)
            }
            className="create-supplier-cancel-btn"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={saving}
            className="create-supplier-save-btn"
          >
            {saving ? "Saving..." : "Save Purchase"}
          </button>
        </div>
      </form>
    </div>
  );
}   