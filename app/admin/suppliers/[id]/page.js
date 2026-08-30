"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useRealtime } from "../../../hooks/useRealtime";

export default function SupplierDetails() {
    const params = useParams();
    const router = useRouter();
    const supplierId = params.id;
    const purchaseId = params.purchaseId;
    const [purchases, setPurchases] = useState([]);
    const [supplier, setSupplier] = useState(null);
    const [loading, setLoading] = useState(true);
    const [payments, setPayments] = useState([]);
    const [error, setError] = useState("");

    useEffect(() => {
        if (params?.id) {
            fetchSupplier();
        }
    }, [params?.id]);

    useRealtime(() => {
        fetchSupplier();
        fetchPurchases();
        fetchPayments();
    });

    const fetchPayments = async () => {
        const res = await fetch(
            `/api/admin/suppliers/${params.id}/payments`
        );
        const data = await res.json();
        if (data.success) {
            setPayments(data.payments);
        }
    };

    const fetchSupplier = async () => {
        try {
            setLoading(true);
            const res = await fetch(
                `/api/admin/suppliers/${params.id}`
            );
            const data = await res.json();
            if (!res.ok || !data.success) {
                setError(
                    data.message || "Failed to load supplier."
                );
                return;
            }
            setSupplier(data.supplier);
        } catch (error) {
            console.error(error);
            setError("Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    const fetchPurchases = async () => {
        const res = await fetch(
            `/api/admin/suppliers/${params.id}/purchases`
        );
        const data = await res.json();
        if (data.success) {
            setPurchases(data.purchases);
        }
    };

    if (loading) {
        return (
            <div className="admin-supplier-view">
                Loading supplier...
            </div>
        );
    }

    if (error) {
        return (
            <div className="admin-supplier-view">
                <div className="create-supplier-error">
                    {error}
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

    if (!supplier) {
        return (
            <div className="admin-supplier-view">
                <p>Supplier not found.</p>

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

    const totalBooksPurchased = purchases.reduce(
        (total, purchase) =>
            total + (purchase.totalBooks || 0),
        0
    );

    const totalPurchaseAmount = purchases.reduce(
        (total, purchase) =>
            total + (purchase.totalAmount || 0),
        0
    );

    const totalPaid = purchases.reduce(
        (total, purchase) =>
            total + (purchase.paidAmount || 0),
        0
    );

    const totalBalance = purchases.reduce(
        (total, purchase) =>
            total + (purchase.balanceAmount || 0),
        0
    );

    const handleDeletePurchase = async (purchaseId) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this purchase?"
        );

        if (!confirmed) {
            return;
        }

        try {
            const res = await fetch(
                `/api/admin/suppliers/${supplier._id}/purchases/${purchaseId}`,
                {
                    method: "DELETE",
                }
            );

            const text = await res.text();

            let data = {};

            if (text) {
                try {
                    data = JSON.parse(text);
                } catch (error) {
                    console.error("Invalid JSON response:", text);
                }
            }

            if (!res.ok || !data.success) {
                alert(
                    data.message ||
                    "Failed to delete purchase."
                );
                return;
            }

            setPurchases((prev) =>
                prev.filter(
                    (purchase) =>
                        purchase._id !== purchaseId
                )
            );

        } catch (error) {
            console.error(
                "DELETE PURCHASE ERROR:",
                error
            );

            alert("Something went wrong.");
        }
    };

    return (
        <div className="admin-supplier-view">

            {/* DESKTOP VIEW*/}

            <div className="supplier-desktop">

                {/* HEADER */}

                <div className="supplier-view-header">
                    <div></div>
                    <div className="supplier-header-actions">
                        <button
                            type="button"
                            onClick={() =>
                                router.push("/admin/suppliers")
                            }
                            className="create-supplier-back-btn"
                        >
                            ← Back
                        </button>
                    </div>
                </div>

                <div className="supplier-view-section">
                    <div className="Supplier-Information">
                        <h3>
                            Supplier Information
                        </h3>
                        <button
                            type="button"
                            onClick={() =>
                                router.push(
                                    `/admin/suppliers/${supplier._id}/edit`
                                )
                            }
                            className="supplier-edit-btn"
                        >
                            Edit Supplier
                        </button>
                    </div>

                    <div className="supplier-view-grid">
                        <div>
                            <span>
                                Supplier Name
                            </span>
                            <strong>
                                {supplier.name || "-"}
                            </strong>
                        </div>

                        <div>
                            <span>
                                Company / Publisher Name
                            </span>
                            <strong>
                                {supplier.companyName || "-"}
                            </strong>
                        </div>

                        <div>
                            <span>
                                Supplier Type
                            </span>
                            <strong>
                                {supplier.supplierType || "-"}
                            </strong>
                        </div>

                        <div>
                            <span>
                                Phone
                            </span>
                            <strong>
                                {supplier.phone || "-"}
                            </strong>
                        </div>

                        <div>
                            <span>
                                Alternate Phone
                            </span>
                            <strong>
                                {supplier.alternatePhone || "-"}
                            </strong>
                        </div>

                        <div>
                            <span>
                                Email
                            </span>
                            <strong>
                                {supplier.email || "-"}
                            </strong>
                        </div>

                        <div>
                            <span>
                                GST Number
                            </span>
                            <strong>
                                {supplier.gstNumber || "-"}
                            </strong>
                        </div>
                    </div>
                </div>

                <div className="supplier-view-section">
                    <div className="supplier-view-grid">
                        <div>
                            <span>
                                Address
                            </span>
                            <strong>
                                {supplier.address?.full || "-"}
                            </strong>
                        </div>

                        <div>
                            <span>
                                Area
                            </span>
                            <strong>
                                {supplier.address?.area || "-"}
                            </strong>
                        </div>

                        <div>
                            <span>
                                District
                            </span>
                            <strong>
                                {supplier.address?.district || "-"}
                            </strong>
                        </div>

                        <div>
                            <span>
                                State
                            </span>
                            <strong>
                                {supplier.address?.state || "-"}
                            </strong>
                        </div>

                        <div>
                            <span>
                                Pincode
                            </span>
                            <strong>
                                {supplier.address?.pincode || "-"}
                            </strong>
                        </div>
                    </div>
                </div>

                <div className="supplier-view-section">
                    <h3>
                        Purchase Summary
                    </h3>
                    <div className="supplier-payment-grid">
                        <div>
                            <span>
                                Total Purchase Amount
                            </span>
                            <strong>
                                ₹{supplier.totalPurchases || totalPurchaseAmount || 0}
                            </strong>
                        </div>

                        <div>
                            <span>
                                Total Books Purchased
                            </span>
                            <strong>
                                {totalBooksPurchased}
                            </strong>
                        </div>

                        <div>
                            <span>
                                Total Paid
                            </span>
                            <strong>
                                ₹{supplier.totalPaid || totalPaid || 0}
                            </strong>
                        </div>

                        <div>
                            <span>
                                Total Balance
                            </span>
                            <strong>
                                ₹{supplier.totalDue || totalBalance || 0}
                            </strong>
                        </div>

                        <div>
                            <span>
                                Total Purchase Bills
                            </span>
                            <strong>
                                {purchases.length}
                            </strong>
                        </div>

                        <div>
                            <span>
                                Last Purchase Date
                            </span>
                            <strong>
                                {purchases.length > 0 && purchases[0]?.purchaseDate
                                    ? new Date(
                                        purchases[0].purchaseDate
                                    ).toLocaleDateString("en-IN")
                                    : "-"}
                            </strong>
                        </div>

                        <div>
                            <span>
                                Last Payment Date
                            </span>
                            <strong>
                                {payments.length > 0 && payments[0]?.paymentDate
                                    ? new Date(
                                        payments[0].paymentDate
                                    ).toLocaleDateString("en-IN")
                                    : "-"}
                            </strong>
                        </div>
                    </div>
                </div>

                <div className="supplier-view-section">
                    <div className="supplier-section-header">
                        <h3>
                            Purchase History
                        </h3>
                        <button
                            type="button"
                            onClick={() =>
                                router.push(
                                    `/admin/suppliers/${supplier._id}/purchases/create`
                                )
                            }
                            className="supplier-add-purchase-btn"
                        >
                            + Add Purchase
                        </button>
                    </div>

                    <div className="supplier-purchase-table">
                        <div className="supplier-purchase-row supplier-purchase-header">
                            <div>
                                Purchase Date
                            </div>
                            <div>
                                Bill No
                            </div>
                            <div>
                                Total Books
                            </div>
                            <div>
                                Total Amount
                            </div>
                            <div>
                                Paid
                            </div>
                            <div>
                                Balance
                            </div>
                            <div>
                                Action
                            </div>
                        </div>

                        {purchases.length === 0 ? (
                            <div className="supplier-no-purchases">
                                No purchases found.
                            </div>
                        ) : (
                            purchases.map((purchase) => (
                                <div
                                    key={purchase._id}
                                    className="supplier-purchase-row"
                                >
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
                                        ₹{purchase.totalAmount || 0}
                                    </div>
                                    <div>
                                        ₹{purchase.paidAmount || 0}
                                    </div>
                                    <div>
                                        ₹{purchase.balanceAmount || 0}
                                    </div>
                                    <div>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                router.push(
                                                    `/admin/suppliers/${supplier._id}/purchases/${purchase._id}`
                                                )
                                            }
                                            className="supplier-view-btn"
                                        >
                                            View
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleDeletePurchase(purchase._id)
                                            }
                                            className="supplier-delete-btn"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {supplier.notes && (
                    <div className="supplier-view-section">
                        <h3>
                            Notes
                        </h3>
                        <p className="supplier-view-notes">
                            {supplier.notes}
                        </p>
                    </div>
                )}
            </div>

            {/* ==================================================
                MOBILE VIEW
            ================================================== */}

            <div className="supplier-mobile">
                <div className="supplier-view-header">
                    <div className="supplier-view-header-box">
                        <div>
                            <h2>
                                {supplier.name || "Supplier"}
                            </h2>
                            <p>
                                {supplier.companyName || "-"}
                            </p>
                        </div>

                        <div>
                            <button
                                type="button"
                                onClick={() =>
                                    router.push("/admin/suppliers")
                                }
                                className="create-supplier-back-btn"
                            >
                                ← Back
                            </button>
                        </div>
                    </div>
                </div>

                <div className="supplier-view-section">
                    <h3>
                        Purchase Summary
                    </h3>
                    <div className="supplier-payment-grid">
                        <div>
                            <span>
                                Total Purchase Amount
                            </span>
                            <strong>
                                ₹{supplier.totalPurchases || totalPurchaseAmount || 0}
                            </strong>
                        </div>

                        <div>
                            <span>
                                Total Books Purchased
                            </span>
                            <strong>
                                {totalBooksPurchased}
                            </strong>
                        </div>

                        <div>
                            <span>
                                Total Paid
                            </span>
                            <strong>
                                ₹{supplier.totalPaid || totalPaid || 0}
                            </strong>
                        </div>

                        <div>
                            <span>
                                Total Balance
                            </span>
                            <strong>
                                ₹{supplier.totalDue || totalBalance || 0}
                            </strong>
                        </div>

                        <div>
                            <span>
                                Total Purchase Bills
                            </span>
                            <strong>
                                {purchases.length}
                            </strong>
                        </div>

                        <div>
                            <span>
                                Last Purchase Date
                            </span>
                            <strong>
                                {purchases.length > 0
                                    ? new Date(
                                        purchases[0].purchaseDate
                                    ).toLocaleDateString("en-IN")
                                    : "-"}
                            </strong>
                        </div>

                        <div>
                            <span>
                                Last Payment Date
                            </span>
                            <strong>
                                {purchases.length > 0 &&
                                    purchases[0].paymentDate
                                    ? new Date(
                                        purchases[0].paymentDate
                                    ).toLocaleDateString("en-IN")
                                    : "-"}
                            </strong>
                        </div>
                    </div>
                </div>

                <div className="supplier-view-section">
                    <div className="supplier-section-header">
                        <h3>
                            Purchase History
                        </h3>

                        <button
                            type="button"
                            onClick={() =>
                                router.push(
                                    `/admin/suppliers/${supplier._id}/purchases/create`
                                )
                            }
                            className="supplier-add-purchase-btn"
                        >
                            + Add Purchase
                        </button>
                    </div>

                    <div className="supplier-purchase-mobile">
                        {purchases.length === 0 ? (
                            <div className="supplier-no-purchases">
                                No purchases found.
                            </div>
                        ) : (
                            purchases.map((purchase) => (
                                <div
                                    key={purchase._id}
                                    className="supplier-purchase-card"
                                >
                                    <div>
                                        <span>
                                            Purchase Date
                                        </span>
                                        <strong>
                                            {purchase.purchaseDate
                                                ? new Date(
                                                    purchase.purchaseDate
                                                ).toLocaleDateString("en-IN")
                                                : "-"}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>
                                            Bill No
                                        </span>
                                        <strong>
                                            {purchase.invoiceNumber || "-"}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>
                                            Total Books
                                        </span>
                                        <strong>
                                            {purchase.totalBooks || 0}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>
                                            Total Amount
                                        </span>
                                        <strong>
                                            ₹{purchase.totalAmount || 0}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>
                                            Paid
                                        </span>
                                        <strong>
                                            ₹{purchase.paidAmount || 0}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>
                                            Balance
                                        </span>
                                        <strong>
                                            ₹{purchase.balanceAmount || 0}
                                        </strong>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            router.push(
                                                `/admin/suppliers/${supplier._id}/purchases/${purchase._id}`
                                            )
                                        }
                                        className="supplier-view-btn"
                                    >
                                        View Purchase
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <hr />

                <div className="supplier-view-section">
                    <h3>
                        Supplier Information
                    </h3>
                    <div className="supplier-view-grid">
                        <div className="supplier-view-grid-box">
                            <span>
                                Supplier Name
                            </span>
                            <strong>
                                {supplier.name || "-"}
                            </strong>
                        </div>

                        <div className="supplier-view-grid-box">
                            <span>
                                Company / Publisher Name
                            </span>
                            <strong>
                                {supplier.companyName || "-"}
                            </strong>
                        </div>

                        <div className="supplier-view-grid-box">
                            <span>
                                Supplier Type
                            </span>
                            <strong>
                                {supplier.supplierType || "-"}
                            </strong>
                        </div>

                        <div className="supplier-view-grid-box">
                            <span>
                                Phone
                            </span>
                            <strong>
                                {supplier.phone || "-"}
                            </strong>
                        </div>

                        <div className="supplier-view-grid-box">
                            <span>
                                Alternate Phone
                            </span>
                            <strong>
                                {supplier.alternatePhone || "-"}
                            </strong>
                        </div>

                        <div className="supplier-view-grid-box">
                            <span>
                                Email
                            </span>
                            <strong>
                                {supplier.email || "-"}
                            </strong>
                        </div>

                        <div className="supplier-view-grid-box">
                            <span>
                                GST Number
                            </span>
                            <strong>
                                {supplier.gstNumber || "-"}
                            </strong>
                        </div>
                    </div>
                </div>

                <div className="supplier-view-section">
                    <h3>
                        Address
                    </h3>
                    <div className="supplier-view-grid">

                        <div className="supplier-view-grid-box">
                            <span>
                                Address
                            </span>
                            <strong>
                                {supplier.address?.full || "-"}
                            </strong>
                        </div>

                        <div className="supplier-view-grid-box">
                            <span>
                                Area
                            </span>
                            <strong>
                                {supplier.address?.area || "-"}
                            </strong>
                        </div>

                        <div className="supplier-view-grid-box">
                            <span>
                                District
                            </span>
                            <strong>
                                {supplier.address?.district || "-"}
                            </strong>
                        </div>

                        <div className="supplier-view-grid-box">
                            <span>
                                State
                            </span>
                            <strong>
                                {supplier.address?.state || "-"}
                            </strong>
                        </div>

                        <div className="supplier-view-grid-box">
                            <span>
                                Pincode
                            </span>
                            <strong>
                                {supplier.address?.pincode || "-"}
                            </strong>
                        </div>
                    </div>
                </div>

                <div className="supplier-header-actions">
                    <button
                        type="button"
                        onClick={() =>
                            router.push(
                                `/admin/suppliers/${supplier._id}/edit`
                            )
                        }
                        className="supplier-edit-btn"
                    >
                        Edit Supplier
                    </button>
                </div>

                {supplier.notes && (
                    <div className="supplier-view-section">
                        <h3>
                            Notes
                        </h3>
                        <p className="supplier-view-notes">
                            {supplier.notes}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}