"use client";

import { useEffect, useState } from "react";

export default function AdminDashboard() {

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
    const fetchStats = async () => {
      const res = await fetch("/api/admin/stats");
      const data = await res.json();

      if (data.success) {
        setStats(data.stats);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="admin-dashboard">

      <h2>Dashboard</h2>
      <p>Welcome Admin 👑</p>

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