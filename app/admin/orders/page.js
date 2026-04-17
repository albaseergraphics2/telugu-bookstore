"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function AdminOrders() {

  const [orders, setOrders] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 10;

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    const res = await fetch("/api/admin/orders");
    const data = await res.json();

    if (data.success) {
      setOrders(data.orders);
    }
  };

  const updateStatus = async (id, status) => {
    await fetch("/api/admin/orders", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    fetchOrders();
  };

  const indexOfLast = currentPage * ordersPerPage;
  const indexOfFirst = indexOfLast - ordersPerPage;
  const currentOrders = orders.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(orders.length / ordersPerPage);

  const handlePrint = (order) => {
    const printWindow = window.open("", "", "width=600,height=400");

    printWindow.document.write(`
    <html>
      <head>
        <title>Address Slip</title>
        <style>
          body { font-family: Arial; padding: 20px; }
          .container { display: flex; justify-content: space-between; gap: 20px; }
          .box { width: 48%; padding: 10px; border-radius: 6px; }
          .title { font-weight: bold; margin-bottom: 10px; font-size: 16px; }
          .text { font-size: 16px; margin-bottom: 5px; }
        </style>
      </head>

      <body>
        <div class="container">

          <div class="box">
            <div class="title">From,</div>
            <div class="text"><b>Abdul Vakeel</b></div>
            <div class="text">Telugu Bookstore</div>
            <div class="text">Hyderabad, Telangana</div>
            <div class="text"><b>Phone:</b> 9441055065</div>
          </div>

          <div class="box">
            <div class="title">To,</div>
            <div class="text"><b>Name:</b> ${order.name}</div>
            <div class="text"><b>Address:</b> ${order.address?.full || ""}</div>
            <div class="text"><b>Pincode:</b> ${order.address?.pincode || ""}</div>
            <div class="text"><b>Phone:</b> ${order.phone}</div>
          </div>

        </div>
      </body>
    </html>
  `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="admin-orders">
      <h3>All Orders</h3>

      {orders.length === 0 ? (
        <p>No orders found</p>
      ) : (
        <>
          <div className="orders-table">

            {currentOrders.map((order) => (
              <div key={order._id} className="order-row">

                <p><b>Order ID: </b>{order._id}</p>
                <p><b>Date: </b>{new Date(order.createdAt).toLocaleString()}</p>

                <div>
                  <p><b>Name: </b>{order.name}</p>
                  <p><b>Phone No: </b>{order.phone}</p>
                </div>

                <div>
                  <p><b>Total: </b>₹{order.totalAmount}</p>
                  <p><b>Status: </b>{order.status}</p>
                </div>

                <div>
                  <p><b>Address: </b>{order.address?.full || "-"}, {order.address?.pincode || "-"}</p>
                </div>

                <div>
                  <b>List: </b>
                  {order.items.map((item, i) => (
                    <p key={i}>
                      {item.bookId?.title} Qty: {item.qty}
                    </p>
                  ))}
                </div>

                <div className="order-actions">
                  <button onClick={() => updateStatus(order._id, "Completed")}>
                    Complete
                  </button>
                  <button onClick={() => updateStatus(order._id, "Pending")}>
                    Pending
                  </button>
                  <button onClick={() => updateStatus(order._id, "Cancelled")}>
                    Cancel
                  </button>
                </div>

                <div className="admin-invoice-btns">
                  <Link href={`/invoice-admin/${order._id}`}>
                    <button>View Invoice</button>
                  </Link>

                  <button onClick={() => handlePrint(order)}>
                    Print address slip
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="pagination">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              Prev
            </button>

            <span>
              Page {currentPage} of {totalPages || 1}
            </span>

            <button
              disabled={currentPage === totalPages || totalPages === 0}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}