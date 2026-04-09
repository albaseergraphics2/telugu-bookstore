"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function InvoicePage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);

  const handlePDF = async () => {
    const element = document.querySelector(".invoice-card");

    const canvas = await html2canvas(element, {
      scale: 2,
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");

    const imgWidth = 80;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    const x = (210 - imgWidth) / 2;

    pdf.addImage(imgData, "PNG", x, 10, imgWidth, imgHeight);
    pdf.save("invoice.pdf");
  };

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await fetch(`/api/orders/${id}`);
        const data = await res.json();
        console.log(data);

        if (data.success) {
          setOrder(data.order);
        }
      } catch (err) {
        console.error(err);
      }
    };

    if (id) fetchOrder();
  }, [id]);

  if (!order) return <p style={{ padding: "40px" }}>Loading...</p>;

  return (
    <div className="invoice-page">

      <Link href="/admin/orders" className="back-home">← Back</Link>

      <div className="invoice-container-admin">
        <div className="invoice-card">

          <h2>Invoice</h2>

          <p><b>Order ID:</b> {order._id}</p>
          <p><b>Date:</b> {new Date(order.createdAt).toLocaleString()}</p>
          <p><b>Name:</b> {order.name}</p>

          {/* ✅ FIXED */}
          <p><b>Address:</b> {order.address?.full || "-"}, {order.address?.pincode || "-"}</p>

          <p><b>Phone:</b> {order.phone}</p>

          <hr />

          <h3>Items</h3>

          {order.items.map((item, i) => (
            <div key={i} className="invoice-item">
              <span>{item.bookId?.title} (x{item.qty})</span>
              <span>₹ {item.bookId?.price}</span>
            </div>
          ))}

          <hr />

          <h3>Total: ₹{order.totalAmount}</h3>

        </div>

        <div className="invoice-buttons-admin">
          <button onClick={handlePDF}>Download PDF</button>
        </div>
      </div>
    </div>
  );
}