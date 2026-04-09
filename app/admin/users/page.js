"use client";

import { useEffect, useState } from "react";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [showOrdersPopup, setShowOrdersPopup] = useState(false);
  const [userOrders, setUserOrders] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  // ✅ SEARCH + PAGINATION
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const res = await fetch("/api/admin/users");
    const data = await res.json();
    if (data.success) setUsers(data.users);
  };

  const fetchUserOrders = async (userId, userName) => {
    const res = await fetch(`/api/orders?userId=${userId}`);
    const data = await res.json();

    if (data.success) {
      setUserOrders(data.orders);
      setSelectedUser(userName);
      setShowOrdersPopup(true);
    }
  };

  // ✅ FILTER USERS
  const filteredUsers = users.filter((user) =>
    user.name?.toLowerCase().includes(search.toLowerCase()) ||
    user.phone?.includes(search) ||
    user.address?.full?.toLowerCase().includes(search.toLowerCase()) ||
    user.address?.pincode?.includes(search)
  );

  // ✅ PAGINATION
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  return (
    <div className="admin-users">

      <div className="users-header">
        <h2>Users</h2>
        <span>Total: {filteredUsers.length}</span>
      </div>

      {/* ✅ SEARCH */}
      <div style={{ marginBottom: "15px" }} className="search-box">
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
          style={{ padding: "8px", width: "250px" }}
        />
      </div>

      <div className="users-table">

        <div className="table-row table-header">
          <div>Name</div>
          <div>Phone</div>
          <div>Address</div>
          <div>Area</div>
          <div>District</div>
          <div>State</div>
          <div>Pincode</div>
          <div>Orders</div>
          <div>Total</div>
          <div>Action</div>
        </div>

        {currentUsers.map((user) => (
          <div key={user._id} className="table-row">

            <div>{user.name}</div>
            <div>{user.phone || "-"}</div>

            <div>{user.address?.full || "-"}</div>
            <div>{user.address?.area || "-"}</div>
            <div>{user.address?.district || "-"}</div>
            <div>{user.address?.state || "-"}</div>
            <div>{user.address?.pincode || "-"}</div>

            <div>{user.ordersCount}</div>
            <div>₹{user.totalAmount}</div>

            <div>
              <button
                onClick={() => fetchUserOrders(user._id, user.name)}
                className="adminuserorderlist"
              >
                View Orders
              </button>
            </div>

          </div>
        ))}

      </div>

      {/* ✅ PAGINATION */}
      <div className="pagination">
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(currentPage - 1)}
        >
          Prev
        </button>

        <span style={{ margin: "0 10px" }}>
          Page {currentPage} of {totalPages || 1}
        </span>

        <button
          disabled={currentPage === totalPages || totalPages === 0}
          onClick={() => setCurrentPage(currentPage + 1)}
        >
          Next
        </button>
      </div>

      {/* POPUP */}
      {showOrdersPopup && (
        <div
          className="popup-overlay"
          onClick={() => {
            setShowOrdersPopup(false);
            setSelectedUser(null);
          }}
        >
          <div
            className="popup"
            onClick={(e) => e.stopPropagation()}
            style={{ maxHeight: "80vh", overflowY: "auto" }}
          >
            <h3>{selectedUser || "User"} Orders</h3>

            {userOrders.length === 0 ? (
              <p>No orders found</p>
            ) : (
              userOrders.map((order) => (
                <div
                  key={order._id}
                  style={{
                    borderBottom: "1px solid #858282",
                    padding: "10px 0",
                  }}
                >
                  <p><b>Order ID:</b> {order._id}</p>
                  <p><b>Date:</b> {new Date(order.createdAt).toLocaleString()}</p>
                  <p><b>Total:</b> ₹{order.totalAmount}</p>
                  <p><b>Status:</b> {order.status}</p>

                  {order.items.map((item, i) => (
                    <p key={i}>
                      {item.bookId?.title} (Qty: {item.qty})
                    </p>
                  ))}
                </div>
              ))
            )}

            <button
              onClick={() => {
                setShowOrdersPopup(false);
                setSelectedUser(null);
              }}
              className="close"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}