"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FaHome, FaHeart, FaShoppingCart, FaBars, FaBook } from "react-icons/fa";

export default function MobileBottomBar() {
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const updateCart = () => {
      const cart = JSON.parse(localStorage.getItem("cart")) || [];
      setCartCount(cart.length);
    };
    updateCart();
    window.addEventListener("cartUpdated", updateCart);
    return () => {
      window.removeEventListener("cartUpdated", updateCart);
    };
  }, []);

  return (
    <div className="mobile-bar">

      <Link href="/" className="bar-item">
        <FaHome />
        <span>Home</span>
      </Link>

      {/* <Link href="/favorites" className="bar-item">
        <FaHeart />
        <span>Fav</span>
      </Link> */}

      <Link href="/books" className="bar-item">
        <FaBook />
        <span>Books</span>
      </Link>

      <Link href="/cart" className="bar-item cart-icon">
        <div style={{ position: "relative" }}>
          <FaShoppingCart />
          {cartCount > 0 && (
            <span className="cart-badge">{cartCount}</span>
          )}
        </div>
        <span>Cart</span>
      </Link>

      <Link href="/menu" className="bar-item">
        <FaBars />
        <span>Menu</span>
      </Link>

    </div>
  );
}