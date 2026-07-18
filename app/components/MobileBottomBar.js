"use client";

import Link from "next/link";
import { useSelector } from "react-redux";
import {
  FaHome,
  FaShoppingCart,
  FaBars,
  FaBook,
} from "react-icons/fa";

export default function MobileBottomBar() {
  const { cartItems } = useSelector((state) => state.cart);

  return (
    <div className="mobile-bar">
      <Link href="/" className="bar-item">
        <FaHome />
        <span>Home</span>
      </Link>

      <Link href="/books" className="bar-item">
        <FaBook />
        <span>Books</span>
      </Link>

      <Link href="/cart" className="bar-item cart-icon">
        <div style={{ position: "relative" }}>
          <FaShoppingCart />
          {cartItems.length > 0 && (
            <span className="cart-badge">
              {cartItems.length}
            </span>
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