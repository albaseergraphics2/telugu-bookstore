"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function UserOrdersPage() {
    const { id } = useParams();
    const [orders, setOrders] = useState([]);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const ordersPerPage = 10;

    useEffect(() => {
        const fetchData = async () => {
            try {
                const ordersRes = await fetch(`/api/orders?userId=${id}`);
                const ordersData = await ordersRes.json();
                if (ordersData.success) {
                    setOrders(ordersData.orders);
                }
                const usersRes = await fetch("/api/admin/users");
                const usersData = await usersRes.json();
                if (usersData.success) {
                    const foundUser = usersData.users.find(
                        (user) => user._id === id
                    );
                    setUser(foundUser || null);
                }
            } catch (error) {
                console.error("Error fetching user orders:", error);
            } finally {
                setLoading(false);
            }
        };
        if (id) {
            fetchData();
        }
    }, [id]);


    /* PAGINATION */
    const indexOfLastOrder = currentPage * ordersPerPage;
    const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
    const currentOrders = orders.slice(indexOfFirstOrder, indexOfLastOrder);
    const totalPages = Math.ceil(orders.length / ordersPerPage);


    /* LOADING */
    if (loading) {
        return (
            <div
                style={{
                    textAlign: "center",
                    marginTop: "100px",
                }}
            >
                <div className="loader"></div>
                <p>Loading orders...</p>
            </div>
        );
    }

    return (
        <div className="admin-user-orders">
            <Link href="/admin/users" className="back-home">
                ← Back to Users
            </Link>
            <div className="users-header">
                <div>
                    <p><b>Name:</b>{" "} {user?.name || "-"}</p>
                    <p><b>Phone:</b>{" "} {user?.phone || "-"}</p>
                </div>
                <span>Total Orders: {orders.length}</span>
            </div>

            {orders.length === 0 ? (
                <p>No orders found</p>
            ) : (
                <>
                    {/* DESKTOP ORDERS */}
                    <div className="user-orders-desktop">
                        {/* DESKTOP HEADER */}
                        <div className="user-order-table-row user-order-table-header">
                            <div>Order No.</div>
                            <div>No. of Books</div>
                            <div>Amount</div>
                            <div>Delivery Type</div>
                            <div>Status</div>
                            <div>Total Amount</div>
                            <div>Invoice</div>
                        </div>

                        {/* DESKTOP ORDERS */}
                        {currentOrders.map((order) => {
                            const booksCount =
                                order.items?.reduce(
                                    (total, item) => total + (item.qty || 0), 0
                                );
                            const amount = order.totalAmount || 0;
                            const deliveryCharge = order.deliveryCharge || 0;
                            const totalAmount = amount + deliveryCharge;

                            return (
                                <div key={order._id} className="user-order-table-row">
                                    {/* ORDER NUMBER */}
                                    <div>
                                        {order.invoiceId ||
                                            order._id
                                                .slice(-6)
                                                .toUpperCase()}
                                    </div>
                                    <div>{booksCount}</div>
                                    <div>Rs. {amount}</div>
                                    <div>{order.deliveryType || "Not Set"}</div>
                                    <div>
                                        <span
                                            className={`user-order-status ${order.status?.toLowerCase()}`}
                                        >
                                            {order.status || "Pending"}
                                        </span>
                                    </div>
                                    <div>
                                        <strong>Rs. {totalAmount}</strong>
                                    </div>
                                    <div>
                                        <Link href={`/invoice-admin/${order._id}`}>
                                            <button className="user-order-invoice-btn">
                                                View Invoice
                                            </button>
                                        </Link>
                                    </div>
                                </div>
                            );
                        })}
                    </div>


                    {/* MOBILE ORDERS */}
                    <div className="user-orders-mobile">
                        {currentOrders.map((order) => {
                            const booksCount =
                                order.items?.reduce(
                                    (total, item) =>
                                        total +
                                        (item.qty || 0),
                                    0
                                );
                            const amount = order.totalAmount || 0;
                            const deliveryCharge = order.deliveryCharge || 0;
                            const totalAmount = amount + deliveryCharge;
                            return (
                                <div
                                    key={order._id}
                                    className="user-order-mobile-card"
                                >
                                    <div className="mobile-order-field">
                                        <span>Order No.</span>
                                        <strong>
                                            {order.invoiceId ||
                                                order._id
                                                    .slice(-6)
                                                    .toUpperCase()}
                                        </strong>
                                    </div>
                                    <div className="mobile-order-field">
                                        <span>No. of Books</span>
                                        <strong>{booksCount}</strong>
                                    </div>
                                    <div className="mobile-order-field">
                                        <span>Amount</span>
                                        <strong>Rs. {amount}</strong>
                                    </div>
                                    <div className="mobile-order-field">
                                        <span>Delivery Type</span>
                                        <strong>{order.deliveryType || "Not Set"}</strong>
                                    </div>
                                    <div className="mobile-order-field">
                                        <span>Status</span>
                                        <span
                                            className={`user-order-status ${order.status?.toLowerCase()}`}
                                        >
                                            {order.status || "Pending"}
                                        </span>
                                    </div>
                                    <div className="mobile-order-field">
                                        <span>Total Amount</span>
                                        <strong>Rs. {totalAmount}</strong>
                                    </div>
                                    <div className="mobile-order-invoice">
                                        <Link href={`/invoice-admin/${order._id}`}>
                                            <button className="user-order-invoice-btn">
                                                View Invoice
                                            </button>
                                        </Link>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </>
            )}

            {/* PAGINATION  */}
            {orders.length > 0 && (
                <div className="pagination">
                    <button
                        disabled={currentPage === 1}
                        onClick={() =>
                            setCurrentPage(currentPage - 1)
                        }
                    >
                        Prev
                    </button>
                    <span>
                        Page {currentPage} of{" "}
                        {totalPages || 1}
                    </span>
                    <button
                        disabled={
                            currentPage === totalPages || totalPages === 0
                        }
                        onClick={() =>
                            setCurrentPage(currentPage + 1)
                        }
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
}