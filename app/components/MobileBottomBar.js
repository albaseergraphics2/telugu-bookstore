
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

import { useLanguage } from "../context/LanguageContext";
import translations from "../context/translations";

export default function MobileBottomBar() {
  const pathname = usePathname();
  const { cartItems } = useSelector((state) => state.cart);

  const { language } = useLanguage();

  const labels = {
    en: {
      home: "Home",
      books: "Books",
      cart: "Cart",
      menu: "Menu",
    },
    te: {
      home: "హోమ్",
      books: "పుస్తకాలు",
      cart: "కార్ట్",
      menu: "మెనూ",
    },
  };

  const t = labels[language] || labels.en;

  return (
    <div className="mobile-bar">
      <Link
        href="/"
        className={`bar-item ${pathname === "/" ? "active" : ""}`}
      >
        <FaHome />
        <span>{t.home}</span>
      </Link>

      <Link
        href="/books"
        className={`bar-item ${
          pathname.startsWith("/books") ? "active" : ""
        }`}
      >
        <FaBook />
        <span>{t.books}</span>
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

        <span>{t.cart}</span>
      </Link>

      <Link
        href="/menu"
        className={`bar-item ${
          pathname.startsWith("/menu") ? "active" : ""
        }`}
      >
        <FaBars />
        <span>{t.menu}</span>
      </Link>
    </div>
  );
}
