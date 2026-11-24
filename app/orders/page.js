
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSelector } from "react-redux";
import useRealtime from "@/app/hooks/useRealtime";
import { useLanguage } from "@/app/context/LanguageContext";

export default function OrdersPage() {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);

  const { user, loading: authLoading } = useSelector(
    (state) => state.auth
  );

  const { language } = useLanguage();
  const isTelugu = language === "te";

  const fetchOrders = async () => {
    if (authLoading) return;

    if (!user?._id) {
      setOrders([]);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`/api/orders?userId=${user._id}`, {
        cache: "no-store",
      });

      const data = await res.json();

      if (data.success) {
        setOrders(data.orders || []);
      } else {
        setOrders([]);
      }

      console.log(data);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user?._id) {
      fetchOrders();
    }
  }, [user?._id, authLoading]);

  useRealtime(fetchOrders);

  if (loading) {
    return (
      <div style={{ textAlign: "center", marginTop: "100px" }}>
        <div className="loader"></div>
        <p>{isTelugu ? "లోడ్ అవుతోంది..." : "Loading..."}</p>
      </div>
    );
  }

  return (
    <section className="orders-page">
      <Link href="/" className="back-home back-home2">
        {isTelugu ? "← హోమ్‌కు తిరిగి వెళ్ళండి" : "← Back to Home"}
      </Link>

      <h1 className="orders-title">
        {isTelugu ? "నా ఆర్డర్లు" : "My Orders"}{" "}
        <span className="order-count">
          ({orders.length})
        </span>
      </h1>

      {orders.length === 0 ? (
        <p>
          {isTelugu ? "ఆర్డర్లు ఏవీ కనుగొనబడలేదు" : "No orders found"}
        </p>
      ) : (
        <div className="orders-container">
          {orders.map((order) => (
            <div key={order._id} className="order-card">

              <div className="order-header">
                <div>
                  <h3>
                    {isTelugu ? "ఆర్డర్ #" : "Order #"}
                    {order.invoiceId ||
                      order._id.slice(-6).toUpperCase()}
                  </h3>

                  <p>
                    {new Date(order.createdAt).toLocaleString(
                      isTelugu ? "te-IN" : "en-IN"
                    )}
                  </p>
                </div>

                <span
                  className={`order-status ${order.status?.toLowerCase()}`}
                >
                  {isTelugu
                    ? ({
                        pending: "పెండింగ్",
                        confirmed: "నిర్ధారించబడింది",
                        processing: "ప్రాసెస్ అవుతోంది",
                        shipped: "షిప్పింగ్ చేయబడింది",
                        delivered: "డెలివరీ చేయబడింది",
                        cancelled: "రద్దు చేయబడింది",
                      }[order.status?.toLowerCase()] || order.status)
                    : order.status}
                </span>
              </div>

              <div className="order-section">
                <h4>
                  {isTelugu ? "డెలివరీ చిరునామా" : "Delivery Address"}
                </h4>

                <div className="address-card">
                  <p className="customer-name">
                    {order.name}
                  </p>

                  <p>{order.address?.full}</p>

                  <p>
                    {order.address?.area},{" "}
                    {order.address?.district}
                  </p>

                  <p>
                    {order.address?.state} -{" "}
                    {order.address?.pincode}
                  </p>

                  <p className="phone">
                    {isTelugu ? "ఫోన్:" : "Phone:"} {order.phone}
                  </p>
                </div>
              </div>

              <div className="order-section">
                <h4>
                  {isTelugu ? "పుస్తకాలు" : "Books"} ({order.items.length})
                </h4>

                {order.items.map((item, index) => (
                  <div
                    key={index}
                    className="book-row"
                  >
                    <span className="book-name">
                      {isTelugu
                        ? item.bookId?.teluguTitle || item.bookId?.title || "పుస్తకం"
                        : item.bookId?.title || "Book"}
                    </span>

                    <div className="orders-book-info">
                      <span>
                        {isTelugu ? "పరిమాణం:" : "Qty:"} {item.qty}
                      </span>

                      <strong>
                        ₹{item.bookId?.price || "-"}
                      </strong>
                    </div>
                  </div>
                ))}
              </div>

              <div className="payment-summary-page">
                <div className="summary-row">
                  <span>
                    {isTelugu ? "డెలివరీ రకం" : "Delivery Type"}
                  </span>
                  <span>
                    {order.deliveryType ||
                      (isTelugu
                        ? "తర్వాత నిర్ధారించబడుతుంది"
                        : "To Be Confirmed")}
                  </span>
                </div>

                <div className="summary-row">
                  <span>
                    {isTelugu ? "డెలివరీ ఛార్జీలు" : "Delivery Charges"}
                  </span>
                  <span>
                    {order.totalAmount >= 1000
                      ? isTelugu ? "ఉచితం" : "Free"
                      : order.deliveryCharge > 0
                        ? `₹${order.deliveryCharge}`
                        : isTelugu
                          ? "తర్వాత నిర్ధారించబడుతుంది"
                          : "To Be Confirmed"}
                  </span>
                </div>

                <div className="summary-row grand-total">
                  <span>
                    {isTelugu ? "మొత్తం" : "Total"}
                  </span>
                  <strong>
                    ₹{""}
                    {order.totalAmount >= 1000
                      ? order.totalAmount || 0
                      : order.deliveryCharge > 0
                        ? (order.totalAmount || 0) +
                        order.deliveryCharge
                        : order.totalAmount || 0}
                  </strong>
                </div>
              </div>

              <div className="order-actions">
                <Link
                  href={`/invoice/${order._id}`}
                  className="invoice-btn"
                >
                  {isTelugu ? "ఇన్వాయిస్ చూడండి" : "View Invoice"}
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
