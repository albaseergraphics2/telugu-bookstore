
"use client";

import Link from 'next/link'
import { useEffect, useState } from "react";
import { FaWhatsapp, FaShoppingCart } from "react-icons/fa";
import { useRouter, usePathname } from "next/navigation";
import AuthPopup from "./AuthPopup";
import { useDispatch, useSelector } from "react-redux";
import { logout, loadUser } from "@/redux/actions/authActions";
import { useLanguage } from "../context/LanguageContext";
import translations from "../context/translations";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();

  const whatsappNumber = "919441055065";
  const message = "Hello, I want to enquire about books.";
  const whatsappURL = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

  const [showLogin, setShowLogin] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [categories, setCategories] = useState([]);

  const dispatch = useDispatch();

  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.cart);

  const { language, setLanguage } = useLanguage();
  const t = translations[language];

  useEffect(() => {
    dispatch(loadUser());
  }, [dispatch]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/books");
        const data = await res.json();

        if (data.success) {
          const formattedCategories = [
            ...new Map(
              data.books
                .filter((book) => book.category)
                .map((book) => {
                  const slug = book.category.toLowerCase().trim();

                  return [
                    slug,
                    {
                      name:
                        book.category.charAt(0).toUpperCase() +
                        book.category.slice(1),
                      teluguName:
                        book.teluguCategory || book.category,
                      slug,
                    },
                  ];
                })
            ).values(),
          ];

          setCategories(formattedCategories);
        }
      } catch (err) {
        console.log(err);
      }
    };

    fetchCategories();
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    router.push("/");
  };

  return (
    <>
      <nav>
        <div className="navbar1">
          <Link href="/" className="logo">
            <h2>
              {language === "te" ? (
                <>
                  <span>తెలుగు </span>
                  <span> బుక్‌స్టోర్</span>
                </>
              ) : (
                <>
                  <span>Telugu </span>
                  <span> Bookstore</span>
                </>
              )}
            </h2>
          </Link>

          <div className='nav-links-box'>
            <div className="nav-links">

              <a
                href={whatsappURL}
                target="_blank"
                rel="noopener noreferrer"
                className="phone-number"
              >
                <FaWhatsapp className="phone-icon" />
              </a>

              <Link href="/cart" className="bar-itemD cart-iconD">
                <div style={{ position: "relative" }}>
                  <FaShoppingCart />
                  {cartItems.length > 0 && (
                    <span className="cart-badge">
                      {cartItems.length}
                    </span>
                  )}
                </div>
              </Link>

              {isAuthenticated ? (

                <div className="user-dropdown">

                  <span
                    className="user-name"
                    onClick={() => setShowUserMenu(!showUserMenu)}
                  >
                    {user.name || user.username}

                    <span
                      className={`arrow ${showUserMenu ? "open" : ""}`}
                    >
                      ▼
                    </span>
                  </span>

                  {showUserMenu && (
                    <div className="user-menu">

                      {user?.role === "admin" && (
                        <button
                          onClick={() => router.push("/admin")}
                          className="admin-btn"
                        >
                          Admin
                        </button>
                      )}

                      <button
                        onClick={() => router.push("/orders")}
                        className="admin-btn"
                      >
                        My Orders
                      </button>

                      <button
                        onClick={() => router.push("/profile")}
                        className="admin-btn"
                      >
                        My Profile
                      </button>

                      <button onClick={handleLogout}>
                        Logout
                      </button>

                    </div>
                  )}

                </div>
              ) : (
                <button
                  onClick={() => setShowLogin(true)}
                  className="login-btn"
                >
                  Login
                </button>
              )}
            </div>

            <div className='nav-divider'></div>

            <div className="language-toggle">
              <button
                className={language === "en" ? "active" : ""}
                onClick={() => setLanguage("en")}
              >
                <span className="desktop-lang">English</span>
                <span className="mobile-lang">EN</span>
              </button>

              <button
                className={language === "te" ? "active" : ""}
                onClick={() => setLanguage("te")}
              >
                <span className="desktop-lang">తెలుగు</span>
                <span className="mobile-lang">తెలు</span>
              </button>
            </div>
          </div>
        </div>

        <div className="navbar2">

          <Link
            href="/"
            className={pathname === "/" ? "active" : ""}
          >
            {t.home}
          </Link>

          <Link
            href="/books"
            className={pathname === "/books" ? "active" : ""}
          >
            {t.books}
          </Link>

          {/* CATEGORIES BOOTSTRAP DROPDOWN */}
          <div className="dropdown d-inline-block">

            <button
              type="button"
              className="btn dropdown-toggle"
              data-bs-toggle="dropdown"
              data-bs-auto-close="true"
              aria-expanded="false"
            >
              {t.categories}
            </button>

            <ul className="dropdown-menu">

              {categories.map((category) => (
                <li key={category.slug}>
                  <Link
                    className="dropdown-item"
                    href={`/category/${category.slug}`}
                  >
                    {language === "te"
                      ? category.teluguName
                      : category.name}
                  </Link>
                </li>
              ))}

              {/* <li>
                <hr className="dropdown-divider" />
              </li> */}

              {/* <li>
                <Link
                  className="dropdown-item fw-semibold"
                  href="/categories"
                >
                  {language === "te"
                    ? "అన్ని వర్గాలు చూడండి"
                    : "View All Categories"}
                </Link>
              </li> */}

            </ul>
          </div>

          <Link
            href="/aboutus"
            className={pathname === "/aboutus" ? "active" : ""}
          >
            {t.about}
          </Link>

        </div>
      </nav>

      <a
        href={whatsappURL}
        target="_blank"
        rel="noopener noreferrer"
        className="whatsapp-float"
      >
        <FaWhatsapp className="phone-icon" />
      </a>

      <AuthPopup
        show={showLogin}
        onClose={() => setShowLogin(false)}
      />
    </>
  );
}
