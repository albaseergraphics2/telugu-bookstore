"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSelector } from "react-redux";
import {
  FaHome,
  FaShoppingCart,
  FaBars,
  FaBook,
} from "react-icons/fa";

export default function MobileBottomBar() {
  const pathname = usePathname();
  const { cartItems } = useSelector((state) => state.cart);

  return (
    <div className="mobile-bar">

      <Link
        href="/"
        className={`bar-item ${pathname === "/" ? "active" : ""}`}
      >
        <FaHome />
        <span>Home</span>
      </Link>

      <Link
        href="/books"
        className={`bar-item ${
          pathname.startsWith("/books") ? "active" : ""
        }`}
      >
        <FaBook />
        <span>Books</span>
      </Link>

      <Link
        href="/cart"
        className={`bar-item cart-icon ${
          pathname.startsWith("/cart") ? "active" : ""
        }`}
      >
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

      <Link
        href="/menu"
        className={`bar-item ${
          pathname.startsWith("/menu") ? "active" : ""
        }`}
      >
        <FaBars />
        <span>Menu</span>
      </Link>
    </div>
  );
}