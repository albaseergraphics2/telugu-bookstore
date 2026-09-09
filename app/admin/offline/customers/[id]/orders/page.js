"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function OfflineCustomerOrdersPage() {
    const { id } = useParams();
    const router = useRouter();

    const [orders, setOrders] = useState([]);
    const [customer, setCustomer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);

    const ordersPerPage = 10;

    useEffect(() => {
        const fetchData = async () => {
            try {
                const ordersRes = await fetch(
                    `/api/admin/offline/customers/${id}/orders`
                );

                const ordersData = await ordersRes.json();

                if (ordersData.success) {
                    setOrders(ordersData.orders || []);
                    setCustomer(ordersData.customer || null);
                }
            } catch (error) {
                console.error(
                    "Error fetching offline customer orders:",
                    error
                );
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchData();
        }
    }, [id]);

    const indexOfLastOrder =
        currentPage * ordersPerPage;

    const indexOfFirstOrder =
        indexOfLastOrder - ordersPerPage;

    const currentOrders = orders.slice(
        indexOfFirstOrder,
        indexOfLastOrder
    );

    const totalPages = Math.ceil(
        orders.length / ordersPerPage
    );

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
            <Link href="/admin/offline/customers" className="back-home">
                ← Back to Customers
            </Link>

            <div className="users-header">
                <div>
                    <p>
                        <b>Name:</b>{" "}
                        {customer?.name || "-"}
                    </p>

                    <p>
                        <b>Phone:</b>{" "}
                        {customer?.phone || "-"}
                    </p>
                </div>

                <span>
                    Total Orders: {orders.length}
                </span>
            </div>

            {orders.length === 0 ? (
                <p>No orders found</p>
            ) : (
                <>
                    <div className="user-orders-desktop">

                        <div className="user-order-table-row user-order-table-header">
                            <div>Order No.</div>
                            <div>No. of Books</div>
                            <div>Amount</div>
                            <div>Delivery Type</div>
                            <div>Status</div>
                            <div>Total Amount</div>
                            <div>Invoice</div>
                        </div>

                        {currentOrders.map((order) => {

                            const booksCount =
                                order.items?.reduce(
                                    (total, item) =>
                                        total +
                                        (item.qty || 0),
                                    0
                                );

                            const amount =
                                Number(order.totalAmount) || 0;

                            const deliveryCharge =
                                Number(order.deliveryCharge) || 0;

                            const totalAmount =
                                amount + deliveryCharge;

                            return (
                                <div
                                    key={order._id}
                                    className="user-order-table-row"
                                >
                                    <div>
                                        {order.invoiceId ||
                                            order._id
                                                .slice(-6)
                                                .toUpperCase()}
                                    </div>

                                    <div>
                                        {booksCount}
                                    </div>

                                    <div>
                                        ₹{amount}
                                    </div>

                                    <div>
                                        {order.deliveryType ||
                                            "Not Set"}
                                    </div>

                                    <div>
                                        <span
                                            className={`user-order-status ${order.status?.toLowerCase() ||
                                                "pending"
                                                }`}
                                        >
                                            {order.status ||
                                                "Pending"}
                                        </span>
                                    </div>

                                    <div>
                                        <strong>
                                            ₹{totalAmount}
                                        </strong>
                                    </div>

                                    <div>
                                        <Link
                                            href={`/invoice-admin/${order._id}`}
                                        >
                                            <button className="user-order-invoice-btn">
                                                View Invoice
                                            </button>
                                        </Link>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="user-orders-mobile">

                        {currentOrders.map((order) => {

                            const booksCount =
                                order.items?.reduce(
                                    (total, item) =>
                                        total +
                                        (item.qty || 0),
                                    0
                                );

                            const amount =
                                Number(order.totalAmount) || 0;

                            const deliveryCharge =
                                Number(order.deliveryCharge) || 0;

                            const totalAmount =
                                amount + deliveryCharge;

                            return (
                                <div
                                    key={order._id}
                                    className="user-order-mobile-card"
                                >

                                    <div className="mobile-order-field">
                                        <span>
                                            Order No.
                                        </span>

                                        <strong>
                                            {order.invoiceId ||
                                                order._id
                                                    .slice(-6)
                                                    .toUpperCase()}
                                        </strong>
                                    </div>

                                    <div className="mobile-order-field">
                                        <span>
                                            No. of Books
                                        </span>

                                        <strong>
                                            {booksCount}
                                        </strong>
                                    </div>

                                    <div className="mobile-order-field">
                                        <span>
                                            Amount
                                        </span>

                                        <strong>
                                            ₹{amount}
                                        </strong>
                                    </div>

                                    <div className="mobile-order-field">
                                        <span>
                                            Delivery Type
                                        </span>

                                        <strong>
                                            {order.deliveryType ||
                                                "Not Set"}
                                        </strong>
                                    </div>

                                    <div className="mobile-order-field">
                                        <span>
                                            Status
                                        </span>

                                        <span
                                            className={`user-order-status ${order.status?.toLowerCase() ||
                                                "pending"
                                                }`}
                                        >
                                            {order.status ||
                                                "Pending"}
                                        </span>
                                    </div>

                                    <div className="mobile-order-field">
                                        <span>
                                            Total Amount
                                        </span>

                                        <strong>
                                            ₹{totalAmount}
                                        </strong>
                                    </div>

                                    <div className="mobile-order-invoice">
                                        <Link
                                            href={`/invoice-admin/${order._id}`}
                                        >
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

            {orders.length > 0 && (
                <div className="pagination">

                    <button
                        disabled={currentPage === 1}
                        onClick={() =>
                            setCurrentPage(
                                currentPage - 1
                            )
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
                            setCurrentPage(
                                currentPage + 1
                            )
                        }
                    >
                        Next
                    </button>

                </div>
            )}

        </div>
    );
}