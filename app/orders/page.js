"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function OrdersPage() {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    let timer;

    const fetchOrders = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user"));

        if (!user) {
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
  }, []);

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

      <h1 className="orders-title">My Orders</h1>

      {orders.length === 0 ? (
        <p>No orders found</p>
      ) : (
        <div className="orders-container">
          {orders.map((order) => (
            <div key={order._id} className="order-card">

              <div className="order-id">
                <h3><b>Order ID:</b> {order._id}</h3>
                <p><b>Date:</b> {new Date(order.createdAt).toLocaleString()}</p>
              </div>

              {/* ✅ FIXED ITEMS */}
              <div className="order-items">
                {order.items.map((item, index) => (
                  <div key={index} className="order-item">
                    <p>
                      {item.bookId?.title || "Book"} - <b>Qty: {item.qty}</b>
                    </p>
                    <p>₹ {item.bookId?.price || "-"}</p>
                  </div>
                ))}
              </div>

              {/* ✅ FIXED ADDRESS */}
              <div className="order-address">
                <div>
                  <p>
                    <b>Address:</b>{" "}
                    {order.address?.full || "-"}, {order.address?.pincode || "-"}
                  </p>
                  <p><b>Phone No:</b> {order.phone}</p>
                </div>

                <div>
                  <p><b>Status:</b> {order.status}</p>
                  <p><b>Total:</b> ₹ {order.totalAmount}</p>
                </div>
              </div>

              <Link href={`/invoice/${order._id}`}>
                View Invoice
              </Link>

            </div>
          ))}
        </div>
      )}
    </section>
  );
}