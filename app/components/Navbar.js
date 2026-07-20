"use client";

import Link from 'next/link'
import { useEffect, useState } from "react";
import { FaWhatsapp, FaBook, FaShoppingCart} from "react-icons/fa";
import { useRouter } from "next/navigation";
import AuthPopup from "./AuthPopup";
import { useDispatch, useSelector } from "react-redux";
import { logout, loadUser } from "@/redux/actions/authActions";


export default function Navbar() {
  const router = useRouter();
  const whatsappNumber = "919441055065";
  const message = "Hello, I want to enquire about books.";
  const whatsappURL = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

  const [showLogin, setShowLogin] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const dispatch = useDispatch();

  const { user, isAuthenticated } = useSelector(
    (state) => state.auth
  );

  const { cartItems } = useSelector(
    (state) => state.cart
  );

  useEffect(() => {
    dispatch(loadUser());
  }, [dispatch]);

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
              <span>Telugu </span>
              <span> Bookstore</span>
            </h2>
          </Link>

          <div className="nav-links">

            <a href={whatsappURL} target="_blank" className="phone-number">
              <FaWhatsapp className="phone-icon" />
            </a>

            <Link href="/books" className="bar-itemD">
              <FaBook />
            </Link>

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
                  <span className={`arrow ${showUserMenu ? "open" : ""}`}>▼</span>
                </span>

                {showUserMenu && (
                  <div className="user-menu">
                    {user?.role === "admin" && (
                      <button onClick={() => router.push("/admin")} className="admin-btn">
                        Admin
                      </button>
                    )}

                    <button onClick={() => router.push("/orders")} className="admin-btn">
                      My Orders
                    </button>

                    <button onClick={() => router.push("/profile")} className="admin-btn">
                      My Profile
                    </button>

                    <button onClick={handleLogout}>
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button onClick={() => setShowLogin(true)} className="login-btn">
                Login
              </button>
            )}

          </div>
        </div>
      </nav>

      <AuthPopup
        show={showLogin}
        onClose={() => setShowLogin(false)}
      />
    </>
  );
}