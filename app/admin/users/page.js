"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminUsers() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const usersPerPage = 10;

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (data.success) {
        setUsers(data.users);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load orders.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", marginTop: "60px" }}>
        <div className="loader"></div>
        <p>Loading Customers...</p>
      </div>
    );
  }

  /* FILTER USERS */
  const filteredUsers = users.filter((user) =>
    user.name?.toLowerCase().includes(search.toLowerCase()) ||
    user.phone?.includes(search) ||
    user.address?.full
      ?.toLowerCase()
      .includes(search.toLowerCase()) ||
    user.address?.pincode?.includes(search)
  );

  /* PAGINATION */
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  return (
    <div className="admin-users">
      <div className="users-header">
        <h2>Customers</h2>
        <span>Total: {filteredUsers.length}</span>
      </div>

      <div style={{ marginBottom: "15px" }} className="search-box">
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
          style={{
            padding: "8px",
            width: "250px",
          }}
        />
      </div>

      {/*   DESKTOP USERS TABLE */}
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
            <div>Rs. {user.totalAmount}</div>
            <div>
              <button
                onClick={() =>
                  router.push(`/admin/users/${user._id}/orders`)
                }
                className="adminuserorderlist"
              >
                View Orders
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* MOBILE USERS*/}
      <div className="users-mobile">
        {currentUsers.map((user) => (
          <div key={user._id} className="user-mobile-card" >
            <div className="user-mobile-row">
              <span>Name</span>
              <strong>{user.name || "-"}</strong>
            </div>
            <div className="user-mobile-row">
              <span>Phone</span>
              <strong>{user.phone || "-"}</strong>
            </div>
            <div className="user-mobile-row">
              <span>Address</span>
              <strong>{user.address?.full || "-"}</strong>
            </div>
            <div className="user-mobile-row">
              <span>Area</span>
              <strong>{user.address?.area || "-"}</strong>
            </div>
            <div className="user-mobile-row">
              <span>District</span>
              <strong>{user.address?.district || "-"}</strong>
            </div>
            <div className="user-mobile-row">
              <span>State</span>
              <strong>{user.address?.state || "-"}</strong>
            </div>
            <div className="user-mobile-row">
              <span>Pincode</span>
              <strong>{user.address?.pincode || "-"}</strong>
            </div>
            <div className="user-mobile-row">
              <span>Orders</span>
              <strong>{user.ordersCount || 0}</strong>
            </div>
            <div className="user-mobile-row">
              <span>Total</span>
              <strong>Rs. {user.totalAmount || 0}</strong>
            </div>
            <div className="user-mobile-action">
              <button
                onClick={() =>
                  router.push(`/admin/users/${user._id}/orders`)
                }
                className="adminuserorderlist"
              >
                View Orders
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* PAGINATION */}
      <div className="pagination">
        <button
          disabled={currentPage === 1}
          onClick={() =>
            setCurrentPage(currentPage - 1)
          }
        >
          Prev
        </button>

        <span
          style={{ margin: "0 10px", }}
        >
          Page {currentPage} of{" "}
          {totalPages || 1}
        </span>

        <button
          disabled={currentPage === totalPages || totalPages === 0}
          onClick={() =>
            setCurrentPage(currentPage + 1)
          }
        >
          Next
        </button>
      </div>
    </div>
  );
}