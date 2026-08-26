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
    deliveryTotal: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const statsRes = await fetch("/api/admin/stats");

        if (statsRes.ok) {
          const statsData = await statsRes.json();

          if (statsData.success) {
            setStats(statsData.stats);
          }
        }

        const shippingRes = await fetch("/api/admin/settings");

        if (shippingRes.ok) {
          const shippingData = await shippingRes.json();

          if (shippingData.success) {
            setDefaultShipping(
              shippingData.setting?.defaultShipping || ""
            );
          }
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to load dashboard");
      }
    };

    fetchData();
  }, []);

  return (
    <div className="admin-dashboard">
      <h2>Dashboard</h2>

      <div className="analytics-grid">
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
          <p>₹{stats.deliveryTotal}</p>
        </div>

        <div className="analytics-card">
          <h3>Total Amount (With Delivery)</h3>
          <p>₹{stats.revenue + stats.deliveryTotal}</p>
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