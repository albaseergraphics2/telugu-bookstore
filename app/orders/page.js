"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSelector } from "react-redux";

export default function OrdersPage() {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    let timer;

    const fetchOrders = async () => {
      try {
        if (!user?._id) {
          setLoading(false);
          return;
        }

        const res = await fetch(`/api/orders?userId=${user._id}`);
        const data = await res.json();

        if (data.success) {
          setOrders(data.orders);
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        timer = setTimeout(() => {
          setLoading(false);
        }, 200);
      }
    };

    fetchOrders();

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [user]);

  if (loading) {
    return (
      <div style={{ textAlign: "center", marginTop: "100px" }}>
        <div className="loader"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <section className="orders-page">
      <Link href="/" className="back-home">← Back to Home</Link>

      <h1 className="orders-title">
        My Orders <span className="order-count">({orders.length})</span>
      </h1>

      {orders.length === 0 ? (
        <p>No orders found</p>
      ) : (
        <div className="orders-container">
          {orders.map((order) => (
            <div key={order._id} className="order-card">

              <div className="order-header">
                <div>
                  <h3>Order #{order.invoiceId || order._id.slice(-6).toUpperCase()}</h3>
                  <p>{new Date(order.createdAt).toLocaleString()}</p>
                </div>

                <span className={`order-status ${order.status?.toLowerCase()}`}>
                  {order.status}
                </span>
              </div>

              <div className="order-section">
                <h4>Books ({order.items.length})</h4>

                {order.items.map((item, index) => (
                  <div key={index} className="book-row">
                    <span className="book-name">
                      {item.bookId?.title || "Book"}
                    </span>

                    <div className="orders-book-info">
                      <span>Qty: {item.qty}</span>
                      <strong>₹ {item.bookId?.price || "-"}</strong>
                    </div>
                  </div>
                ))}
              </div>

              <div className="order-section">
                <h4>Delivery Address</h4>

                <div className="address-card">
                  <p className="customer-name">{order.name}</p>

                  <p>{order.address?.full}</p>

                  <p>
                    {order.address?.area}, {order.address?.district}
                  </p>

                  <p>
                    {order.address?.state} - {order.address?.pincode}
                  </p>

                  <p className="phone">
                    Phone: {order.phone}
                  </p>
                </div>
              </div>

              <div className="payment-summary">

                <div className="summary-row">
                  <span>Books Total</span>
                  <span>₹ {order.totalAmount || 0}</span>
                </div>

                <div className="summary-row">
                  <span>Delivery Type</span>
                  <span>{order.deliveryType || "To Be Confirmed"}</span>
                </div>

                <div className="summary-row">
                  <span>Delivery Charges</span>
                  <span>
                    {order.totalAmount >= 1000
                      ? "Free"
                      : order.deliveryCharge > 0
                        ? `₹ ${order.deliveryCharge}`
                        : "To Be Confirmed"}
                  </span>
                </div>

                <div className="summary-row grand-total">
                  <span>Grand Total</span>
                  <strong>
                    ₹ {order.totalAmount >= 1000
                      ? (order.totalAmount || 0)
                      : order.deliveryCharge > 0
                        ? (order.totalAmount || 0) + order.deliveryCharge
                        : (order.totalAmount || 0)}
                  </strong>
                </div>
              </div>

              <div className="order-actions">
                <Link
                  href={`/invoice/${order._id}`}
                  className="invoice-btn"
                >
                  View Invoice
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}