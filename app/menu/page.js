"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function Menu() {

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: "center", marginTop: "100px" }}>
        <div className="loader"></div>
        <p>Loading menu...</p>
      </div>
    );
  }

  return (
    <section className="menu-page">

      <h2 className="menu-title">Menu</h2>

      <h3 className="menu-heading">Services</h3>

      <div className="menu-list">

        <Link href="/aboutus" className="menu-item">
          <div>
            <h4>Printing</h4>
            <p>Book & bulk printing services</p>
          </div>
          <span>›</span>
        </Link>

        <Link href="/aboutus" className="menu-item">
          <div>
            <h4>Contact Us</h4>
            <p>Call or WhatsApp support</p>
          </div>
          <span>›</span>
        </Link>

        <Link href="/aboutus" className="menu-item">
          <div>
            <h4>About Us</h4>
            <p>Know about our bookstore</p>
          </div>
          <span>›</span>
        </Link>

      </div>

    </section>
  );
}