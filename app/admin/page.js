"use client";

import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

export default function AdminDashboard() {
  const [defaultShipping, setDefaultShipping] = useState("");
  const [stats, setStats] = useState({
    users: 0,
    orders: 0,
    revenue: 0,
    pending: 0,
    completed: 0,
    todayOrders: 0,
    todayRevenue: 0,
    avgOrderValue: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      const statsRes = await fetch("/api/admin/stats");
      const statsData = await statsRes.json();

      if (statsData.success) {
        setStats(statsData.stats);
      }

      const shippingRes = await fetch("/api/admin/settings/shipping");
      const shippingData = await shippingRes.json();

      if (shippingData.success) {
        setDefaultShipping(shippingData.defaultShipping);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="admin-dashboard">

      <h2>Dashboard</h2>
      <p>Welcome Admin 👑</p>

      <div className="analytics-grid">
        {/* <div className="analytics-card">
          <h3>Default Shipping Charges</h3>

          <input
            type="number"
            className="shipping-input"
            placeholder="Enter Charges"
            value={defaultShipping}
            onChange={(e) => setDefaultShipping(e.target.value)}
          />

          <div className="shipping-btns">
            <button className="save-btn" onClick={saveShippingCharge}>
              Save
            </button>

            <button className="clear-btn" onClick={clearShippingCharge}>
              Clear
            </button>
          </div>

        </div> */}
        <div className="analytics-card">
          <h3>Total Users</h3>
          <p>{stats.users}</p>
        </div>

        <div className="analytics-card">
          <h3>Total Orders</h3>
          <p>{stats.orders}</p>
        </div>

        <div className="analytics-card">
          <h3>Total Income</h3>
          <p>₹{stats.revenue}</p>
        </div>

        <div className="analytics-card">
          <h3>Total Delivery Charges</h3>
          <p>₹{stats.deliveryTotal || 0}</p>
        </div>

        <div className="analytics-card">
          <h3>Total Amount (With Delivery)</h3>
          <p>₹{(stats.revenue || 0) + (stats.deliveryTotal || 0)}</p>
        </div>
        <div className="analytics-card">
          <h3>Pending Orders</h3>
          <p>{stats.pending}</p>
        </div>

        <div className="analytics-card">
          <h3>Completed Orders</h3>
          <p>{stats.completed}</p>
        </div>

        <div className="analytics-card">
          <h3>Today's Orders</h3>
          <p>{stats.todayOrders}</p>
        </div>

        <div className="analytics-card">
          <h3>Today's Revenue</h3>
          <p>₹{stats.todayRevenue}</p>
        </div>

        <div className="analytics-card">
          <h3>Avg Order Value</h3>
          <p>₹{stats.avgOrderValue}</p>
        </div>
      </div>
    </div>
  );
}