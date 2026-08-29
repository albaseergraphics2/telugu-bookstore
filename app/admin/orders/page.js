"use client";
import Link from "next/link";
import { useState } from "react";
import toast from "react-hot-toast";
import useRealtime from "../../hooks/useRealtime";

export default function AdminOrders() {

  const [orders, setOrders] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 10;
  const [orderFilter, setOrderFilter] = useState("all");
  const [selectedDate, setSelectedDate] = useState("");
  const today = new Date().toISOString().split("T")[0];
  const [orderSearch, setOrderSearch] = useState("");
  const fetchOrders = async () => {
    const res = await fetch("/api/admin/orders");
    const data = await res.json();
    if (data.success) {
      setOrders(data.orders);
    }
  };

  useRealtime(fetchOrders);

  const updateStatus = async (id, status, deliveryType, deliveryCharge) => {
    const toastId = toast.loading("Updating order...");

    try {
      const res = await fetch("/api/admin/orders", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
          status,
          deliveryType,
          deliveryCharge,
        }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success("Order updated successfully", { id: toastId });
      } else {
        toast.error(data.message || "Failed to update order", {
          id: toastId,
        });
      }
    } catch (error) {
      toast.error("Something went wrong", {
        id: toastId,
      });
    }
  };

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

  const search = orderSearch.toLowerCase().trim();

  const filteredOrders = [...orders]
    .filter((order) => {

      // SEARCH
      if (search) {
        const orderId = (
          order.invoiceId ||
          order._id ||
          ""
        ).toString().toLowerCase();

        const name = (
          order.name ||
          ""
        ).toLowerCase();

        const phone = (
          order.phone ||
          ""
        ).toString().toLowerCase();

        const address = [
          order.address?.full,
          order.address?.area,
          order.address?.district,
          order.address?.state,
          order.address?.pincode,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        if (
          !orderId.includes(search) &&
          !name.includes(search) &&
          !phone.includes(search) &&
          !address.includes(search)
        ) {
          return false;
        }
      }

      // DATE FILTER
      if (selectedDate) {
        const orderDate = new Date(order.createdAt);

        const year = orderDate.getFullYear();
        const month = String(orderDate.getMonth() + 1).padStart(2, "0");
        const day = String(orderDate.getDate()).padStart(2, "0");

        const orderDateString = `${year}-${month}-${day}`;

        if (orderDateString !== selectedDate) {
          return false;
        }
      }

      // STATUS FILTER
      if (orderFilter === "pending") {
        return order.status === "Pending";
      }

      if (orderFilter === "shipped") {
        return order.status === "Shipped";
      }

      if (orderFilter === "completed") {
        return order.status === "Completed";
      }

      if (orderFilter === "cancelled") {
        return order.status === "Cancelled";
      }

      return true;
    })
    .sort((a, b) => {

      if (orderFilter === "newest") {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }

      if (orderFilter === "oldest") {
        return new Date(a.createdAt) - new Date(b.createdAt);
      }

      if (orderFilter === "high-amount") {
        const amountA =
          (a.totalAmount || 0) + (a.deliveryCharge || 0);

        const amountB =
          (b.totalAmount || 0) + (b.deliveryCharge || 0);

        return amountB - amountA;
      }

      if (orderFilter === "low-amount") {
        const amountA =
          (a.totalAmount || 0) + (a.deliveryCharge || 0);

        const amountB =
          (b.totalAmount || 0) + (b.deliveryCharge || 0);

        return amountA - amountB;
      }

      if (orderFilter === "most-books") {
        const booksA =
          a.items?.reduce(
            (total, item) => total + (item.qty || 0),
            0
          ) || 0;

        const booksB =
          b.items?.reduce(
            (total, item) => total + (item.qty || 0),
            0
          ) || 0;

        return booksB - booksA;
      }

      if (orderFilter === "least-books") {
        const booksA =
          a.items?.reduce(
            (total, item) => total + (item.qty || 0),
            0
          ) || 0;

        const booksB =
          b.items?.reduce(
            (total, item) => total + (item.qty || 0),
            0
          ) || 0;

        return booksA - booksB;
      }

      return 0;
    });

  const indexOfLast = currentPage * ordersPerPage;
  const indexOfFirst = indexOfLast - ordersPerPage;

  const currentOrders = filteredOrders.slice(
    indexOfFirst,
    indexOfLast
  );

  const totalPages = Math.ceil(
    filteredOrders.length / ordersPerPage
  );

  return (
    <div className="admin-orders">
      <div className="orders-header">
        <h3>
          All Orders
        </h3>
        <div className="orders-filter-area">

          {/* SEARCH */}
          <div className="orders-search-box">
            <input
              type="text"
              className="orders-search"
              placeholder="Search Order...."
              value={orderSearch}
              onChange={(e) => {
                setOrderSearch(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          <div className="orders-filter-area-box">

            {/* SORT / FILTER */}
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
                <option value="shipped">Shipped Orders</option>
                <option value="completed">Completed Orders</option>
                <option value="cancelled">Cancelled Orders</option>
              </select>
            </div>

            {/* DATE */}
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

          {/* CLEAR FILTER */}
          {(orderFilter !== "all" ||
            selectedDate ||
            orderSearch) && (
              <button
                className="clear-order-filter"
                onClick={() => {
                  setOrderFilter("all");
                  setSelectedDate("");
                  setOrderSearch("");
                  setCurrentPage(1);
                }}
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
            No orders found
          </p>
        </div>
      ) : (
        <>
          <hr />
          {/* DESKTOP ORDERS TABLE */}
          <div className="orders-table desktop-orders-table">

            {currentOrders.map((order) => (
              <div key={order._id} className="order-row">

                <div className="adminorders-card">
                  <p><b>Order ID:</b> {order.invoiceId || order._id.slice(-6).toUpperCase()}</p>
                  <p><b>Date: </b>{new Date(order.createdAt).toLocaleString()}</p>
                </div>

                <div className="adminorders-cardname">
                  <p><b>Name:</b> {order.name}</p>
                  <p><b>Phone No:</b> {order.phone}</p>
                  <p><b>Address: </b>{order.address?.full || "-"}, {order.address?.pincode || "-"}</p>
                </div>

                <div className="admin-box">
                  <div className="admin-invoice1">
                    <div className="admin-invoice-items-header">
                      <span>Book</span>
                      <span>Qty</span>
                      <span>Price</span>
                    </div>

                    {order.items.map((item, i) => (
                      <div key={i} className="admin-invoice-item">
                        <span>{item.bookId?.title || "Book"}</span>
                        <span>{item.qty}</span>
                        <span>₹ {item.bookId?.price || 0}</span>
                      </div>
                    ))}

                    <div className="admin-order-summary">
                      {/* <div className="admin-invoice-item-total">
                        <span>Total</span>
                        <span>₹ {order.totalAmount || 0}</span>
                      </div> */}

                      <div className="admin-invoice-item-total">
                        <span>Delivery Charges</span>
                        <span>₹ {order.deliveryCharge || 0}</span>
                      </div>

                      <div className="admin-invoice-item-total">
                        <strong>Total</strong>
                        <strong>
                          ₹ {(order.totalAmount || 0) + (order.deliveryCharge || 0)}
                        </strong>
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
                        setOrders(prev =>
                          prev.map(o =>
                            o._id === order._id
                              ? { ...o, deliveryType: e.target.value }
                              : o
                          )
                        );
                      }}
                    />

                    <input
                      className="delivery-input"
                      type="number"
                      placeholder="Delivery Charges"
                      value={order.deliveryCharge || ""}
                      onChange={(e) => {
                        setOrders(prev =>
                          prev.map(o =>
                            o._id === order._id
                              ? {
                                ...o,
                                deliveryCharge: Number(e.target.value)
                              }
                              : o
                          )
                        );
                      }}
                    />

                    <button
                      className="save-delivery-btn"
                      onClick={() =>
                        updateStatus(
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
                  <p className="statusadmin"><b>Status: </b>{order.status}</p>
                  <div className="admin-box">
                    <div className="order-actions">
                      <button
                        onClick={() =>
                          updateStatus(
                            order._id,
                            "Completed",
                            order.deliveryType,
                            order.deliveryCharge
                          )
                        }
                      >
                        Complete
                      </button>

                      <button
                        onClick={() =>
                          updateStatus(
                            order._id,
                            "Pending",
                            order.deliveryType,
                            order.deliveryCharge
                          )
                        }
                      >
                        Pending
                      </button>

                      <button
                        onClick={() =>
                          updateStatus(
                            order._id,
                            "Shipped",
                            order.deliveryType,
                            order.deliveryCharge
                          )
                        }
                      >
                        Shipped
                      </button>

                      <button
                        onClick={() =>
                          updateStatus(
                            order._id,
                            "Cancelled",
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
                        <button>View Invoice</button>
                      </Link>

                      <button onClick={() => handlePrint(order)}>
                        Print address slip
                      </button>
                    </div>

                  </div>
                </div>


              </div>
            ))}
          </div>



          {/* MOBILE ORDERS TABLE */}
          <div className="orders-table mobile-orders-table">

            {currentOrders.map((order) => (
              <div key={order._id} className="order-row">

                <div className="adminorders-card">
                  <p><b>Order ID:</b> {order.invoiceId || order._id.slice(-6).toUpperCase()}</p>
                  <p><b>Date: </b>{new Date(order.createdAt).toLocaleString()}</p>
                </div>

                <div className="adminorders-cardname">
                  <p><b>Name:</b> {order.name}</p>
                  <p><b>Phone No:</b> {order.phone}</p>
                  <p><b>Address: </b>{order.address?.full || "-"}, {order.address?.pincode || "-"}</p>
                </div>

                <div>
                  <b>Delivery Type & Charges</b>
                  <div className="deliveryinputbox">
                    <div className="deliveryinputbox1">
                      <input
                        className="delivery-input"
                        type="text"
                        placeholder="Delivery Type"
                        value={order.deliveryType || ""}
                        onChange={(e) => {
                          setOrders(prev =>
                            prev.map(o =>
                              o._id === order._id
                                ? { ...o, deliveryType: e.target.value }
                                : o
                            )
                          );
                        }}
                      />

                      <input
                        className="delivery-input"
                        type="number"
                        placeholder="Delivery Charges"
                        value={order.deliveryCharge || ""}
                        onChange={(e) => {
                          setOrders(prev =>
                            prev.map(o =>
                              o._id === order._id
                                ? { ...o, deliveryCharge: Number(e.target.value) }
                                : o
                            )
                          );
                        }}
                      />
                    </div>
                    <div>
                      <button
                        className="save-delivery-btn"
                        onClick={() =>
                          updateStatus(
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
                </div>

                <div className="admin-invoice-items-header">
                  <span>Book</span>
                  <span>Qty</span>
                  <span>Price</span>
                </div>

                {order.items.map((item, i) => (
                  <div key={i} className="admin-invoice-item">
                    <span>{item.bookId?.title || "Book"}</span>
                    <span>{item.qty}</span>
                    <span>₹ {item.bookId?.price || 0}</span>
                  </div>
                ))}

                <div className="admin-order-summary">
                  <div className="admin-invoice-item-total">
                    <span>Delivery Charges</span>
                    <span>₹ {order.deliveryCharge || 0}</span>
                  </div>

                  <div className="admin-invoice-item-total">
                    <strong>total</strong>
                    <strong>
                      ₹ {(order.totalAmount || 0) + (order.deliveryCharge || 0)}
                    </strong>
                  </div>
                </div>


                <div className="admin-Status-mobile">
                  <p><b>Status: </b>{order.status}</p>
                  <div className="order-actions">
                    <button
                      onClick={() =>
                        updateStatus(
                          order._id,
                          "Completed",
                          order.deliveryType,
                          order.deliveryCharge
                        )
                      }
                    >
                      Complete
                    </button>

                    <button
                      onClick={() =>
                        updateStatus(
                          order._id,
                          "Pending",
                          order.deliveryType,
                          order.deliveryCharge
                        )
                      }
                    >
                      Pending
                    </button>

                    <button
                      onClick={() =>
                        updateStatus(
                          order._id,
                          "Shipped",
                          order.deliveryType,
                          order.deliveryCharge
                        )
                      }
                    >
                      Shipped
                    </button>

                    <button
                      onClick={() =>
                        updateStatus(
                          order._id,
                          "Cancelled",
                          order.deliveryType,
                          order.deliveryCharge
                        )
                      }
                    >
                      Cancel
                    </button>
                  </div>
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
      )
      }
    </div >

  );
}