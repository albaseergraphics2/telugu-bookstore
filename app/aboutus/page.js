"use client";

import { useState, useEffect } from "react";
import AboutContact from "../components/AboutContact";
import Contactus from "../components/contactus";
import PrintingService from "../components/PrintingService";

export default function MenuPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 200);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: "center", marginTop: "100px" }}>
        <div className="loader"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="menu-page">
      <PrintingService />
      <AboutContact />
      <Contactus />
    </div>
  );
}