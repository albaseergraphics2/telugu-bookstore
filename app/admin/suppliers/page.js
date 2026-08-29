"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useRealtime } from "@/app/hooks/useRealtime";

export default function AdminSuppliers() {
    const router = useRouter();
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [suppliers, setSuppliers] = useState([]);

    const suppliersPerPage = 10;

    const fetchSuppliers = async () => {
        const res = await fetch("/api/admin/suppliers");
        const data = await res.json();
        if (data.success) {
            setSuppliers(data.suppliers);
        }
    };

    useRealtime(fetchSuppliers);

    const filteredSuppliers = suppliers.filter((supplier) =>
        supplier.name
            ?.toLowerCase()
            .includes(search.toLowerCase()) ||
        supplier.companyName
            ?.toLowerCase()
            .includes(search.toLowerCase()) ||
        supplier.phone?.includes(search)
    );

    const indexOfLastSupplier =
        currentPage * suppliersPerPage;

    const indexOfFirstSupplier =
        indexOfLastSupplier - suppliersPerPage;

    const currentSuppliers = filteredSuppliers.slice(
        indexOfFirstSupplier,
        indexOfLastSupplier
    );

    const totalPages = Math.ceil(
        filteredSuppliers.length / suppliersPerPage
    );

    return (
        <div className="admin-users">
            <div className="admin-users-header">
                <h2>Suppliers</h2>

                <span>
                    Total: {filteredSuppliers.length}
                </span>

                <button
                    onClick={() => router.push("/admin/suppliers/create")}
                    className="create-supplier-btn"
                >
                    Create New Supplier
                </button>
            </div>

            <div
                style={{ marginBottom: "15px" }}
                className="search-box"
            >
                <input
                    type="text"
                    placeholder="Search..."
                    value={search}
                    onChange={(e) => {
                        setSearch(e.target.value);
                        setCurrentPage(1);
                    }}
                    style={{
                        padding: "8px",
                        width: "250px",
                    }}
                />
            </div>

            <div className="users-table">
                <div className="supplier-table-row table-header">
                    <div>Supplier Name</div>
                    <div>Company / Publisher Name</div>
                    <div>Phone</div>
                    <div>Total Purchases</div>
                    <div>Paid</div>
                    <div>Balance</div>
                    <div>Action</div>
                </div>

                {currentSuppliers.map((supplier) => (
                    <div
                        key={supplier._id}
                        className="supplier-table-row"
                    >
                        <div>
                            {supplier.name || "-"}
                        </div>
                        <div>
                            {supplier.companyName || "-"}
                        </div>
                        <div>
                            {supplier.phone || "-"}
                        </div>
                        <div>
                            Rs. {supplier.totalPurchases || 0}
                        </div>
                        <div>
                            Rs. {supplier.totalPaid || 0}
                        </div>
                        <div>
                            Rs. {supplier.totalDue || 0}
                        </div>
                        <div>
                            <button
                                onClick={() =>
                                    router.push(
                                        `/admin/suppliers/${supplier._id}`
                                    )
                                }
                                className="adminuserorderlist"
                            >
                                View Details
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* MOBILE SUPPLIERS */}

            <div className="users-mobile">
                {currentSuppliers.map((supplier) => (
                    <div
                        key={supplier._id}
                        className="user-mobile-card"
                    >
                        <div className="supplier-user-mobile-row">
                            <span>
                                Supplier Name
                            </span>
                            <strong>
                                {supplier.name || "-"}
                            </strong>
                        </div>

                        <div className="supplier-user-mobile-row">
                            <span>
                                Company / Publisher Name
                            </span>
                            <strong>
                                {supplier.companyName || "-"}
                            </strong>
                        </div>

                        <div className="supplier-user-mobile-row">
                            <span>
                                Phone
                            </span>
                            <strong>
                                {supplier.phone || "-"}
                            </strong>
                        </div>

                        <div className="supplier-user-mobile-row">
                            <span>
                                Total Purchases
                            </span>
                            <strong>
                                Rs. {supplier.totalPurchases || 0}
                            </strong>
                        </div>

                        <div className="supplier-user-mobile-row">
                            <span>
                                Paid
                            </span>
                            <strong>
                                Rs. {supplier.totalPaid || 0}
                            </strong>
                        </div>

                        <div className="supplier-user-mobile-row">
                            <span>
                                Balance
                            </span>
                            <strong>
                                Rs. {supplier.totalDue || 0}
                            </strong>
                        </div>

                        <div className="supplier-user-mobile-row">
                            <button
                                onClick={() =>
                                    router.push(
                                        `/admin/suppliers/${supplier._id}`
                                    )
                                }
                                className="adminuserorderlist"
                            >
                                View
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="pagination">
                <button
                    disabled={currentPage === 1}
                    onClick={() =>
                        setCurrentPage(currentPage - 1)
                    }
                >
                    Prev
                </button>

                <span
                    style={{
                        margin: "0 10px",
                    }}
                >
                    Page {currentPage} of{" "}
                    {totalPages || 1}
                </span>

                <button
                    disabled={
                        currentPage === totalPages ||
                        totalPages === 0
                    }
                    onClick={() =>
                        setCurrentPage(currentPage + 1)
                    }
                >
                    Next
                </button>
            </div>
        </div>
    );
}