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
    const element = document.querySelector(".invoice-card-admin");

    const canvas = await html2canvas(element, {
      scale: 2,
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");

    const imgWidth = 80;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    const x = (210 - imgWidth) / 2;

    pdf.addImage(imgData, "PNG", x, 10, imgWidth, imgHeight);
    pdf.save(`Admin-invoice-${order.invoiceId || order._id.slice(-6).toUpperCase()}.pdf`);
  };


  const handlePrint = () => {
    const invoice = document.querySelector(".invoice-card-admin");

    if (!invoice) return;

    const printWindow = window.open("", "_blank", "width=900,height=700");

    if (!printWindow) {
      alert("Please allow popups to print the invoice.");
      return;
    }

    const styles = Array.from(
      document.querySelectorAll('link[rel="stylesheet"], style')
    )
      .map((style) => style.outerHTML)
      .join("");

    printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Invoice</title>
        ${styles}

        <style>
          @page {
            size: A4;
            margin: 10mm;
          }

          html,
          body {
            margin: 0;
            padding: 0;
            background: white;
          }

          body {
            display: flex;
            justify-content: center;
            align-items: flex-start;
          }

          // .invoice-card-admin {
          //   width: 180mm;
          //   margin: 0;
          // }

          .invoice-buttons,
          .back-home {
            display: none !important;
          }
        </style>
      </head>

      <body>
        ${invoice.outerHTML}
      </body>
    </html>
  `);

    printWindow.document.close();

    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.focus();
        printWindow.print();
        printWindow.close();
      }, 500);
    };
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

    if (id) {
      fetchOrder();
    }
  }, [id]);

  if (!order) {
    return (
      <div style={{ textAlign: "center", marginTop: "100px" }}>
        <div className="loader"></div>
        <p>Loading...</p>
      </div>
    );
  }

  const invoiceNumber =
    order.invoiceId || order._id.slice(-6).toUpperCase();

  const subtotal = order.totalAmount || 0;
  const shipping = order.deliveryCharge || 0;
  const grandTotal = subtotal + shipping;

  return (
    <div className="invoice-page">

      <Link
        href="/admin/orders"
        className="back-home"
      >
        ← Back
      </Link>

      <div className="invoice-container">

        <div className="invoice-card-admin">

          {/* STORE HEADER */}
          <div className="invoice-store-header">

            <div className="logo logo-invoice">
              <h2>
                <span>Telugu </span>
                <span>Bookstore</span>
              </h2>
            </div>

            <div className="invoice-heading">

              <h2>INVOICE</h2>
              <div className="inovice-date-admin">

                <p>
                  <b>Invoice ID:</b> {invoiceNumber}
                </p>

                <p>
                  <b>Date:</b>{" "}
                  {new Date(order.createdAt).toLocaleString()}
                </p>

              </div>
            </div>

          </div>

          {/* CUSTOMER + ORDER DETAILS */}
          <div className="invoice-info">

            <div className="invoice-info-box">

              <h3>Customer Details</h3>

              <p>
                <b>Name:</b> {order.name || "-"}
              </p>

              <p>
                <b>Phone:</b> {order.phone || "-"}
              </p>

              <p>
                <b>Address:</b>{" "}
                {order.address?.full || "-"}
              </p>

              <p>
                <b>Area:</b>{" "}
                {order.address?.area || "-"}
              </p>

              <p>
                <b>District:</b>{" "}
                {order.address?.district || "-"}
              </p>

              <p>
                <b>State:</b>{" "}
                {order.address?.state || "-"}
              </p>

              <p>
                <b>Pincode:</b>{" "}
                {order.address?.pincode || "-"}
              </p>

            </div>


            <div className="invoice-info-box">

              <h3>Order Details</h3>

              <p>
                <b>Order ID:</b> {invoiceNumber}
              </p>

              <p>
                <b>Order Date:</b>{" "}
                {new Date(order.createdAt).toLocaleDateString()}
              </p>

              <p>
                <b>Status:</b>{" "}
                {order.status || "Pending"}
              </p>

              <p>
                <b>Payment:</b>{" "}
                {order.paymentMethod || "COD"}
              </p>

              <p>
                <b>Delivery Type:</b>{" "}
                {order.deliveryType || "Not Set"}
              </p>



            </div>

          </div>


          {/* BOOKS */}
          <div className="invoice-books invoice-books-admin">

            <h3>Order List</h3>

            <div className="invoice-items-header-admin">
              <span>Book</span>
              <span>Price</span>
              <span>Qty</span>
              <span>Amount</span>
            </div>

            {order.items.map((item, i) => {

              const price = item.bookId?.price || 0;
              const qty = item.qty || 0;
              const amount = price * qty;

              return (
                <div
                  key={i}
                  className="invoice-item-admin"
                >
                  <span>
                    {item.bookId?.title || "Book"}
                  </span>

                  <span>
                    Rs. {price}
                  </span>

                  <span>
                    {qty}
                  </span>

                  <span>
                    Rs. {amount}
                  </span>
                </div>
              );
            })}

          </div>


          {/* SUMMARY */}
          <div className="invoice-summary-admin">

            <div className="summary-row-admin">
              <span>Shipping Charges</span>

              <span>
                ₹ {shipping}
              </span>
            </div>

            <div className="summary-total summary-total-admin">

              <strong>
                Total
              </strong>

              <strong>
                ₹ {grandTotal}
              </strong>

            </div>

          </div>
          <div style={{ textAlign: "center", marginTop: "20px" }}>
            <span>★ ★ ★ ★ ★</span>
          </div>
        </div>


        {/* BUTTONS */}
        <div className="invoice-buttons">

          <button onClick={handlePDF}>
            Download PDF
          </button>

          <button onClick={handlePrint}>
            Print
          </button>

        </div>

      </div>

    </div>
  );
}