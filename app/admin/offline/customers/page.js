"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function OfflineCustomers() {
    const router = useRouter();
    const [customers, setCustomers] = useState([]);
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const customersPerPage = 10;

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        try {
            const res = await fetch("/api/admin/offline/customers");
            const data = await res.json();
            if (data.success) {
                setCustomers(data.customers);
            }
        } catch (error) {
            console.error("Failed to fetch offline customers:", error);
        }
    };

    /* FILTER CUSTOMERS */
    const filteredCustomers = customers.filter((customer) =>
        customer.name
            ?.toLowerCase()
            .includes(search.toLowerCase()) ||
        customer.phone
            ?.includes(search) ||
        customer.address?.full
            ?.toLowerCase()
            .includes(search.toLowerCase()) ||
        customer.address?.pincode
            ?.includes(search)
    );

    /* PAGINATION */
    const indexOfLastCustomer = currentPage * customersPerPage;
    const indexOfFirstCustomer = indexOfLastCustomer - customersPerPage;
    const currentCustomers =
        filteredCustomers.slice(
            indexOfFirstCustomer,
            indexOfLastCustomer
        );
    const totalPages = Math.ceil(filteredCustomers.length / customersPerPage);

    return (
        <div className="admin-users">
            <div className="users-header">
                <h2>Offline Customers</h2>
                <span>Total: {filteredCustomers.length}</span>
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
                    style={{ padding: "8px", width: "250px", }}
                />
            </div>

            <div className="users-table">
                <div className="table-row table-header">
                    <div>Name</div>
                    <div>Phone</div>
                    <div>Address</div>
                    <div>Area</div>
                    <div>District</div>
                    <div>State</div>
                    <div>Pincode</div>
                    <div>Orders</div>
                    <div>Total</div>
                    <div>Action</div>
                </div>

                {currentCustomers.map((customer) => (
                    <div
                        key={customer._id}
                        className="table-row"
                    >
                        <div>{customer.name || "-"}</div>
                        <div>{customer.phone || "-"}</div>
                        <div>{customer.address?.full || "-"}</div>
                        <div>{customer.address?.area || "-"}</div>
                        <div>{customer.address?.district || "-"}</div>
                        <div>{customer.address?.state || "-"}</div>
                        <div>{customer.address?.pincode || "-"}</div>
                        <div>{customer.ordersCount || 0}</div>
                        <div>Rs. {customer.totalAmount || 0}</div>
                        <div>
                            <button
                                onClick={() =>
                                    router.push(`/admin/offline/customers/${customer._id}/orders`)
                                }
                                className="adminuserorderlist"
                            >
                                View Orders
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* MOBILE */}
            <div className="users-mobile">
                {currentCustomers.map((customer) => (
                    <div
                        key={customer._id}
                        className="user-mobile-card"
                    >
                        <div className="user-mobile-row">
                            <span>Name</span>
                            <strong>{customer.name || "-"}</strong>
                        </div>
                        <div className="user-mobile-row">
                            <span>Phone</span>
                            <strong>{customer.phone || "-"}</strong>
                        </div>
                        <div className="user-mobile-row">
                            <span>Address</span>
                            <strong>{customer.address?.full || "-"}</strong>
                        </div>
                        <div className="user-mobile-row">
                            <span>Area</span>
                            <strong>{customer.address?.area || "-"}</strong>
                        </div>
                        <div className="user-mobile-row">
                            <span>District</span>
                            <strong>{customer.address?.district || "-"}</strong>
                        </div>
                        <div className="user-mobile-row">
                            <span>State</span>
                            <strong>{customer.address?.state || "-"}</strong>
                        </div>
                        <div className="user-mobile-row">
                            <span>Pincode</span>
                            <strong>{customer.address?.pincode || "-"}</strong>
                        </div>
                        <div className="user-mobile-row">
                            <span>Orders</span>
                            <strong>{customer.ordersCount || 0}</strong>
                        </div>
                        <div className="user-mobile-row">
                            <span>Total</span>
                            <strong>Rs. {customer.totalAmount || 0}</strong>
                        </div>

                        <div className="user-mobile-action">
                            <button
                                onClick={() =>
                                    router.push(`/admin/offline/customers/${customer._id}/orders`)
                                }
                                className="adminuserorderlist"
                            >
                                View Orders
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* PAGINATION */}
            <div className="pagination">
                <button
                    disabled={currentPage === 1}
                    onClick={() =>
                        setCurrentPage(currentPage - 1)
                    }
                >
                    Prev
                </button>
                <span style={{ margin: "0 10px", }}>
                    Page {currentPage} of{" "}{totalPages || 1}
                </span>
                <button
                    disabled={currentPage === totalPages ||totalPages === 0}
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