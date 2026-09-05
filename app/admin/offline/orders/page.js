"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import useRealtime from "../../../hooks/useRealtime";

export default function OfflineOrders() {
    const [orders, setOrders] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [orderFilter, setOrderFilter] = useState("all");
    const [selectedDate, setSelectedDate] = useState("");
    const [orderSearch, setOrderSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const today = new Date().toISOString().split("T")[0];
    const ordersPerPage = 10;

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const res = await fetch("/api/admin/offline/orders", {
                method: "GET",
                cache: "no-store",
            });
            const data = await res.json();
            if (!res.ok || !data.success) {
                throw new Error(data.message || "Failed to fetch offline orders");
            }
            setOrders(data.orders || []);
        } catch (error) {
            console.error("FETCH OFFLINE ORDERS ERROR:", error);
            toast.error(error.message || "Failed to fetch offline orders");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    useRealtime(fetchOrders);

    const updateOrder = async (
        id,
        status,
        deliveryType,
        deliveryCharge
    ) => {
        const toastId = toast.loading("Updating order...");
        try {
            const res = await fetch("/api/admin/offline/orders", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    id,
                    status,
                    deliveryType,
                    deliveryCharge:
                        Number(deliveryCharge) || 0,
                }),
            });
            const data = await res.json();
            if (!res.ok || !data.success) {
                throw new Error(data.message || "Failed to update order");
            }

            setOrders((prev) =>
                prev.map((order) =>
                    order._id === id
                        ? {
                            ...order,
                            status,
                            deliveryType,
                            deliveryCharge: Number(deliveryCharge) || 0,
                        } : order
                )
            );
            toast.success("Order updated successfully", { id: toastId, });
        } catch (error) {
            console.error("UPDATE ORDER ERROR:", error);
            toast.error(error.message || "Something went wrong", { id: toastId, });
        }
    };

    const handlePrint = (order) => {
        const printWindow = window.open("", "", "width=700,height=600");
        if (!printWindow) {
            toast.error("Please allow pop-ups to print.");
            return;
        }
        printWindow.document.write(`
            <html>
                <head>
                    <title>Address Slip</title>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            padding: 30px;
                        }
                        .container {
                            display: flex;
                            justify-content: space-between;
                            gap: 30px;
                        }
                        .box {
                            width: 48%;
                            padding: 15px;
                        }
                        .title {
                            font-weight: bold;
                            margin-bottom: 8px;
                            font-size: 18px;
                        }
                        .text {
                            font-size: 16px;
                            margin-bottom: 4px;
                            line-height: 1.2;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="box">
                            <div class="title">
                                From,
                            </div>

                            <div class="text">
                                <b>Abdul Vakeel</b>
                            </div>

                            <div class="text">
                                Telugu Bookstore
                            </div>

                            <div class="text">
                                Hyderabad, Telangana
                            </div>

                            <div class="text">
                                <b>Phone:</b> 9441055065
                            </div>
                        </div>
                        <div class="box">
                            <div class="title">
                                To,
                            </div>

                            <div class="text">
                                ${order.name || ""}
                            </div>
                            <div class="text">
                                ${order.address?.full || ""}
                            </div>
                            <div class="text">
                                ${order.address?.area || ""}
                            </div>
                            <div class="text">
                                ${order.address?.district || ""}
                            </div>
                            <div class="text">
                                ${order.address?.state || ""}
                            </div>
                            <div class="text">
                                <b>Pincode:</b>
                                ${order.address?.pincode || ""}
                            </div>
                            <div class="text">
                                <b>Phone:</b>
                                ${order.phone || ""}
                            </div>
                        </div>
                    </div>
                </body>
            </html>
        `);

        printWindow.document.close();
        printWindow.focus();

        setTimeout(() => {
            printWindow.print();
        }, 300);
    };

    const search = orderSearch
        .toLowerCase()
        .trim();

    const filteredOrders = [...orders]
        .filter((order) => {
            if (search) {
                const values = [
                    order.invoiceId,
                    order._id,
                    order.name,
                    order.phone,
                    order.paymentMethod,
                    order.paymentStatus,
                    order.orderCreatedBy,
                    order.address?.full,
                    order.address?.area,
                    order.address?.district,
                    order.address?.state,
                    order.address?.pincode,
                ]
                    .filter(Boolean)
                    .join(" ")
                    .toLowerCase();
                if (!values.includes(search)) {
                    return false;
                }
            }

            if (selectedDate) {
                const orderDate = new Date(order.createdAt);
                const year = orderDate.getFullYear();
                const month = String(orderDate.getMonth() + 1).padStart(2, "0");
                const day = String(orderDate.getDate()).padStart(2, "0");
                const date = `${year}-${month}-${day}`;
                if (date !== selectedDate) {
                    return false;
                }
            }

            const status = order.status?.toLowerCase();

            if (
                [
                    "pending",
                    "shipped",
                    "completed",
                    "cancelled",
                    "confirmed",
                    "processing",
                ].includes(orderFilter)
            ) {
                if (status !== orderFilter) {
                    return false;
                }
            }

            return true;
        })
        .sort((a, b) => {
            if (orderFilter === "newest") {
                return (
                    new Date(b.createdAt) - new Date(a.createdAt)
                );
            }

            if (orderFilter === "oldest") {
                return (
                    new Date(a.createdAt) - new Date(b.createdAt)
                );
            }
            const totalA = Number(a.totalAmount) || 0;
            const totalB = Number(b.totalAmount) || 0;

            if (orderFilter === "high-amount") {
                return totalB - totalA;
            }
            if (orderFilter === "low-amount") {
                return totalA - totalB;
            }

            const qtyA = a.items?.reduce(
                (sum, item) =>
                    sum + (Number(item.qty) || 0), 0
            ) || 0;

            const qtyB = b.items?.reduce(
                (sum, item) =>
                    sum + (Number(item.qty) || 0), 0
            ) || 0;

            if (orderFilter === "most-books") {
                return qtyB - qtyA;
            }

            if (orderFilter === "least-books") {
                return qtyA - qtyB;
            }

            return (
                new Date(b.createdAt) - new Date(a.createdAt)
            );
        });

    const totalPages = Math.ceil(
        filteredOrders.length / ordersPerPage
    );

    const currentOrders =
        filteredOrders.slice(
            (currentPage - 1) * ordersPerPage,
            currentPage * ordersPerPage
        );

    const clearFilters = () => {
        setOrderFilter("all");
        setSelectedDate("");
        setOrderSearch("");
        setCurrentPage(1);
    };

    if (loading) {
        return (
            <div style={{ textAlign: "center", marginTop: "60px" }}>
                <div className="loader"></div>
                <p>Loading Orders...</p>
            </div>
        );
    }

    return (
        <div className="admin-orders">
            {/* =========================
                HEADER
            ========================== */}
            <div className="orders-header">
                <h3>Offline Orders</h3>
                <div className="orders-filter-area">
                    <div className="orders-search-box">
                        <input
                            type="text"
                            className="orders-search"
                            placeholder="Search Offline Order..."
                            value={orderSearch}
                            onChange={(e) => {
                                setOrderSearch(e.target.value);
                                setCurrentPage(1);
                            }}
                        />
                    </div>

                    <div className="orders-filter-area-box">
                        <div>
                            <select
                                className="orders-filter"
                                value={orderFilter}
                                onChange={(e) => {
                                    setOrderFilter(e.target.value);
                                    setCurrentPage(1);
                                }}
                            >
                                <option value="all">All Orders</option>
                                <option value="newest">Newest Orders</option>
                                <option value="oldest">Oldest Orders</option>
                                <option value="high-amount">Highest Amount</option>
                                <option value="low-amount">Lowest Amount</option>
                                <option value="most-books">Most Books</option>
                                <option value="least-books">Least Books</option>
                                <option value="pending">Pending Orders</option>
                                <option value="confirmed">Confirmed Orders</option>
                                <option value="processing">Processing Orders</option>
                                <option value="shipped">Shipped Orders</option>
                                <option value="completed">Completed Orders</option>
                                <option value="cancelled">Cancelled Orders</option>
                            </select>
                        </div>

                        <div>
                            <input
                                type="date"
                                className="orders-date-filter"
                                value={selectedDate || today}
                                onChange={(e) => {
                                    setSelectedDate(e.target.value);
                                    setCurrentPage(1);
                                }}
                            />
                        </div>
                    </div>

                    {(
                        orderFilter !== "all" ||
                        selectedDate ||
                        orderSearch
                    ) && (
                            <button
                                type="button"
                                className="clear-order-filter"
                                onClick={clearFilters}
                            >
                                Clear
                            </button>
                        )}
                </div>
            </div>

            {filteredOrders.length === 0 ? (
                <div
                    style={{
                        width: "100%",
                        padding: "40px 20px",
                        textAlign: "center",
                        boxSizing: "border-box",
                    }}
                >

                    <p
                        style={{
                            margin: 0,
                            fontSize: "16px",
                            color: "#777",
                        }}
                    >
                        No offline orders found
                    </p>
                </div>
            ) : (
                <>
                    <hr />
                    {/* ==================================================
                        DESKTOP ORDERS
                    =================================================== */}
                    <div className="orders-table desktop-orders-table">
                        {currentOrders.map((order) => {
                            const totalAmount = Number(order.totalAmount) || 0;
                            const deliveryCharge = Number(order.deliveryCharge) || 0;
                            return (
                                <div
                                    key={order._id}
                                    className="order-row"
                                >
                                    <div className="adminorders-card">
                                        <p>
                                            <b>Order ID:</b>{" "}
                                            {order.invoiceId || order._id
                                                ?.slice(-6)
                                                .toUpperCase()}
                                        </p>
                                        <p>
                                            <b>Date:</b>{" "}
                                            {order.createdAt
                                                ? new Date(order.createdAt
                                                ).toLocaleString()
                                                : "-"}
                                        </p>
                                        <p>
                                            <b>Source:</b>{" "}
                                            {order.orderSource || "offline"}
                                        </p>
                                        <p>
                                            <b>Created By:</b>{" "}
                                            {order.orderCreatedBy || "admin"}
                                        </p>
                                    </div>
                                    <div className="adminorders-cardname">
                                        <p>
                                            <b>Name:</b>{" "}
                                            {order.name || "-"}
                                        </p>
                                        <p>
                                            <b>Phone No:</b>{" "}
                                            {order.phone || "-"}
                                        </p>
                                        <p>
                                            <b>Address:</b>{" "}
                                            {order.address?.full || "-"}
                                            {order.address?.pincode
                                                ? `, ${order.address.pincode}`
                                                : ""}
                                        </p>
                                    </div>
                                    <div className="admin-box">
                                        <div className="admin-invoice1">
                                            <div className="admin-invoice-items-header">
                                                <span>Book</span>
                                                <span>Qty</span>
                                                <span>Price</span>
                                            </div>
                                            {order.items?.map(
                                                (
                                                    item,
                                                    index
                                                ) => (
                                                    <div
                                                        key={index}
                                                        className="admin-invoice-item"
                                                    >
                                                        <span>
                                                            {item.bookId?.title || "Book"}
                                                        </span>
                                                        <span>
                                                            {item.qty || 0}
                                                        </span>
                                                        <span>
                                                            Rs.{" "}
                                                            {Number(item.bookId?.price) || 0}
                                                        </span>
                                                    </div>
                                                )
                                            )}
                                            <div className="admin-order-summary">
                                                <div className="admin-invoice-item-total">
                                                    <span>Delivery Charges</span>
                                                    <span>Rs.{" "}{deliveryCharge}</span>
                                                </div>
                                                <div className="admin-invoice-item-total">
                                                    <strong>Total</strong>
                                                    <strong>Rs.{" "}{totalAmount}</strong>
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <b>Delivery</b>
                                            <input
                                                className="delivery-input"
                                                type="text"
                                                placeholder="Delivery Type"
                                                value={order.deliveryType || ""}
                                                onChange={(e) => {
                                                    setOrders(
                                                        (prev) =>
                                                            prev.map(
                                                                (o) =>
                                                                    o._id === order._id
                                                                        ? {
                                                                            ...o,
                                                                            deliveryType: e.target.value,
                                                                        } : o
                                                            )
                                                    );
                                                }}
                                            />

                                            <input
                                                className="delivery-input"
                                                type="number"
                                                min="0"
                                                placeholder="Delivery Charges"
                                                value={order.deliveryCharge ?? ""}
                                                onChange={(e) => {
                                                    setOrders(
                                                        (prev) =>
                                                            prev.map(
                                                                (
                                                                    o
                                                                ) =>
                                                                    o._id ===
                                                                        order._id
                                                                        ? {
                                                                            ...o,
                                                                            deliveryCharge:
                                                                                Number(
                                                                                    e
                                                                                        .target
                                                                                        .value
                                                                                ) || 0,
                                                                        } : o
                                                            )
                                                    );
                                                }}
                                            />
                                            <button
                                                type="button"
                                                className="save-delivery-btn"
                                                onClick={() =>
                                                    updateOrder(
                                                        order._id,
                                                        order.status,
                                                        order.deliveryType,
                                                        order.deliveryCharge
                                                    )
                                                }
                                            >
                                                Save Delivery
                                            </button>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="statusadmin">
                                            <b>Status:</b>{" "}
                                            {order.status || "-"}
                                        </p>
                                        <p>
                                            <b>Payment:</b>{" "}
                                            {order.paymentMethod || "-"}
                                        </p>
                                        <p>
                                            <b>Payment Status:</b>{" "}
                                            {order.paymentStatus || "-"}
                                        </p>
                                        {order.utrNumber && (
                                            <p>
                                                <b>UTR:</b>{" "}
                                                {order.utrNumber}
                                            </p>
                                        )}
                                        <div className="admin-box">
                                            <div className="order-actions">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        updateOrder(
                                                            order._id,
                                                            "completed",
                                                            order.deliveryType,
                                                            order.deliveryCharge
                                                        )
                                                    }
                                                >
                                                    Complete
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        updateOrder(
                                                            order._id,
                                                            "pending",
                                                            order.deliveryType,
                                                            order.deliveryCharge
                                                        )
                                                    }
                                                >
                                                    Pending
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        updateOrder(
                                                            order._id,
                                                            "shipped",
                                                            order.deliveryType,
                                                            order.deliveryCharge
                                                        )
                                                    }
                                                >
                                                    Shipped
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        updateOrder(
                                                            order._id,
                                                            "cancelled",
                                                            order.deliveryType,
                                                            order.deliveryCharge
                                                        )
                                                    }
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                            <div className="admin-invoice-btns">
                                                <Link href={`/invoice-admin/${order._id}`}>
                                                    <button type="button">
                                                        View Invoice
                                                    </button>
                                                </Link>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handlePrint(order)
                                                    }
                                                >
                                                    Print address slip
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>


                    {/* ==================================================
                        MOBILE ORDERS
                    =================================================== */}
                    <div className="orders-table mobile-orders-table">
                        {currentOrders.map((order) => {
                            const totalAmount = Number(order.totalAmount) || 0;
                            const deliveryCharge = Number(order.deliveryCharge) || 0;

                            return (
                                <div
                                    key={order._id}
                                    className="order-row"
                                >
                                    <div className="adminorders-card">
                                        <p>
                                            <b>Order ID:</b>{" "}
                                            {order.invoiceId || order._id
                                                ?.slice(-6)
                                                .toUpperCase()}
                                        </p>
                                        <p>
                                            <b>Date:</b>{" "}
                                            {order.createdAt
                                                ? new Date(
                                                    order.createdAt
                                                ).toLocaleString()
                                                : "-"}
                                        </p>
                                    </div>
                                    <div className="adminorders-card">
                                        <p>
                                            <b>Source:</b>{" "}
                                            {order.orderSource || "offline"}
                                        </p>
                                        <p>
                                            <b>Created By:</b>{" "}
                                            {order.orderCreatedBy || "admin"}
                                        </p>

                                    </div>
                                    <div className="adminorders-cardname">
                                        <p>
                                            <b>Name:</b>{" "}
                                            {order.name || "-"}
                                        </p>
                                        <p>
                                            <b>Phone No:</b>{" "}
                                            {order.phone || "-"}
                                        </p>
                                        <p>
                                            <b>Address:</b>{" "}
                                            {order.address?.full || "-"}
                                            {order.address
                                                ?.pincode
                                                ? `, ${order.address.pincode}`
                                                : ""}
                                        </p>
                                    </div>
                                    <div>
                                        <b>Delivery</b>
                                        <div className="deliveryinputbox">
                                            <div className="deliveryinputbox1">
                                                <input
                                                    className="delivery-input"
                                                    type="text"
                                                    placeholder="Delivery Type"
                                                    value={order.deliveryType || ""}
                                                    onChange={(e) => {
                                                        setOrders(
                                                            (prev) =>
                                                                prev.map(
                                                                    (
                                                                        o
                                                                    ) =>
                                                                        o._id === order._id
                                                                            ? {
                                                                                ...o,
                                                                                deliveryType:
                                                                                    e
                                                                                        .target
                                                                                        .value,
                                                                            } : o
                                                                )
                                                        );
                                                    }}
                                                />
                                                <input
                                                    className="delivery-input"
                                                    type="number"
                                                    min="0"
                                                    placeholder="Delivery Charges"
                                                    value={order.deliveryCharge ?? ""}
                                                    onChange={(e) => {
                                                        setOrders(
                                                            (prev) =>
                                                                prev.map(
                                                                    (
                                                                        o
                                                                    ) =>
                                                                        o._id ===
                                                                            order._id
                                                                            ? {
                                                                                ...o,
                                                                                deliveryCharge:
                                                                                    Number(
                                                                                        e
                                                                                            .target
                                                                                            .value
                                                                                    ) || 0,
                                                                            } : o
                                                                )
                                                        );
                                                    }}
                                                />
                                            </div>
                                            <button
                                                type="button"
                                                className="save-delivery-btn"
                                                onClick={() =>
                                                    updateOrder(
                                                        order._id,
                                                        order.status,
                                                        order.deliveryType,
                                                        order.deliveryCharge
                                                    )
                                                }
                                            >
                                                Save Delivery
                                            </button>
                                        </div>
                                    </div>

                                    <div className="admin-invoice-items-header">
                                        <span>Book</span>
                                        <span>Qty</span>
                                        <span>Price</span>
                                    </div>
                                    {order.items?.map(
                                        (
                                            item,
                                            index
                                        ) => (
                                            <div
                                                key={index}
                                                className="admin-invoice-item"
                                            >
                                                <span>
                                                    {item.bookId?.title || "Book"}
                                                </span>
                                                <span>
                                                    {item.qty || 0}
                                                </span>
                                                <span>
                                                    Rs.{" "}
                                                    {Number(item.bookId
                                                        ?.price
                                                    ) || 0}
                                                </span>
                                            </div>
                                        )
                                    )}

                                    <div className="admin-order-summary">
                                        <div className="admin-invoice-item-total">
                                            <span>Delivery Charges</span>
                                            <span>Rs.{" "}{deliveryCharge}</span>
                                        </div>
                                        <div className="admin-invoice-item-total">
                                            <strong>Total</strong>
                                            <strong>Rs.{" "}{totalAmount}</strong>
                                        </div>
                                    </div>

                                    <div className="admin-Status-mobile">
                                        <p className="statusadmin">
                                            <b>Status:</b>{" "}
                                            {order.status || "-"}
                                        </p>
                                        <p>
                                            <b>Payment:</b>{" "}
                                            {order.paymentMethod || "-"}
                                        </p>
                                        <p>
                                            <b>Payment Status:</b>{" "}
                                            {order.paymentStatus || "-"}
                                        </p>
                                        {order.utrNumber && (
                                            <p>
                                                <b>UTR:</b>{" "}
                                                {order.utrNumber}
                                            </p>
                                        )}
                                        <div className="admin-box">
                                            <div className="order-actions">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        updateOrder(
                                                            order._id,
                                                            "completed",
                                                            order.deliveryType,
                                                            order.deliveryCharge
                                                        )
                                                    }
                                                >
                                                    Complete
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        updateOrder(
                                                            order._id,
                                                            "pending",
                                                            order.deliveryType,
                                                            order.deliveryCharge
                                                        )
                                                    }
                                                >
                                                    Pending
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        updateOrder(
                                                            order._id,
                                                            "shipped",
                                                            order.deliveryType,
                                                            order.deliveryCharge
                                                        )
                                                    }
                                                >
                                                    Shipped
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        updateOrder(
                                                            order._id,
                                                            "cancelled",
                                                            order.deliveryType,
                                                            order.deliveryCharge
                                                        )
                                                    }
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="admin-invoice-btns">
                                        <Link href={`/invoice-admin/${order._id}`}>
                                            <button type="button">
                                                View Invoice
                                            </button>
                                        </Link>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                handlePrint(order)
                                            }
                                        >
                                            Print address slip
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* =========================
                        PAGINATION
                    ========================== */}
                    <div className="pagination">
                        <button
                            type="button"
                            disabled={currentPage === 1}
                            onClick={() =>
                                setCurrentPage(
                                    (page) => page - 1
                                )
                            }
                        >
                            Prev
                        </button>
                        <span>
                            Page{" "}
                            {currentPage} of{" "}
                            {totalPages || 1}
                        </span>
                        <button
                            type="button"
                            disabled={
                                currentPage ===
                                totalPages ||
                                totalPages === 0
                            }
                            onClick={() =>
                                setCurrentPage(
                                    (page) => page + 1
                                )
                            }
                        >
                            Next
                        </button>
                    </div>
                </>
            )
            }
        </div >
    );
}