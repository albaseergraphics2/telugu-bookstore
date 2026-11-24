
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useLanguage } from "@/app/context/LanguageContext";

export default function InvoicePage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);

  const { language } = useLanguage();
  const isTelugu = language === "te";

  const handlePDF = async () => {
    const element = document.querySelector(".invoice-card");

    const canvas = await html2canvas(element, { scale: 2 });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");

    const imgWidth = 80;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    const x = (210 - imgWidth) / 2;

    pdf.addImage(imgData, "PNG", x, 10, imgWidth, imgHeight);
    pdf.save(`invoice-${order.invoiceId || order._id.slice(-6).toUpperCase()}.pdf`);
  };

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await fetch(`/api/orders/${id}`);
        const data = await res.json();

        if (data.success) {
          setOrder(data.order);
        }
      } catch (err) {
        console.error(err);
      }
    };

    if (id) fetchOrder();
  }, [id]);

  if (!order)
    return (
      <div style={{ textAlign: "center", marginTop: "100px" }}>
        <div className="loader"></div>
        <p>{isTelugu ? "లోడ్ అవుతోంది..." : "Loading..."}</p>
      </div>
    );

  return (
    <section className="invoice-page">
      <Link href="/orders" className="back-home back-home2">
        ← {isTelugu ? "వెనుకకు" : "Back"}
      </Link>

      <div className="invoice-container">
        <div className="invoice-card">
          <div className="logo logo-invoice">
            <h2>
              <span>Telugu </span>
              <span> Bookstore</span>
            </h2>
          </div>

          <h2 className="invoice">
            {isTelugu ? "ఇన్వాయిస్" : "Invoice"}
          </h2>

          <p>
            <b>{isTelugu ? "ఆర్డర్ ID:" : "Order ID:"}</b>{" "}
            {order.invoiceId || order._id.slice(-6).toUpperCase()}
          </p>

          <p>
            <b>{isTelugu ? "తేదీ:" : "Date:"}</b>{" "}
            {new Date(order.createdAt).toLocaleString(
              isTelugu ? "te-IN" : "en-IN"
            )}
          </p>

          <p>
            <b>{isTelugu ? "పేరు:" : "Name:"}</b> {order.name}
          </p>

          <p>
            <b>{isTelugu ? "చిరునామా:" : "Address:"}</b>{" "}
            {order.address?.full || "-"}, {order.address?.pincode || "-"}
          </p>

          <p>
            <b>{isTelugu ? "ఫోన్:" : "Phone:"}</b> {order.phone}
          </p>

          <div className="invoice-items-header">
            <span>{isTelugu ? "పుస్తకం" : "Book"}</span>
            <span>{isTelugu ? "పరిమాణం" : "Qty"}</span>
            <span>{isTelugu ? "ధర" : "Price"}</span>
          </div>

          {order.items.map((item, i) => (
            <div key={i} className="invoice-item">
              <span>
                {isTelugu
                  ? item.bookId?.teluguTitle || item.bookId?.title || "పుస్తకం"
                  : item.bookId?.title || "Book"}
              </span>

              <span>{item.qty}</span>

              <span>₹{item.bookId?.price || 0}</span>
            </div>
          ))}

          <div className="invoice-summary">
            <div className="summary-row">
              <span>{isTelugu ? "డెలివరీ ఛార్జీలు" : "Shipping"}</span>
              <span>₹{order.deliveryCharge || 0}</span>
            </div>

            <div className="summary-total">
              <strong>{isTelugu ? "మొత్తం" : "Total"}</strong>
              <strong>
                ₹{(order.totalAmount || 0) + (order.deliveryCharge || 0)}
              </strong>
            </div>
          </div>

          <div className="invoice-payment">
            <p>
              <b>{isTelugu ? "చెల్లింపు:" : "Payment:"}</b>{" "}
              {order.paymentMethod === "COD"
                ? isTelugu
                  ? "డెలివరీ సమయంలో నగదు చెల్లింపు"
                  : "COD"
                : order.paymentMethod || (isTelugu ? "COD" : "COD")}
            </p>

            <p className="invoice-thankyou">
              {isTelugu ? "ధన్యవాదాలు" : "Thank you"}
            </p>
          </div>
        </div>

        <div className="invoice-buttons">
          <button onClick={handlePDF}>
            {isTelugu ? "PDF డౌన్‌లోడ్ చేయండి" : "Download PDF"}
          </button>
        </div>
      </div>
    </section>
  );
}
