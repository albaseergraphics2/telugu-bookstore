"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function PurchaseDetails() {
    const params = useParams();
    const router = useRouter();
    const [purchase, setPurchase] = useState(null);
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [paymentsLoading, setPaymentsLoading] = useState(true);
    const [error, setError] = useState("");
    const [showPaymentForm, setShowPaymentForm] = useState(false);
    const [paymentDate, setPaymentDate] = useState("");
    const [paymentAmount, setPaymentAmount] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("Cash");
    const [referenceNumber, setReferenceNumber] = useState("");
    const [paymentNotes, setPaymentNotes] = useState("");
    const [savingPayment, setSavingPayment] = useState(false);
    const [paymentError, setPaymentError] = useState("");
    const [paymentSuccess, setPaymentSuccess] = useState("");

    useEffect(() => {
        if (params?.id && params?.purchaseId) {
            fetchPurchase();
            fetchPayments();
        }
    }, [params?.id, params?.purchaseId]);

    const fetchPurchase = async () => {
        try {
            setLoading(true);
            const res = await fetch(`/api/admin/suppliers/${params.id}/purchases/${params.purchaseId}`);
            const data = await res.json();
            if (!res.ok || !data.success) {
                setError(data.message || "Failed to load purchase.");
                return;
            }
            setPurchase(data.purchase);
        } catch (error) {
            console.error(error);
            setError("Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    const fetchPayments = async () => {
        try {
            setPaymentsLoading(true);
            const res = await fetch(`/api/admin/suppliers/${params.id}/purchases/${params.purchaseId}/payments`);
            const data = await res.json();
            if (data.success) {
                setPayments(data.payments || []);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setPaymentsLoading(false);
        }
    };

    const openPaymentForm = () => {
        setPaymentError("");
        setPaymentSuccess("");
        const today = new Date()
            .toISOString()
            .split("T")[0];
        setPaymentDate(today);
        setPaymentAmount("");
        setPaymentMethod("Cash");
        setReferenceNumber("");
        setPaymentNotes("");
        setShowPaymentForm(true);
    };

    const savePayment = async (e) => {
        e.preventDefault();
        setPaymentError("");
        setPaymentSuccess("");

        if (!paymentDate) {
            setPaymentError("Payment date is required.");
            return;
        }
        if (
            !paymentAmount ||
            Number(paymentAmount) <= 0
        ) {
            setPaymentError("Enter a valid payment amount.");
            return;
        }

        const currentBalance = Number(purchase?.balanceAmount) || 0;

        if (Number(paymentAmount) > currentBalance) {
            setPaymentError(`Payment cannot be greater than balance amount ₹${currentBalance}.`);
            return;
        }

        try {
            setSavingPayment(true);
            const res = await fetch(
                `/api/admin/suppliers/${params.id}/purchases/${params.purchaseId}/payments`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        paymentDate,
                        amount: Number(paymentAmount),
                        paymentMethod,
                        referenceNumber,
                        notes: paymentNotes,
                    }),
                }
            );

            const data = await res.json();

            if (!res.ok || !data.success) {
                setPaymentError(data.message || "Failed to save payment.");
                return;
            }
            setPurchase(data.purchase);
            setPaymentSuccess("Payment added successfully.");
            setPaymentAmount("");
            setReferenceNumber("");
            setPaymentNotes("");
            await fetchPayments();
            setTimeout(() => {
                setShowPaymentForm(false);
                setPaymentSuccess("");
            }, 1000);
        } catch (error) {
            console.error(error);
            setPaymentError("Something went wrong.");
        } finally {
            setSavingPayment(false);
        }
    };

    if (loading) {
        return (
            <div className="admin-purchase-view">Loading purchase...</div>
        );
    }

    if (error) {
        return (
            <div className="admin-purchase-view">
                <div className="create-supplier-error">{error} </div>
                <button
                    type="button"
                    onClick={() =>
                        router.push(`/admin/suppliers/${params.id}`)
                    }
                    className="create-supplier-back-btn"
                >
                    ← Back to Supplier
                </button>
            </div>
        );
    }

    if (!purchase) {
        return (
            <div className="admin-purchase-view">
                <p>Purchase not found.</p>
                <button
                    type="button"
                    onClick={() =>
                        router.push(`/admin/suppliers/${params.id}`)
                    }
                    className="create-supplier-back-btn"
                >
                    ← Back to Supplier
                </button>
            </div>
        );
    }

    return (
        <div className="admin-purchase-view">
            {/* =========================================
                DESKTOP VIEW
            ========================================= */}
            <div className="purchase-desktop">
                <div className="supplier-view-header">
                    <div>
                        <h2>Purchase Details</h2>
                        <p>{purchase.invoiceNumber || "-"}</p>
                    </div>
                    <div className="supplier-header-actions">
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

                <div className="supplier-view-section">
                    <h3>Purchase Information </h3>

                    <div className="supplier-purchase-table">

                        <div className="supplier-purchase-row-book supplier-purchase-header">
                            <div>Purchase Date</div>
                            <div>Bill / Invoice Number</div>
                            <div>Total Books</div>
                            <div>Total Purchase Amount</div>
                            <div>Total Selling Value</div>
                            <div>Expected Profit</div>
                            <div>Paid Amount</div>
                            <div>Balance Amount</div>
                        </div>

                        <div className="supplier-purchase-row-book">

                            <div>
                                {purchase.purchaseDate
                                    ? new Date(
                                        purchase.purchaseDate
                                    ).toLocaleDateString("en-IN")
                                    : "-"}
                            </div>

                            <div>
                                {purchase.invoiceNumber || "-"}
                            </div>

                            <div>
                                {purchase.totalBooks || 0}
                            </div>

                            <div>
                                Rs. {purchase.totalAmount || 0}
                            </div>

                            <div>
                                Rs. {purchase.totalSellingValue || 0}
                            </div>

                            <div>
                                Rs. {purchase.expectedProfit || 0}
                            </div>

                            <div>
                                Rs. {purchase.paidAmount || 0}
                            </div>

                            <div>
                                Rs. {purchase.balanceAmount || 0}
                            </div>

                        </div>

                    </div>
                </div>

                <div className="supplier-view-section">
                    <h3>Book Details</h3>
                    <div className="supplier-purchase-table">
                        <div className="supplier-purchase-row-book supplier-purchase-header">
                            <div>Book Name</div>
                            <div>Quantity</div>
                            <div>MRP</div>
                            <div>Supplier Rate</div>
                            <div>Discount</div>
                            <div>Purchase Rate </div>
                            <div>Selling Price</div>
                            <div>Profit per Book</div>
                        </div>

                        {purchase.books?.length > 0 ? (
                            purchase.books.map(
                                (book, index) => (
                                    <div
                                        key={book._id || index}
                                        className="supplier-purchase-row-book"
                                    >
                                        <div>{book.bookName || book.name || "-"}</div>
                                        <div>{book.quantity || 0} </div>
                                        <div>Rs. {book.mrp || 0} </div>
                                        <div>Rs. {book.supplierRate || 0} </div>
                                        <div>{book.discount || 0} </div>
                                        <div>Rs. {book.purchaseRate || 0} </div>
                                        <div>Rs. {book.sellingPrice || 0} </div>
                                        <div>Rs. {book.profitPerBook || 0}</div>
                                    </div>
                                )
                            )
                        ) : (
                            <div className="supplier-no-purchases">No books found.</div>
                        )}
                    </div>
                </div>

                <div className="supplier-view-section">
                    <div className="supplier-section-header">
                        <h3>Payment Details</h3>
                        {Number(
                            purchase.balanceAmount
                        ) > 0 && (
                                <button
                                    type="button"
                                    onClick={openPaymentForm}
                                    className="supplier-add-purchase-btn"
                                >
                                    + Make Payment
                                </button>
                            )}
                    </div>
                    <div className="supplier-payment-grid">
                        <div>
                            <span>Paid Amount </span>
                            <strong>Rs. {purchase.paidAmount || 0}</strong>
                        </div>
                        <div>
                            <span> Balance Amount</span>
                            <strong>Rs.  {purchase.balanceAmount || 0}</strong>
                        </div>
                    </div>

                    {showPaymentForm && (
                        <form
                            onSubmit={savePayment}
                            className="supplier-payment-form"
                        >
                            <h4>Make Payment</h4>
                            {paymentError && (
                                <div className="create-supplier-error"> {paymentError}</div>
                            )}
                            {paymentSuccess && (
                                <div className="supplier-payment-success">{paymentSuccess}</div>
                            )}
                            <div className="supplier-payment-form-grid">
                                <div>
                                    <label>Payment Date</label>
                                    <input
                                        type="date"
                                        value={paymentDate}
                                        onChange={(e) =>
                                            setPaymentDate(e.target.value)
                                        }
                                        required
                                    />
                                </div>

                                <div>
                                    <label>Amount Paid</label>
                                    <input
                                        type="number"
                                        min="1"
                                        max={purchase.balanceAmount}
                                        step="0.01"
                                        value={paymentAmount}
                                        onChange={(e) =>
                                            setPaymentAmount(e.target.value)
                                        }
                                        placeholder="Enter amount"
                                        required
                                    />
                                </div>

                                <div>
                                    <label>Payment Method </label>
                                    <select
                                        value={paymentMethod}
                                        onChange={(e) =>
                                            setPaymentMethod(e.target.value)
                                        }
                                    >
                                        <option value="Cash">Cash</option>
                                        <option value="UPI">UPI</option>
                                        <option value="Bank Transfer">Bank Transfer</option>
                                        <option value="Cheque">Cheque</option>
                                        <option value="Other">Other </option>
                                    </select>
                                </div>

                                <div>
                                    <label>Reference Number</label>
                                    <input
                                        type="text"
                                        value={referenceNumber}
                                        onChange={(e) =>
                                            setReferenceNumber(e.target.value)
                                        }
                                        placeholder="Optional"
                                    />
                                </div>

                                <div className="supplier-payment-notes">
                                    <label>Notes</label>
                                    <textarea
                                        value={paymentNotes}
                                        onChange={(e) =>
                                            setPaymentNotes(e.target.value)
                                        }
                                        placeholder="Optional"
                                    />
                                </div>
                            </div>

                            <div className="supplier-payment-form-actions">
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowPaymentForm(false)
                                    }
                                    className="create-supplier-back-btn"
                                    disabled={savingPayment}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="supplier-add-purchase-btn"
                                    disabled={savingPayment}
                                >
                                    {savingPayment ? "Saving..." : "Save Payment"}
                                </button>
                            </div>
                        </form>
                    )}

                    <div className="supplier-payment-history">
                        <h4>Payment Historys</h4>
                        {paymentsLoading ? (
                            <p>Loading payments...</p>
                        ) : payments.length === 0 ? (
                            <p>No payments found.</p>
                        ) : (
                            <div className="supplier-purchase-table">
                                <div className="supplier-purchase-row supplier-purchase-header">
                                    <div>Payment Date</div>
                                    <div>Amount</div>
                                    <div>Payment Method</div>
                                    <div>Reference Number</div>
                                    <div>Notes</div>
                                </div>

                                {payments.map(
                                    (payment) => (
                                        <div
                                            key={payment._id}
                                            className="supplier-purchase-row"
                                        >
                                            <div>
                                                {payment.paymentDate
                                                    ? new Date(
                                                        payment.paymentDate
                                                    ).toLocaleDateString(
                                                        "en-IN"
                                                    )
                                                    : "-"}
                                            </div>

                                            <div>Rs.{payment.amount || 0}</div>
                                            <div>{payment.paymentMethod || "-"}</div>
                                            <div>{payment.referenceNumber || "-"}</div>
                                            <div>{payment.notes || "-"}</div>
                                        </div>
                                    )
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* =========================================
                MOBILE VIEW
            ========================================= */}

            <div className="purchase-mobile">
                <div className="supplier-view-header">
                    <div className="supplier-view-header-box">
                        <div>
                            <h2>Purchase Details</h2>
                            <p>{purchase.invoiceNumber || "-"}</p>
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
                </div>

                <div className="purchase-view-section">
                    <h3>Purchase Information</h3>
                    <div className="purchase-purchase-card">
                        <div className="purchase-purchase-card-box">
                            <span>Purchase Date</span>
                            <strong>
                                {purchase.purchaseDate
                                    ? new Date(
                                        purchase.purchaseDate
                                    ).toLocaleDateString(
                                        "en-IN"
                                    )
                                    : "-"}
                            </strong>
                        </div>

                        <div className="purchase-purchase-card-box">
                            <span>Bill / Invoice Number</span>
                            <strong>{purchase.invoiceNumber || "-"}</strong>
                        </div>

                        <div className="purchase-purchase-card-box">
                            <span>Total Books</span>
                            <strong>{purchase.totalBooks || 0}</strong>
                        </div>

                        <div className="purchase-purchase-card-box">
                            <span>Total Purchase Amount</span>
                            <strong>Rs. {purchase.totalAmount || 0}</strong>
                        </div>

                        <div className="purchase-purchase-card-box">
                            <span>Total Selling Value</span>
                            <strong>Rs. {purchase.totalSellingValue || 0}</strong>
                        </div>

                        <div className="purchase-purchase-card-box">
                            <span>Expected Profit</span>
                            <strong>Rs. {purchase.expectedProfit || 0}</strong>
                        </div>

                        <div className="purchase-purchase-card-box">
                            <span>Paid Amount</span>
                            <strong>Rs. {purchase.paidAmount || 0}
                            </strong>
                        </div>

                        <div className="purchase-purchase-card-box">
                            <span>Balance Amount</span>
                            <strong>Rs. {purchase.balanceAmount || 0}</strong>
                        </div>
                    </div>
                </div>

                <div className="purchase-view-section">
                    <h3>Book Details</h3>
                    {purchase.books?.length > 0 ? (
                        purchase.books.map(
                            (book, index) => (
                                <div
                                    key={book._id || index}
                                    className="purchase-purchase-card"
                                >
                                    <div className="purchase-purchase-card-box">
                                        <span>Book Name</span>
                                        <strong>{book.bookName || book.name || "-"}</strong>
                                    </div>

                                    <div className="purchase-purchase-card-box">
                                        <span>Quantity</span>
                                        <strong>{book.quantity || 0}</strong>
                                    </div>

                                    <div className="purchase-purchase-card-box">
                                        <span>MRP</span>
                                        <strong>Rs. {book.mrp || 0}</strong>
                                    </div>

                                    <div className="purchase-purchase-card-box">
                                        <span>Supplier Rate</span>
                                        <strong>Rs. {book.supplierRate || 0}</strong>
                                    </div>

                                    <div className="purchase-purchase-card-box">
                                        <span>Discount</span>
                                        <strong>{book.discount || 0}</strong>
                                    </div>

                                    <div className="purchase-purchase-card-box">
                                        <span>Purchase Rate</span>
                                        <strong>Rs. {book.purchaseRate || 0}</strong>
                                    </div>

                                    <div className="purchase-purchase-card-box">
                                        <span>Selling Price</span>
                                        <strong>Rs. {book.sellingPrice || 0}</strong>
                                    </div>

                                    <div className="purchase-purchase-card-box">
                                        <span>Profit per Book</span>
                                        <strong>Rs. {book.profitPerBook || 0}</strong>
                                    </div>
                                </div>
                            )
                        )
                    ) : (
                        <div className="purchase-no-purchases">No books found.</div>
                    )}
                </div>

                <div className="supplier-view-section">
                    <div className="supplier-section-header">
                        <h3>Payment Details</h3>
                        {Number(
                            purchase.balanceAmount
                        ) > 0 && (
                                <button
                                    type="button"
                                    onClick={openPaymentForm}
                                    className="supplier-add-purchase-btn"
                                >
                                    + Make Payment
                                </button>
                            )}
                    </div>

                    <div className="supplier-payment-grid">
                        <div>
                            <span>Paid Amount</span>
                            <strong>Rs. {purchase.paidAmount || 0}</strong>
                        </div>

                        <div>
                            <span>Balance Amount</span>
                            <strong>Rs. {purchase.balanceAmount || 0}</strong>
                        </div>
                    </div>

                    {showPaymentForm && (
                        <form
                            onSubmit={savePayment}
                            className="supplier-payment-form"
                        >
                            <h4>Make Payment</h4>
                            {paymentError && (
                                <div className="create-supplier-error">{paymentError}</div>

                            )}
                            {paymentSuccess && (
                                <div className="supplier-payment-success">{paymentSuccess}</div>
                            )}

                            <div className="supplier-payment-form-grid">
                                <div>
                                    <label>Payment Date</label>
                                    <input
                                        type="date"
                                        value={paymentDate}
                                        onChange={(e) =>
                                            setPaymentDate(e.target.value)
                                        }
                                        required
                                    />
                                </div>
                                <div>
                                    <label>Amount Paid</label>

                                    <input
                                        type="number"
                                        min="1"
                                        max={purchase.balanceAmount}
                                        step="0.01"
                                        value={paymentAmount}
                                        onChange={(e) =>
                                            setPaymentAmount(e.target.value)
                                        }
                                        placeholder="Enter amount"
                                        required
                                    />
                                </div>
                                <div>
                                    <label>Payment Method</label>
                                    <select
                                        value={paymentMethod}
                                        onChange={(e) =>
                                            setPaymentMethod(e.target.value)
                                        }
                                    >
                                        <option value="Cash">Cash</option>
                                        <option value="UPI">UPI</option>
                                        <option value="Bank Transfer">Bank Transfer</option>
                                        <option value="Cheque">Cheque</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label>Reference Number</label>
                                    <input
                                        type="text"
                                        value={referenceNumber}
                                        onChange={(e) =>
                                            setReferenceNumber(e.target.value)
                                        }
                                        placeholder="Optional"
                                    />
                                </div>

                                <div className="supplier-payment-notes">
                                    <label>Notes</label>
                                    <textarea
                                        value={paymentNotes}
                                        onChange={(e) =>
                                            setPaymentNotes(e.target.value)
                                        }
                                        placeholder="Optional"
                                    />
                                </div>
                            </div>

                            <div className="supplier-payment-form-actions">

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowPaymentForm(false)
                                    }
                                    className="create-supplier-back-btn"
                                    disabled={savingPayment}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="supplier-add-purchase-btn"
                                    disabled={savingPayment}
                                >
                                    {savingPayment ? "Saving..." : "Save Payment"}
                                </button>
                            </div>
                        </form>
                    )}

                    <div className="supplier-payment-history">
                        <h4>Payment History</h4>
                        {paymentsLoading ? (
                            <p>Loading payments...</p>
                        ) : payments.length === 0 ? (
                            <p>No payments found.</p>
                        ) : (
                            payments.map(
                                (payment) => (
                                    <div
                                        key={payment._id}
                                        className="purchase-purchase-card"
                                    >
                                        <div className="purchase-purchase-card-box">
                                            <span>Payment Date</span>
                                            <strong>
                                                {payment.paymentDate
                                                    ? new Date(
                                                        payment.paymentDate
                                                    ).toLocaleDateString(
                                                        "en-IN"
                                                    )
                                                    : "-"}
                                            </strong>
                                        </div>
                                        <div className="purchase-purchase-card-box">
                                            <span>Amount</span>
                                            <strong>Rs. {payment.amount || 0}</strong>
                                        </div>
                                        <div className="purchase-purchase-card-box">
                                            <span>Payment Method</span>
                                            <strong>{payment.paymentMethod || "-"}</strong>
                                        </div>
                                        <div className="purchase-purchase-card-box">
                                            <span>Reference Number</span>
                                            <strong>{payment.referenceNumber || "-"}</strong>
                                        </div>
                                        <div className="purchase-purchase-card-box">
                                            <span>Notes</span>
                                            <strong>{payment.notes || "-"}</strong>
                                        </div>
                                        <hr />
                                    </div>
                                )
                            )
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}